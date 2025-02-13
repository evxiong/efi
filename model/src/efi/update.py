"""
Functions for updating populated DuckDB database with newly completed matches.

Run `python -m src.efi.update` from inside `model/` to perform daily updates.
"""

from . import db
from . import model
from . import mongo
from . import scrape
from .data import Match, Projection, TableSnapshot, ClubSnapshot
from datetime import date, datetime, timedelta, timezone
from tqdm import tqdm


def run_match_performance(m: Match, avg_base: float, home_advantage: float) -> Match:
    """Adds match performances to Match m.

    Args:
        m (Match): Match to compute match performance for, with stats fields
            filled in
        avg_base (float): avg goals scored per team, per match in this
            competition
        home_advantage (float): avg goals scored above base by home teams in
            this competition

    Raises:
        ValueError: passed Match is missing necessary fields
        Exception: corresponding db row is missing predictions

    Returns:
        Match: Match with updated match performance fields
    """
    if (
        m.fotmob_id is None
        or m.ag_1 is None
        or m.ag_2 is None
        or m.xg_1 is None
        or m.xg_2 is None
    ):
        raise ValueError(
            "Failed to run match performance: passed Match is missing necessary fields"
        )

    db_match = db.get_match_by_fotmob_id(m.fotmob_id)
    if db_match is None:
        raise Exception(
            f"Match with FotMob id {m.fotmob_id} does not exist in database"
        )
    off_1, def_1, off_2, def_2 = (
        db_match.off_1,
        db_match.def_1,
        db_match.off_2,
        db_match.def_2,
    )

    if off_1 is None or def_1 is None or off_2 is None or def_2 is None:
        raise Exception(
            f"Failed to run match performance: database Match with FotMob id {m.fotmob_id} is missing predictions"
        )

    m.mp_off_1 = model.compute_mp(
        model.compute_comp_score(m.ag_1, m.xg_1),
        def_2,
        True,
        True,
        avg_base,
        home_advantage,
    )
    m.mp_def_1 = model.compute_mp(
        model.compute_comp_score(m.ag_2, m.xg_2),
        off_2,
        True,
        False,
        avg_base,
        home_advantage,
    )
    m.mp_off_2 = model.compute_mp(
        model.compute_comp_score(m.ag_2, m.xg_2),
        def_1,
        False,
        True,
        avg_base,
        home_advantage,
    )
    m.mp_def_2 = model.compute_mp(
        model.compute_comp_score(m.ag_1, m.xg_1),
        off_1,
        False,
        False,
        avg_base,
        home_advantage,
    )
    return m


def update_history(
    competition_id: int,
    season: int,
    m: Match,
    old_snapshot_1: TableSnapshot,
    old_snapshot_2: TableSnapshot,
):
    """Inserts row into History table for each club in Match m.

    Args:
        competition_id (int): competition's db id, ex. 1 for Premier League
        season (int): earlier year of season (ex. 2016 means 2016/17)
        m (Match): match to update History with, scores filled in
        old_snapshot_1 (TableSnapshot): club 1's table row prior to Match m
        old_snapshot_2 (TableSnapshot): club 2's table row prior to Match m
    """
    if m.score_1 is None or m.score_2 is None:
        raise ValueError("Passed Match is missing score_1 and/or score_2.")
    if m.fotmob_id is None:
        raise ValueError("Passed Match is missing fotmob_id")
    db_match = db.get_match_by_fotmob_id(m.fotmob_id)
    if db_match is None:
        raise Exception(
            f"Match with fotmob_id {m.fotmob_id} does not exist in database"
        )
    match_id = db_match.id

    mps = db.get_recent_match_performances(competition_id, season)
    new_history: list[TableSnapshot] = []

    for club_id, old_snapshot in [
        (m.club_id_1, old_snapshot_1),
        (m.club_id_2, old_snapshot_2),
    ]:
        club_snapshot = ClubSnapshot(
            name="", mp_off=mps[club_id].mp_off, mp_def=mps[club_id].mp_def, efi=[]
        )

        score = m.score_1 if club_id == m.club_id_1 else m.score_2
        opp_score = m.score_2 if club_id == m.club_id_1 else m.score_1

        t = model.construct_new_table_snapshot(
            old_snapshot,
            club_snapshot,
            competition_id,
            season,
            match_id,
            score,
            opp_score,
            0,
        )
        new_history.append(t)

    db.upsert_history(new_history)


def update_predictions(
    competition_id: int, season: int, avg_base: float, home_advantage: float
):
    """Updates match predictions in given competition/season.

    Args:
        competition_id (int): competition's db id, ex. 1 for Premier League
        season (int): earlier year of season (ex. 2016 means 2016/17)
        avg_base (float): avg goals scored per team, per match in this
            competition
        home_advantage (float): avg goals scored above base by home teams in
            this competition

    Returns:
        list[MatchAlreadyInserted]: list of matches to update with predictions
    """
    # get all matches where the match is the earliest next match for both clubs
    matches = db.get_matches_for_predictions(competition_id, season)

    # get up to 25 most recent match performances for each team
    mps = db.get_recent_match_performances(competition_id, season)

    predicted_matches: list[Match] = []
    # may overlap with existing predictions, but that's okay - will just
    # overwrite same values

    for m in matches:
        off_1 = model.compute_rating(mps[m.club_id_1].mp_off)
        def_1 = model.compute_rating(mps[m.club_id_1].mp_def)
        efi_1 = model.compute_efi(off_1, def_1)

        off_2 = model.compute_rating(mps[m.club_id_2].mp_off)
        def_2 = model.compute_rating(mps[m.club_id_2].mp_def)
        efi_2 = model.compute_efi(off_2, def_2)

        proj_1 = model.compute_projected_goals(
            mps[m.club_id_1].mp_off, def_2, True, avg_base, home_advantage
        )
        proj_2 = model.compute_projected_goals(
            mps[m.club_id_2].mp_off, def_1, False, avg_base, home_advantage
        )
        prob_1, prob_2, prob_d = model.compute_probs(proj_1, proj_2)

        predicted_matches.append(
            Match(
                competition_id=competition_id,
                season=season,
                matchweek=m.matchweek,
                time=m.time,
                club_id_1=m.club_id_1,
                club_id_2=m.club_id_2,
                completed=m.completed,
                neutral=m.neutral,
                off_1=off_1,
                def_1=def_1,
                efi_1=efi_1,
                off_2=off_2,
                def_2=def_2,
                efi_2=efi_2,
                prob_1=prob_1,
                prob_2=prob_2,
                prob_d=prob_d,
            )
        )

    print(f"Updating {len(predicted_matches)} matches with predictions...")
    db.update_matches_predictions(predicted_matches)


def update_display_matchweeks(competition_id: int, season: int):
    """Updates display matchweek for each match in given season.

    Display matchweek is the matchweek in which the match actually occurs, which
    may be different from its official matchweek due to rescheduling.

    Args:
        competition_id (int): competition's db id, ex. 1 for Premier League
        season (int): earlier year of season (ex. 2016 means 2016/17)
    """
    matches = db.get_matches(competition_id, season)
    current_matchweek = 0

    for m in matches:
        if m.matchweek == current_matchweek + 1 or (
            # mw 7 was postponed in 2022
            season == 2022
            and m.matchweek == 8
            and m.matchweek > current_matchweek
        ):
            current_matchweek = m.matchweek

        m.display_with_matchweek = current_matchweek

    db.update_matches_display_matchweek(matches)  # type: ignore


def update(competition_id: int, season: int):
    """Updates databases with newly completed matches in given competition.

    Args:
        competition_id (int): competition's db id, ex. 1 for Premier League
        season (int): earlier year of season (ex. 2016 means 2016/17)
    """
    # Get all matches in season from fotmob
    # Update all match times, display matchweeks, broadcasters
    # Get completed match ids currently in db
    # Filter fotmob matches to only include completed matches not in db
    #  (requires fotmob_match_id to be properly set up for all rows)
    # For each newly completed match:
    #  Get match details from fotmob
    #  Update match stats and match performance
    #  Update history
    #  If we advance a matchweek within these matches, run season projections
    # Run projections after iterating through all newly completed matches
    # Run predictions on upcoming matches
    # Write to MongoDB

    # get avg_base and home_advantage from database
    competition = db.get_competition_by_id(competition_id)
    if competition is None:
        raise ValueError(f"Invalid competition id: {competition_id} is not in database")
    if competition.avg_base is None or competition.home_advantage is None:
        raise Exception(f"{competition.name} is missing avg_base or home_advantage")
    AVG_BASE = competition.avg_base
    HOME_ADVANTAGE = competition.home_advantage

    F = scrape.Fotmob()
    all_matches = F.get_all_matches(competition_id, season)

    print("Updating match times...")
    db.update_matches_time(all_matches)

    print("Updating matchweeks...")
    update_display_matchweeks(competition_id, season)

    if competition_id == 1:
        print("Updating match broadcasters...")
        PL = scrape.PremierLeague()
        db.update_matches_network(PL.get_match_networks(season))

    completed_matches = db.get_matches(competition_id, season, completed=True)
    completed_matches_fotmob_ids = set([m.fotmob_id for m in completed_matches])

    new_completed_matches = [
        m
        for m in all_matches
        if m.completed and m.fotmob_id not in completed_matches_fotmob_ids
    ]

    print(f"Updating stats for {len(new_completed_matches)} matches:")

    current_matchweek = None
    current_match_date = None
    projections: list[Projection] = []

    for m in tqdm(new_completed_matches):
        # Update end-of-season projections if we've advanced a matchweek within
        # newly completed matches
        if (
            current_matchweek is not None
            and current_match_date is not None
            and m.matchweek == current_matchweek + 1
        ):
            print(
                "Simulating to end of season:",
                season,
                current_matchweek,
                current_match_date,
            )
            sim_date: date = current_match_date + timedelta(days=1)
            table_map = db.get_history_latest_sim_table_snapshots(
                competition_id, season
            )
            clubs_map = db.get_recent_match_performances(competition_id, season)
            results = model.sim_from_date(
                competition_id,
                season,
                sim_date,
                table_map,
                clubs_map,
                AVG_BASE,
                HOME_ADVANTAGE,
            )
            for cid in results:
                projections.append(
                    Projection(
                        club_id=cid,
                        update_date=current_match_date,
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

        # Update match stats, performance, and history table
        if m.fotmob_id is not None:  # always the case
            # get Match with match stats
            # add match performance to Match
            # update stats, performance, and history
            updated_match = run_match_performance(
                F.get_completed_match_stats(competition_id, season, m.fotmob_id),
                AVG_BASE,
                HOME_ADVANTAGE,
            )

            old_snapshots: list[TableSnapshot] = []
            for club_id in [updated_match.club_id_1, updated_match.club_id_2]:
                old_snapshots.append(
                    db.get_history_latest_table_snapshot(
                        club_id, competition_id, season
                    )
                )

            # mark match as completed and write stats, match performances
            db.update_matches_stats([updated_match])
            db.update_matches_performances([updated_match])
            update_history(competition_id, season, updated_match, *old_snapshots)

        current_matchweek = m.display_with_matchweek
        current_match_date = m.time.date()

    # Always update end-of-season projections after all newly completed matches
    if (
        new_completed_matches
        and current_matchweek is not None
        and current_match_date is not None
    ):
        print(
            "Simulating to end of season:",
            season,
            current_matchweek,
            current_match_date,
        )
        sim_date: date = current_match_date + timedelta(days=1)
        table_map = db.get_history_latest_sim_table_snapshots(competition_id, season)
        clubs_map = db.get_recent_match_performances(competition_id, season)
        results = model.sim_from_date(
            competition_id,
            season,
            sim_date,
            table_map,
            clubs_map,
            AVG_BASE,
            HOME_ADVANTAGE,
        )
        for cid in results:
            projections.append(
                Projection(
                    club_id=cid,
                    update_date=current_match_date,
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

    if new_completed_matches:
        print(f"Upserting {len(projections)} projections...")
        db.upsert_projections(projections)

        print("Updating predictions for upcoming matches...")
        update_predictions(competition_id, season, AVG_BASE, HOME_ADVANTAGE)

    print("Writing to MongoDB cloud...")
    mongo.upsert_all(competition_id)


if __name__ == "__main__":
    try:
        update(1, 2024)
        with open("log.txt", "a+") as fd:
            fd.write(f"{datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")}\n")
    except Exception as e:
        with open("log.txt", "a+") as fd:
            fd.write(
                f"> {datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")} ERROR: {e}\n"
            )
