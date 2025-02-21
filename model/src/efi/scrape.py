"""
Classes to scrape and retrieve data.
"""

import pandas as pd
import re
import requests
import time
from . import db
from .data import Match, TransferValue, Event, Club_Competition
from datetime import datetime, timezone, date, timedelta
from decimal import Decimal, ROUND_HALF_UP
from lxml import html


HEADERS = {
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
}


class Transfermarkt:
    UNIT_CONVERSION = {"k": 1000, "m": 1000000, "bn": 1000000000}

    def __init__(self):
        pass

    def get_transfer_values(
        self, competition_id: int, season: int
    ) -> list[TransferValue]:
        """Scrapes each club's transfer values at beginning of given competition and season.

        Args:
            competition_id (int): competition's db id, ex. 1 for Premier League
            season (int): earlier year of season (ex. 2016 means 2016/17)

        Returns:
            list[TransferValue]: list of TransferValue, to be inserted into db
        """
        clubs = db.get_clubs(competition_id, season)
        transfer_values: list[TransferValue] = []
        for club in clubs:
            r = requests.get(
                f"https://www.transfermarkt.us/{club.transfermarkt_path}/kader/verein/{club.transfermarkt_id}/plus/0/galerie/0?saison_id={season - 1}",
                headers=HEADERS,
            )
            doc = html.document_fromstring(r.text)

            tv = TransferValue(
                club_id=club.id,
                season=season,
                off_value=Decimal(0),
                def_value=Decimal(0),
            )

            for i, td in enumerate(
                doc.xpath(
                    "//span[text()='Squad details by position']/following-sibling::table/tbody//td[@class='rechts'][1]"
                )
            ):
                value = Decimal(re.sub(r"[^\d\.]", "", td.text))
                match = re.search("k|m|bn", td.text)
                if match is None:
                    raise Exception(
                        f"Unit not recognized in Transfermarkt value ({season-1} {club.name}): {td.text}"
                    )
                unit = td.text[match.start() : match.end()]
                if i < 2:
                    tv.def_value += value * Decimal(self.UNIT_CONVERSION[unit])
                else:
                    tv.off_value += value * Decimal(self.UNIT_CONVERSION[unit])
            tv.off_value.quantize(Decimal(".01"), ROUND_HALF_UP)
            tv.def_value.quantize(Decimal(".01"), ROUND_HALF_UP)
            transfer_values.append(tv)

        return transfer_values


class Fotmob:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(HEADERS)
        cookie = self.session.get("http://46.101.91.154:6006/")
        self.session.headers.update(cookie.json())

    def __fotmob_timestamp_to_datetime(self, timestamp: str) -> datetime:
        """Converts FotMob timestamp string to datetime object.

        Args:
            timestamp (str): FotMob timestamp string

        Raises:
            ValueError: Passed timestamp has invalid format

        Returns:
            datetime: converted datetime object with UTC timezone
        """
        formats = ["%Y-%m-%dT%H:%M:%SZ", "%Y-%m-%dT%H:%M:%S.%fZ"]
        for format in formats:
            try:
                return datetime.strptime(timestamp, format).replace(tzinfo=timezone.utc)
            except ValueError:
                pass

        raise ValueError("Invalid timestamp format")

    def get_clubs_competitions(
        self, competition_id: int, season: int
    ) -> list[Club_Competition]:
        """Gets clubs in given competition's season.

        Args:
            competition_id (int): competition's db id, ex. 1 for Premier League
            season (int): earlier year of season (ex. 2016 means 2016/17)

        Raises:
            ValueError: Invalid competition id

        Returns:
            list[Club_Competition]: list of Club_Competition
        """
        competition = db.get_competition_by_id(competition_id)
        if competition is None:
            raise ValueError(
                f"Invalid competition id: {competition_id} is not in database"
            )
        r = self.session.get(
            f"https://www.fotmob.com/api/leagues?id={competition.fotmob_id}&season={season}/{season+1}"
        )
        data = r.json()
        return [
            Club_Competition(
                season=season,
                competition_id=competition_id,
                club_id=db.get_club_by_fotmob_id(str(t["id"])).id,  # type: ignore - returned Club id cannot be None
            )
            for t in data["table"][0]["data"]["table"]["all"]
        ]

    def get_season_avgs(
        self, competition_id: int, season: int
    ) -> dict[int, tuple[float, float]]:
        """Gets avg GS and GA per team in given competition and season.

        Args:
            competition_id (int): competition's db id, ex. 1 for Premier League
            season (int): earlier year of season (ex. 2016 means 2016/17)

        Returns:
            dict[int, tuple[float, float]]: club id -> (avg_gs, avg_ga)
        """
        competition = db.get_competition_by_id(competition_id)
        if competition is None:
            raise ValueError(
                f"Invalid competition id: {competition_id} is not in database"
            )
        r = self.session.get(
            f"https://www.fotmob.com/api/leagues?id={competition.fotmob_id}&season={season}/{season+1}"
        )
        data = r.json()
        d = {}
        for t in data["table"][0]["data"]["table"]["all"]:
            club = db.get_club_by_fotmob_id(str(t["id"]))
            if club is None:
                # club is not in database
                continue
            mp = t["played"]
            gs, ga = [int(v) for v in t["scoresStr"].split("-")]
            d[club.id] = (gs / mp, ga / mp)
        return d

    def get_home_advantage(self, competition_id: int) -> pd.DataFrame:
        competition = db.get_competition_by_id(competition_id)
        if competition is None:
            raise ValueError(
                f"Invalid competition id: {competition_id} is not in database"
            )
        stats = []
        for season in range(2014, 2024):
            r = self.session.get(
                f"https://www.fotmob.com/api/leagues?id={competition.fotmob_id}&season={season}/{season+1}"
            )
            data = r.json()

            total_home_gs = 0
            total_away_gs = 0
            total_mp = 0
            for t in data["table"][0]["data"]["table"]["home"]:
                total_home_gs += int(t["scoresStr"].split("-")[0])
                total_away_gs += int(t["scoresStr"].split("-")[1])
                total_mp += t["played"]
            avg_home_gs = total_home_gs / total_mp
            avg_away_gs = total_away_gs / total_mp
            avg_gs = (total_home_gs + total_away_gs) / (2 * total_mp)
            stats.append(
                (
                    season,
                    avg_home_gs,
                    avg_away_gs,
                    avg_gs,
                    avg_home_gs - avg_gs,
                    total_mp,
                )
            )

        return pd.DataFrame(
            stats,
            columns=["season", "avg_home_gs", "avg_away_gs", "avg_gs", "ha", "mp"],
        )

    def get_all_matches(self, competition_id: int, season: int) -> list[Match]:
        """Gets all matches in given competition and season.

        Args:
            competition_id (int): competition's db id, ex. 1 for Premier League
            season (int): earlier year of season (ex. 2016 means 2016/17)

        Returns:
            list[Match]: list of Match with no match stats
        """
        competition = db.get_competition_by_id(competition_id)
        if competition is None:
            raise ValueError(
                f"Invalid competition id: {competition_id} is not in database"
            )
        r = self.session.get(
            f"https://www.fotmob.com/api/leagues?id={competition.fotmob_id}&season={season}/{season+1}",
        )
        data = r.json()
        return [
            Match(
                competition_id=competition_id,
                season=season,
                matchweek=m["roundName"],
                time=self.__fotmob_timestamp_to_datetime(m["status"]["utcTime"]),
                completed=m["status"]["finished"],
                neutral=False,
                club_id_1=db.get_club_by_fotmob_id(m["home"]["id"]).id,  # type: ignore - returned Club id cannot be None
                club_id_2=db.get_club_by_fotmob_id(m["away"]["id"]).id,  # type: ignore - returned Club id cannot be None
                fotmob_id=m["id"],
            )
            for m in data["matches"]["allMatches"]
            # if not m["status"]["cancelled"] and isinstance(m["roundName"], int)
            if isinstance(m["roundName"], int)
        ]

    # def get_home_table(self, season: int, fotmob_competition_id: int = 47):
    #     r = self.session.get(
    #         f"https://www.fotmob.com/api/leagues?id={fotmob_competition_id}&season={season}/{season+1}"
    #     )
    #     data = r.json()
    #     return data["table"][0]["data"]["table"]["home"]

    def get_completed_match_stats(
        self, competition_id: int, season: int, fotmob_match_id: str
    ) -> Match:
        """Gets stats from completed match with given FotMob id.

        Args:
            competition_id (int): competition's db id, ex. 1 for Premier League
            season (int): earlier year of season (ex. 2016 means 2016/17)
            fotmob_match_id (str): FotMob match id

        Raises:
            ValueError: invalid FotMob id or match not yet completed

        Returns:
            Match: a Match with scores, xg, ag, and events
        """
        r = self.session.get(
            f"https://www.fotmob.com/api/matchDetails?matchId={fotmob_match_id}",
        )
        data = r.json()

        if "error" in data:
            raise ValueError(f"Invalid FotMob match id: {fotmob_match_id}")

        completed = data["general"]["finished"]

        if not completed:
            raise ValueError(
                f"Match with FotMob id {fotmob_match_id} not yet completed"
            )

        fotmob_id_1 = data["general"]["homeTeam"]["id"]
        fotmob_id_2 = data["general"]["awayTeam"]["id"]
        # season = int(data["general"]["parentLeagueSeason"][:4])
        matchweek = int(data["general"]["matchRound"])
        time = self.__fotmob_timestamp_to_datetime(data["general"]["matchTimeUTCDate"])
        score_1 = data["header"]["teams"][0]["score"]
        score_2 = data["header"]["teams"][1]["score"]

        stat = next(
            (
                s
                for s in data["content"]["stats"]["Periods"]["All"]["stats"][0]["stats"]
                if s["key"] == "expected_goals"
            ),
            None,
        )
        xg = [float(s) for s in stat["stats"]] if stat else [None, None]

        events: list[Event] = []
        events = [
            Event(
                team=0 if e["isHome"] else 1,
                type=e["type"],
                minute=e["time"],
            )
            for e in data["content"]["matchFacts"]["events"]["events"]
            if (
                e["type"] == "Goal"
                or (
                    e["type"] == "Card"
                    and (e["card"] == "Red" or e["card"] == "YellowRed")
                )
            )
        ]

        sending_offs = [0, 0]
        scores = [0, 0]
        ag = [Decimal(0), Decimal(0)]
        events_string = ""
        for e in events:
            prefix = str(e.team + 1) + "-" + str(e.minute) + "'"
            if e.type == "Goal":
                adjusted = (
                    Decimal("0.5")
                    + (Decimal("0.025") * (Decimal("90") - Decimal(str(e.minute))))
                    if e.minute > 70 and scores[e.team] > scores[1 - e.team]
                    else Decimal("1.05")
                )
                adjusted *= (
                    Decimal("0.8")
                    if sending_offs[e.team] < sending_offs[1 - e.team]
                    else Decimal("1")
                )
                scores[e.team] += 1
                ag[e.team] += adjusted
                events_string += prefix + "G,"
            elif e.type == "Card":
                sending_offs[e.team] += 1
                events_string += prefix + "R,"

        return Match(
            competition_id=competition_id,
            season=season,
            matchweek=matchweek,
            time=time,
            completed=True,
            neutral=False,
            club_id_1=db.get_club_by_fotmob_id(fotmob_id_1).id,  # type: ignore - returned Club id cannot be None
            club_id_2=db.get_club_by_fotmob_id(fotmob_id_2).id,  # type: ignore - returned Club id cannot be None
            score_1=score_1,
            score_2=score_2,
            xg_1=xg[0],
            xg_2=xg[1],
            ag_1=float(ag[0]),
            ag_2=float(ag[1]),
            events=events_string[:-1],
            fotmob_id=fotmob_match_id,
        )


class FBref:
    def __init__(self):
        FBref.__timer = datetime.min

    @staticmethod
    def __reset_timer():
        FBref.__timer = datetime.now()

    @staticmethod
    def __check_timer():
        """Checks time since last scrape, sleeps if < 6 seconds."""
        if (datetime.now() - FBref.__timer).total_seconds() < 6:
            time.sleep(6)

    @staticmethod
    def __time(f):
        """Wraps timer check and reset around function f.

        Args:
            f (Any): function to be wrapped
        """

        def wrapper(*args, **kwargs):
            FBref.__check_timer()
            output = f(*args, **kwargs)
            FBref.__reset_timer()
            return output

        return wrapper

    def __get(self, url, **kwargs):
        FBref.__check_timer()
        r = requests.get(url, **kwargs)
        FBref.__reset_timer()
        return r

    def get_season_avgs(
        self, competition_id: int, season: int
    ) -> dict[int, tuple[float, float]]:
        """Scrapes avg GS and GA per team in given competition and season.

        Args:
            competition_id (int): competition's db id, ex. 1 for Premier League
            season (int): earlier year of season (ex. 2016 means 2016/17)

        Returns:
            dict[int, tuple[float, float]]: club id -> (avg_gs, avg_ga)
        """
        competition = db.get_competition_by_id(competition_id)
        if competition is None:
            raise ValueError(
                f"Invalid competition id: {competition_id} is not in database"
            )

        res: dict[int, tuple[float, float]] = {}
        r = self.__get(
            f"https://fbref.com/en/comps/{competition.fbref_id}/{season}-{season + 1}",
            timeout=10,
        )
        doc = html.document_fromstring(r.text)
        for tr in doc.xpath(
            f"//table[@id='results{season}-{season+1}91_overall']/tbody/tr"
        ):
            link = tr.xpath("./td[@data-stat='team']/a/@href")[0]
            club = db.get_club_by_fbref_id(link.split("/")[3])
            if club is None:
                # club is not in database
                continue
            mp = int(tr.xpath("./td[@data-stat='games']")[0].text)
            gs = int(tr.xpath("./td[@data-stat='goals_for']")[0].text)
            ga = int(tr.xpath("./td[@data-stat='goals_against']")[0].text)
            res[club.id] = (gs / mp, ga / mp)
        return res

    def get_all_matches(
        self,
        competition_id: int,
        season: int,
    ) -> list[Match]:
        """Scrapes all matches in given competition and season.

        Args:
            competition_id (int): competition's db id, ex. 1 for Premier League
            season (int): earlier year of season (ex. 2016 means 2016/17)

        Returns:
            list[Match]: list of Match; if completed, includes FBref match id
        """
        competition = db.get_competition_by_id(competition_id)
        if competition is None:
            raise ValueError(
                f"Invalid competition id: {competition_id} is not in database"
            )

        r = self.__get(
            f"https://fbref.com/en/comps/{competition.fbref_id}/{season}-{season+1}/schedule/"
        )
        doc = html.document_fromstring(r.text)

        matches: list[Match] = []

        for tr in doc.xpath(
            f"//table[@id='sched_{season}-{season+1}_{competition.fbref_id}_1']/tbody/tr[not(contains(@class,'spacer')) and not(contains(@class,'thead'))]"
        ):
            cancelled = (
                tr.xpath("./td[@data-stat='notes']")[0].text == "Match Cancelled"
            )
            link = tr.xpath("./td[@data-stat='match_report']/a")[0]
            matchweek = int(
                tr.xpath("./*[@data-stat='gameweek' and @scope='row']")[0].text
            )
            time = datetime.fromtimestamp(
                (
                    int(
                        tr.xpath(
                            "./td[@data-stat='start_time']/span/@data-venue-epoch"
                        )[0]
                    )
                    if tr.xpath("./td[@data-stat='start_time']/span/@data-venue-epoch")
                    else 0
                ),
                timezone.utc,
            )
            club_id_1 = tr.xpath("./td[@data-stat='home_team']/a/@href")[0].split("/")[
                3
            ]
            club_id_2 = tr.xpath("./td[@data-stat='away_team']/a/@href")[0].split("/")[
                3
            ]

            if link.text == "Match Report":
                m = Match(
                    competition_id=competition_id,
                    season=season,
                    matchweek=matchweek,
                    time=time,
                    completed=not cancelled,
                    neutral=False,
                    club_id_1=db.get_club_by_fbref_id(club_id_1).id,  # type: ignore - returned Club id cannot be None
                    club_id_2=db.get_club_by_fbref_id(club_id_2).id,  # type: ignore - returned Club id cannot be None
                    fbref_id=link.get("href").split("/")[3],
                )
            else:
                m = Match(
                    competition_id=competition_id,
                    season=season,
                    matchweek=matchweek,
                    time=time,
                    completed=False,
                    neutral=False,
                    club_id_1=db.get_club_by_fbref_id(club_id_1).id,  # type: ignore - returned Club id cannot be None
                    club_id_2=db.get_club_by_fbref_id(club_id_2).id,  # type: ignore - returned Club id cannot be None
                )

            matches.append(m)

        return matches

    def get_completed_match_stats(
        self,
        competition_id: int,
        season: int,
        matchweek: int,
        fbref_match_id: str,
    ) -> Match:
        """Scrapes completed match from FBref, given match id.

        Args:
            fbref_match_id (str): FBref match report id from URL, ex. 71618ace
            season (int): earlier year of season (ex. 2016 means 2016/17)

        Returns:
            Match: Match with scores, xg, ag, events
        """
        r = self.__get(f"https://fbref.com/en/matches/{fbref_match_id}")
        doc = html.document_fromstring(r.text)

        events_elements = doc.xpath(
            "//div[@id='events_wrap']//div[contains(@class,'event ')]"
        )
        if len(events_elements) == 0:
            raise ValueError("Invalid FBref match id")

        sending_offs = [0, 0]
        scores = [0, 0]
        ag = [Decimal(0), Decimal(0)]
        events = ""
        for td in events_elements:
            team = 0 if "a" in td.classes else 1
            minute = int(
                td.xpath("./div[1]")[0]
                .text.strip()
                .replace("&rsquor;", "")
                .split("+")[0]
            )
            prefix = str(team + 1) + "-" + str(minute) + "'"
            if td.xpath(".//div[contains(@class,'goal')]"):
                adjusted = (
                    Decimal("0.5")
                    + (Decimal("0.025") * (Decimal("90") - Decimal(str(minute))))
                    if minute > 70 and scores[team] > scores[1 - team]
                    else Decimal("1.05")
                )
                adjusted *= (
                    Decimal("0.8")
                    if sending_offs[team] < sending_offs[1 - team]
                    else Decimal("1")
                )
                scores[team] += 1
                ag[team] += adjusted
                events += prefix + "G,"
            elif td.xpath(".//div[contains(@class,'red_card')]"):
                sending_offs[team] += 1
                events += prefix + "R,"

        club_id_1, club_id_2 = [
            club_id.split("/")[3]
            for club_id in doc.xpath(
                "//div[contains(@class,'logo')]/following-sibling::strong/a/@href"
            )
        ]

        xg_1 = Decimal(0)
        xg_2 = Decimal(0)
        try:
            for tr in doc.xpath(
                "//table[@id='shots_all']/tbody/tr[contains(@class,'shots')]"
            ):
                value = tr.xpath("./td[@data-stat='xg_shot']")[0].text
                shot_xg = Decimal(value if value is not None else 0)
                class_name = tr.get("class")
                if club_id_1 in class_name:
                    xg_1 += shot_xg
                elif club_id_2 in class_name:
                    xg_2 += shot_xg
        except:
            xg_1 = None
            xg_2 = None

        return Match(
            competition_id=competition_id,
            season=season,
            matchweek=matchweek,
            time=datetime.fromtimestamp(
                int(
                    doc.xpath("//div[@class='scorebox_meta']//span/@data-venue-epoch")[
                        0
                    ]
                ),
                timezone.utc,
            ),
            completed=True,
            neutral=False,
            club_id_1=db.get_club_by_fbref_id(club_id_1).id,  # type: ignore - returned Club id cannot be None
            club_id_2=db.get_club_by_fbref_id(club_id_2).id,  # type: ignore - returned Club id cannot be None
            fbref_id=fbref_match_id,
            score_1=scores[0],
            score_2=scores[1],
            xg_1=float(xg_1) if xg_1 is not None else None,
            xg_2=float(xg_2) if xg_2 is not None else None,
            ag_1=float(ag[0]),
            ag_2=float(ag[1]),
            events=events[:-1],
        )


class PremierLeague:
    def __init__(self):
        pass

    def get_match_networks(self, season: int) -> list[Match]:
        """Gets TV network for all matches in given season.

        Args:
            season (int): earlier year of season (ex. 2016 means 2016/17)

        Returns:
            list[Match]: list of Match with network
        """
        NETWORKS = {
            "NBC": "NBC",
            "USACNBC": "CNBC",
            "USANBC": "NBC",
            "USANBCSN": "NBC",
            "USANET": "USA",
            "USPEA": "Peacock",
        }
        dates = db.get_season_dates(1, season)
        start_date = (dates[0] - timedelta(days=1)).strftime("%Y-%m-%d")
        end_date = (dates[1] + timedelta(days=1)).strftime("%Y-%m-%d")
        r = requests.get(
            f"https://footballapi.pulselive.com/football/broadcasting-schedule/fixtures?&startDate={start_date}&endDate={end_date}&comps=1&pageSize=1000"
        )
        data = r.json()

        network_matches: list[Match] = []

        for f in data["content"]:
            network = None
            for n in f["broadcasters"]:
                if n["abbreviation"] in NETWORKS:
                    network = NETWORKS[n["abbreviation"]]
                    break

            if network is None:
                continue

            network_matches.append(
                Match(
                    competition_id=1,
                    season=season,
                    matchweek=f["fixture"]["gameweek"]["gameweek"],
                    club_id_1=db.get_club_by_official_id(
                        str(f["fixture"]["teams"][0]["team"]["id"])
                    ).id,  # type: ignore - returned Club id cannot be None
                    club_id_2=db.get_club_by_official_id(
                        str(f["fixture"]["teams"][1]["team"]["id"])
                    ).id,  # type: ignore - returned Club id cannot be None
                    network=network,
                    time=datetime.now(),  # irrelevant for update
                    completed=False,  # irrelevant for update
                    neutral=False,  # irrelevant for update
                )
            )

        return network_matches
