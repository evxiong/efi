"""
Model functions.
"""

import copy
import csv
import numpy as np
from . import db, scoring, scrape
from .data import (
    TableSnapshot,
    ClubSnapshot,
    Match,
    Projection,
    SimTableSnapshot,
    SimClubSnapshot,
    SimResults,
    Performance,
)
from collections import defaultdict, deque
from datetime import date, datetime, timedelta
from itertools import repeat
from multiprocessing import Pool
from scipy.stats import skellam
from tqdm import tqdm

PROCESSES = 10  # number of processes to spawn for match simulations
CHUNKSIZE = 25  # number of simulations performed by each process at a time


def read_deductions_csv(
    file_path: str = "data/deductions.csv",
) -> defaultdict[int, defaultdict[int, defaultdict[int, dict[date, int]]]]:
    """Reads deductions.csv as dict

    Args:
        file_path (str, optional): relative file path to deductions csv.
            Defaults to "data/deductions.csv".

    Returns:
        dict: competition id (int) -> season (int) -> club id (int) -> date
            (date) -> change (int)
    """
    # competition id -> season -> club id -> date -> change
    d = defaultdict(lambda: defaultdict(lambda: defaultdict(dict[date, int])))
    with open(file_path) as fd:
        reader = csv.DictReader(fd)
        for row in reader:
            d[int(row["competition_id"])][int(row["season"])][int(row["club_id"])][
                datetime.strptime(row["date"], "%Y-%m-%d").date()
            ] = int(row["change"])

    return d


def sim(
    args: tuple[
        dict[int, SimTableSnapshot],
        dict[int, SimClubSnapshot],
        list[tuple[int, int]],
        float,
        float,
    ]
) -> list[SimTableSnapshot]:
    """Performs single simulation of remaining matches to end of season.

    Args:
        args (tuple[ dict[int, SimTableSnapshot], dict[int, SimClubSnapshot], list[tuple[int, int]], float, float ]):
            (club id -> SimTableSnapshot, club id -> SimClubSnapshot, list of
            (club_id_1, club_id_2) for each remaining match, avg base, home
            advantage)

    Returns:
        list[SimTableSnapshot]: sorted end-of-season table
    """
    table_map, clubs_map, matches, avg_base, home_advantage = args

    # simulate all matches to end of season
    tm = {k: copy.copy(table_map[k]) for k in table_map}
    cm = {
        k: SimClubSnapshot(clubs_map[k].mp_off.copy(), clubs_map[k].mp_def.copy())
        for k in clubs_map
    }

    for row in matches:
        # calculate projected goals scored per team
        club_id_1 = row[0]
        club_id_2 = row[1]

        off_1 = compute_rating(cm[club_id_1].mp_off)
        def_1 = compute_rating(cm[club_id_1].mp_def)

        off_2 = compute_rating(cm[club_id_2].mp_off)
        def_2 = compute_rating(cm[club_id_2].mp_def)

        proj_1 = compute_projected_goals(
            (cm[club_id_1].mp_off), def_2, True, avg_base, home_advantage
        )
        proj_2 = compute_projected_goals(
            (cm[club_id_2].mp_off), def_1, False, avg_base, home_advantage
        )

        # randomly draw scores independently based on poisson
        rng_1 = np.random.default_rng()
        score_1 = rng_1.poisson(proj_1)

        rng_2 = np.random.default_rng()
        score_2 = rng_2.poisson(proj_2)

        # update match performances based on score
        mp_off_1 = compute_mp(score_1, def_2, True, True, avg_base, home_advantage)
        mp_def_1 = compute_mp(score_2, off_2, True, False, avg_base, home_advantage)
        mp_off_2 = compute_mp(score_2, def_1, False, True, avg_base, home_advantage)
        mp_def_2 = compute_mp(score_1, off_1, False, False, avg_base, home_advantage)

        cm[club_id_1].mp_off.appendleft(mp_off_1)
        cm[club_id_1].mp_def.appendleft(mp_def_1)
        cm[club_id_2].mp_off.appendleft(mp_off_2)
        cm[club_id_2].mp_def.appendleft(mp_def_2)

        # deductions should not be taken into account, since they will already
        # be factored into the existing data structures if passed; can't predict
        # future deductions
        res = "W" if score_1 > score_2 else "D" if score_1 == score_2 else "L"
        tm[club_id_1].gd += score_1 - score_2
        tm[club_id_1].gf += score_1
        tm[club_id_1].pts += 3 if res == "W" else 1 if res == "D" else 0

        res = "W" if score_1 < score_2 else "D" if score_1 == score_2 else "L"
        tm[club_id_2].gd += score_2 - score_1
        tm[club_id_2].gf += score_2
        tm[club_id_2].pts += 3 if res == "W" else 1 if res == "D" else 0

    # sort table_map by pts, gd, gf
    return sorted(tm.values(), key=lambda t: (t.pts, t.gd, t.gf), reverse=True)


def sim_from_date(
    competition_id: int,
    season: int,
    start_date: date,
    table_map: dict[int, SimTableSnapshot],
    clubs_map: dict[int, SimClubSnapshot],
    avg_base: float,
    home_advantage: float,
    simulations: int = 10000,
) -> dict[int, SimResults]:
    """Simulates matches from start_date to end of season.

    Args:
        competition_id (int): competition's db id, ex. 1 for Premier League
        season (int): earlier year of season (ex. 2016 means 2016/17)
        start_date (date): start date of simulation. All matches prior to
            start_date should be run and contribute to table_map and clubs_map.
        table_map (dict[int, SimTableSnapshot]): club id -> club id, current gf,
            gd, pts
        clubs_map (dict[int, SimClubSnapshot]): club id -> current match
            performances
        simulations (int, optional): number of simulations to run. Defaults to
            10000.

    Returns:
        dict[int, SimResults]: club id -> results
    """
    # no matches on start_date should already be run in calling function
    matches = db.get_matches_sim(competition_id, season, start_date)
    matches_club_ids = [(m.club_id_1, m.club_id_2) for m in matches]

    sim_results: dict[int, SimResults] = {
        cid: SimResults(
            counts=[0] * 20, total_pts=0, total_gd=0, simulations=simulations
        )
        for cid in clubs_map.keys()
    }

    with Pool(processes=PROCESSES) as pool, tqdm(total=simulations) as bar:
        for ordered_table in pool.imap(
            sim,
            repeat(
                (table_map, clubs_map, matches_club_ids, avg_base, home_advantage),
                simulations,
            ),
            chunksize=CHUNKSIZE,
        ):
            for i, t in enumerate(ordered_table):
                sim_results[t.club_id].counts[i] += 1
                sim_results[t.club_id].total_gd += t.gd
                sim_results[t.club_id].total_pts += t.pts
            bar.update()
            bar.refresh()

    return sim_results


def run_seasons(
    competition_id: int,
    start: int,
    end: int,
    save: bool = False,
    sim: bool = False,
    performance: bool = False,
):
    """Computes predictions and ratings for each match.

    Args:
        competition_id (int): competition's db id, ex. 1 for Premier League
        start (int): earlier year of first season (ex. 2016 means 2016/17)
        end (int): later year of final season to include (ex. 2025 means
            2024/25)
        save (bool, optional): if True, write results to database. Defaults to
            False.
        sim (bool, optional): if True, run projections after each matchweek.
            Defaults to False.
        performance (bool, optional): if True, print model performance after
            running all seasons. Defaults to False.
    """
    # get avg_base and home_advantage from database
    competition = db.get_competition_by_id(competition_id)
    if competition is None:
        raise ValueError(f"Invalid competition id: {competition_id} is not in database")
    if (
        competition.avg_base is None
        or competition.home_advantage is None
        or competition.transfer_off_slope is None
        or competition.transfer_def_slope is None
        or competition.transfer_int is None
    ):
        raise Exception(
            f"{competition.name} is missing one or more of the following fields: avg_base, home_advantage, transfer_off_slope, transfer_def_slope, transfer_int"
        )
    AVG_BASE = competition.avg_base
    HOME_ADVANTAGE = competition.home_advantage
    TRANSFER_OFF_SLOPE = competition.transfer_off_slope
    TRANSFER_DEF_SLOPE = competition.transfer_def_slope
    TRANSFER_INT = competition.transfer_int

    # get deductions from csv file
    deductions = read_deductions_csv()

    table_map: dict[int, TableSnapshot] = {}  # club id -> TableSnapshot
    history: list[TableSnapshot] = []  # for db insertion
    match_predictions_performances: list[Match] = []  # for db insertion
    projections: list[Projection] = []  # for db insertion

    # model performance
    P = Performance()

    for i, season in enumerate(range(start, end)):
        clubs = db.get_clubs(competition_id, season)

        # remove clubs that aren't in current season from table_map
        current_club_ids = {c.id for c in clubs}
        for club_id in list(table_map.keys()):
            if club_id not in current_club_ids:
                del table_map[club_id]

        preseason_zs = db.get_transfervalues_z(competition_id, season)

        previous_avgs = {}
        if i == 0:
            F = scrape.Fotmob()
            previous_avgs = F.get_season_avgs(competition_id, season - 1)

        clubs_map: dict[int, ClubSnapshot] = {}
        for club in clubs:
            avgs: tuple[float, float] | None = None
            if i == 0:
                if club.id in previous_avgs:
                    avgs = previous_avgs[club.id]
            else:
                if club.id in table_map:
                    avgs = (table_map[club.id].off, table_map[club.id].def_)

            zs = preseason_zs[club.id]
            if avgs:
                starting_off = avgs[0] * (2 / 3) + (
                    TRANSFER_OFF_SLOPE * zs[0] + TRANSFER_INT
                ) * (1 / 3)
                starting_def = avgs[1] * (2 / 3) + (
                    TRANSFER_DEF_SLOPE * zs[1] + TRANSFER_INT
                ) * (1 / 3)
            else:
                starting_off = TRANSFER_OFF_SLOPE * zs[0] + TRANSFER_INT
                starting_def = TRANSFER_DEF_SLOPE * zs[1] + TRANSFER_INT

            clubs_map[club.id] = ClubSnapshot(
                name=club.name,
                mp_off=deque([starting_off], 25),
                mp_def=deque([starting_def], 25),
                efi=[compute_efi(starting_off, starting_def)],
            )

            table_map[club.id] = TableSnapshot(
                competition_id=competition_id,
                season=season,
                club_id=club.id,
                match_id=None,
                off=starting_off,
                def_=starting_def,
                efi=compute_efi(starting_off, starting_def),
                form=[None, None, None, None, None],
            )

            history.append(table_map[club.id])

        completed_matches = db.get_matches(competition_id, season, completed=True)
        current_matchweek = 0

        # initial match date should be just prior to start of season
        match_date: date = db.get_season_dates(competition_id, season)[0] - timedelta(
            days=1
        )

        for m in completed_matches:
            if m.matchweek == current_matchweek + 1 or (
                # mw 7 was postponed in 2022
                season == 2022
                and m.matchweek == 8
                and m.matchweek > current_matchweek
            ):
                if sim:
                    sim_date: date = match_date + timedelta(days=1)
                    print(season, current_matchweek, match_date)
                    results = sim_from_date(
                        competition_id,
                        season,
                        sim_date,
                        {
                            k: SimTableSnapshot(
                                club_id=v.club_id, gf=v.gf, gd=v.gd, pts=v.pts
                            )
                            for k, v in table_map.items()
                        },
                        {
                            k: SimClubSnapshot(mp_off=v.mp_off, mp_def=v.mp_def)
                            for k, v in clubs_map.items()
                        },
                        AVG_BASE,
                        HOME_ADVANTAGE,
                    )
                    for cid in results:
                        projections.append(
                            Projection(
                                club_id=cid,
                                update_date=match_date,
                                matchweek=current_matchweek,
                                season=season,
                                competition_id=competition_id,
                                positions=[
                                    c / results[cid].simulations
                                    for c in results[cid].counts
                                ],
                                avg_gd=results[cid].total_gd / results[cid].simulations,
                                avg_pts=results[cid].total_pts
                                / results[cid].simulations,
                            )
                        )

                current_matchweek = m.matchweek

            club_id_1 = m.club_id_1
            club_id_2 = m.club_id_2

            off_1 = compute_rating(clubs_map[club_id_1].mp_off)
            def_1 = compute_rating(clubs_map[club_id_1].mp_def)
            efi_1 = compute_efi(off_1, def_1)

            off_2 = compute_rating(clubs_map[club_id_2].mp_off)
            def_2 = compute_rating(clubs_map[club_id_2].mp_def)
            efi_2 = compute_efi(off_2, def_2)

            proj_1 = compute_projected_goals(
                (clubs_map[club_id_1].mp_off), def_2, True, AVG_BASE, HOME_ADVANTAGE
            )
            proj_2 = compute_projected_goals(
                (clubs_map[club_id_2].mp_off), def_1, False, AVG_BASE, HOME_ADVANTAGE
            )

            prob_1, prob_2, prob_d = compute_probs(proj_1, proj_2)

            if m.ag_1 is None or m.ag_2 is None or m.xg_1 is None or m.xg_2 is None:
                raise Exception(f"Match with id {m.id} is missing ag or xg stats.")

            mp_off_1 = compute_mp(
                compute_comp_score(m.ag_1, m.xg_1),
                def_2,
                True,
                True,
                AVG_BASE,
                HOME_ADVANTAGE,
            )
            mp_def_1 = compute_mp(
                compute_comp_score(m.ag_2, m.xg_2),
                off_2,
                True,
                False,
                AVG_BASE,
                HOME_ADVANTAGE,
            )
            mp_off_2 = compute_mp(
                compute_comp_score(m.ag_2, m.xg_2),
                def_1,
                False,
                True,
                AVG_BASE,
                HOME_ADVANTAGE,
            )
            mp_def_2 = compute_mp(
                compute_comp_score(m.ag_1, m.xg_1),
                off_1,
                False,
                False,
                AVG_BASE,
                HOME_ADVANTAGE,
            )

            # update model performance
            if m.score_1 is None or m.score_2 is None:
                raise Exception(f"Match with id {m.id} is missing scores.")
            probs = [prob_1, prob_d, prob_2]
            outcome = (
                [1, 0, 0]
                if m.score_1 > m.score_2
                else [0, 0, 1] if m.score_1 < m.score_2 else [0, 1, 0]
            )
            P.rps += scoring.compute_rps(probs, outcome)
            P.ign += scoring.compute_ign(probs, outcome)
            P.bs += scoring.compute_bs(probs, outcome)
            P.mp += 1

            # update clubs map
            clubs_map[club_id_1].mp_off.appendleft(mp_off_1)
            clubs_map[club_id_1].mp_def.appendleft(mp_def_1)
            clubs_map[club_id_2].mp_off.appendleft(mp_off_2)
            clubs_map[club_id_2].mp_def.appendleft(mp_def_2)

            clubs_map[club_id_1].efi.append(
                compute_efi(
                    compute_rating(clubs_map[club_id_1].mp_off),
                    compute_rating(clubs_map[club_id_1].mp_def),
                )
            )
            clubs_map[club_id_2].efi.append(
                compute_efi(
                    compute_rating(clubs_map[club_id_2].mp_off),
                    compute_rating(clubs_map[club_id_2].mp_def),
                )
            )

            match_predictions_performances.append(
                Match(
                    competition_id=m.competition_id,
                    season=m.season,
                    matchweek=m.matchweek,
                    time=m.time,
                    completed=m.completed,
                    neutral=m.neutral,
                    club_id_1=m.club_id_1,
                    club_id_2=m.club_id_2,
                    off_1=off_1,
                    def_1=def_1,
                    efi_1=efi_1,
                    off_2=off_2,
                    def_2=def_2,
                    efi_2=efi_2,
                    prob_1=prob_1,
                    prob_2=prob_2,
                    prob_d=prob_d,
                    mp_off_1=mp_off_1,
                    mp_def_1=mp_def_1,
                    mp_off_2=mp_off_2,
                    mp_def_2=mp_def_2,
                )
            )

            # update table_map
            match_date = m.time.date()
            for club_id in [club_id_1, club_id_2]:
                points_modification = 0
                if (
                    competition_id in deductions
                    and season in deductions[competition_id]
                    and club_id in deductions[competition_id][season]
                ):
                    for da in list(deductions[competition_id][season][club_id]):
                        if da < match_date:
                            points_modification = deductions[competition_id][season][
                                club_id
                            ][da]
                            del deductions[competition_id][season][club_id][da]
                            break

                score = m.score_1 if club_id == club_id_1 else m.score_2
                opp_score = m.score_2 if club_id == club_id_1 else m.score_1
                t = construct_new_table_snapshot(
                    table_map[club_id],
                    clubs_map[club_id],
                    competition_id,
                    season,
                    m.id,
                    score,
                    opp_score,
                    points_modification,
                )
                table_map[club_id] = t
                history.append(t)

        if sim:
            sim_date: date = match_date + timedelta(days=1)
            print(season, current_matchweek, match_date)
            results = sim_from_date(
                competition_id,
                season,
                sim_date,
                {
                    k: SimTableSnapshot(club_id=v.club_id, gf=v.gf, gd=v.gd, pts=v.pts)
                    for k, v in table_map.items()
                },
                {
                    k: SimClubSnapshot(mp_off=v.mp_off, mp_def=v.mp_def)
                    for k, v in clubs_map.items()
                },
                AVG_BASE,
                HOME_ADVANTAGE,
            )
            for cid in results:
                projections.append(
                    Projection(
                        club_id=cid,
                        update_date=match_date,
                        matchweek=current_matchweek,
                        season=season,
                        competition_id=competition_id,
                        positions=[
                            c / results[cid].simulations for c in results[cid].counts
                        ],
                        avg_gd=results[cid].total_gd / results[cid].simulations,
                        avg_pts=results[cid].total_pts / results[cid].simulations,
                    )
                )

        sorted_clubs_map = {
            k: v
            for k, v in sorted(
                clubs_map.items(),
                key=lambda item: compute_efi(
                    compute_rating(item[1].mp_off), compute_rating(item[1].mp_def)
                ),
                reverse=True,
            )
        }
        print(season)
        for k, v in sorted_clubs_map.items():
            print(
                v.name,
                compute_efi(compute_rating(v.mp_off), compute_rating(v.mp_def)),
                table_map[k].pts,
                table_map[k].gd,
            )
        print()

    if performance:
        print(f"Model performance ({P.mp} matches):")
        print("avg rps:", P.rps / P.mp)
        print("avg ign:", P.ign / P.mp)
        print("avg bs:", P.bs / P.mp)

    if save:
        db.update_matches_predictions(match_predictions_performances)
        db.update_matches_performances(match_predictions_performances)
        db.upsert_history(history)
        db.upsert_projections(projections)


def construct_new_table_snapshot(
    old_snapshot: TableSnapshot,
    club_snapshot: ClubSnapshot,
    competition_id: int,
    season: int,
    match_id: int,
    score: int,
    opp_score: int,
    points_mod: int,
) -> TableSnapshot:
    """Constructs club's new TableSnapshot based on old TableSnapshot.

    TableSnapshot represents a row in a league table at any point in the season.

    Args:
        old_snapshot (TableSnapshot): club's old TableSnapshot
        club_snapshot (ClubSnapshot): club's current ClubSnapshot
        competition_id (int): competition's db id, ex. 1 for Premier League
        season (int): current season
        match_id (int): db's match id of club's latest match
        score (int): club's goals scored in latest match
        opp_score (int): club's goals conceded in latest match
        points_mod (int): points modification to match result (in case of
            deduction or addition)

    Returns:
        TableSnapshot: new TableSnapshot taking into account club's latest match
    """
    res = "W" if score > opp_score else "D" if score == opp_score else "L"
    none_ind = old_snapshot.form.index(None) if None in old_snapshot.form else -1
    if none_ind == -1:
        new_form = old_snapshot.form[1:] + [res]
    else:
        new_form = old_snapshot.form[:]
        new_form[none_ind] = res

    return TableSnapshot(
        competition_id=competition_id,
        season=season,
        club_id=old_snapshot.club_id,
        match_id=match_id,
        off=compute_rating(club_snapshot.mp_off),
        def_=compute_rating(club_snapshot.mp_def),
        efi=compute_efi(
            compute_rating(club_snapshot.mp_off),
            compute_rating(club_snapshot.mp_def),
        ),
        form=new_form,
        mp=old_snapshot.mp + 1,
        w=old_snapshot.w + (1 if res == "W" else 0),
        d=old_snapshot.d + (1 if res == "D" else 0),
        l=old_snapshot.l + (1 if res == "L" else 0),
        gf=old_snapshot.gf + score,
        ga=old_snapshot.ga + opp_score,
        gd=old_snapshot.gd + score - opp_score,
        pts=old_snapshot.pts
        + points_mod
        + (3 if res == "W" else 1 if res == "D" else 0),
    )


def compute_rating(mps: deque[float]) -> float:
    """Computes offensive or defensive rating from recent match performances.

    Args:
        mps (deque[float]): previous 25 offensive or defensive match
            performances

    Returns:
        float: offensive or defensive rating
    """
    rf = list(np.linspace(1, 0, 25, endpoint=False))
    return sum([a * b for a, b in zip(mps, rf)]) / sum(rf[: len(mps)])


def compute_projected_goals(
    mps: deque[float],
    opp_def_rating: float,
    home: bool,
    avg_base: float,
    home_advantage: float,
) -> float:
    """Computes goals required to keep offensive rating same.

    Args:
        mps (deque[float]): previous 25 offensive match performances
        opp_def_rating (float): opponent defensive rating
        home (bool): True if computing projected goals for home team
        avg_base (float): avg goals scored per team, per match in this
            competition
        home_advantage (float): avg goals scored above base by home teams in
            this competition

    Returns:
        float: projected goals
    """
    prev_rating = compute_rating(mps)
    num_mps = min(len(mps) + 1, 25)
    rf = list(np.linspace(1, 0, 25, endpoint=False))
    projected_mp = prev_rating * sum(rf[:num_mps]) - sum(
        [a * b for a, b in zip(mps, rf[1:num_mps])]
    )
    ha = home_advantage if not home else -1 * home_advantage
    return max(
        0,
        (projected_mp - ha - avg_base)
        * (opp_def_rating * 0.424 + 0.548)
        / (avg_base * 0.424 + 0.548)
        + opp_def_rating,
    )


def compute_mp(
    comp_score: float,
    opp_rating: float,
    home: bool,
    off: bool,
    avg_base: float,
    home_advantage: float,
) -> float:
    """Computes offensive or defensive match performance.

    Args:
        comp_score (float): composite offensive or defensive score
        opp_rating (float): opponent defensive or offensive rating
        home (bool): True if computing performance for home team, otherwise
            False
        off (bool): True if computing offensive performance, otherwise False
        avg_base (float): avg goals scored per team, per match in this
            competition
        home_advantage (float): avg goals scored above base by home teams in
            this competition

    Returns:
        float: match performance
    """
    ha = (
        home_advantage
        if (home and not off) or (not home and off)
        else -1 * home_advantage
    )
    return max(
        0,
        (
            (comp_score - opp_rating)
            / (opp_rating * 0.424 + 0.548)
            * (avg_base * 0.424 + 0.548)
        )
        + avg_base
        + ha,
    )


def compute_comp_score(ag: float, xg: float) -> float:
    """Computes composite offensive or defensive score.

    Args:
        ag (float): adjusted goals
        xg (float): expected goals

    Returns:
        float: composite score
    """
    return (ag + xg) / 2


def compute_probs(
    proj_goals_1: float, proj_goals_2: float
) -> tuple[float, float, float]:
    """Computes result probabilities, given projected goals.

    Args:
        proj_goals_1 (float): projected goals scored by club 1
        proj_goals_2 (float): projected goals scored by club 2

    Returns:
        tuple[float, float, float]: (prob of club 1 win, prob of club 2 win,
            prob of draw)
    """
    proj_1 = 0.000000001 if proj_goals_1 == 0 else proj_goals_1
    proj_2 = 0.000000001 if proj_goals_2 == 0 else proj_goals_2
    prob_1 = 1 - skellam.cdf(0, proj_1, proj_2)
    prob_2 = skellam.cdf(-1, proj_1, proj_2)
    prob_d = 1 - prob_1 - prob_2
    return float(prob_1), float(prob_2), float(prob_d)


def compute_efi(off_rating: float, def_rating: float) -> float:
    """Computes club's EFI, given their offensive and defensive ratings.

    Args:
        off_rating (float): club's offensive rating
        def_rating (float): club's defensive rating

    Returns:
        float: club's EFI
    """
    w_pct = 1 - skellam.cdf(0, off_rating, def_rating)
    l_pct = skellam.cdf(-1, off_rating, def_rating)
    d_pct = 1 - w_pct - l_pct
    return float(((w_pct * 3 + d_pct) / 3) * 100)


if __name__ == "__main__":
    run_seasons(1, 2017, 2025, save=True, sim=True)
