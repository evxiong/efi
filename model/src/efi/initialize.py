"""
Functions for setting up DuckDB database.
"""

from . import db
from . import model
from . import scrape
from . import update
from tqdm import tqdm


def create_new_db():
    db.create()
    db.initialize()


def initialize_data(competition_id: int, start: int, end: int):
    """Initializes data for given competition's seasons.

    Inserts preseason transfer values, links clubs to competition, adds
    matches, and runs model on past data up to present.

    Args:
        competition_id (int): competition's db id, ex. 1 for Premier League
        start (int): earlier year of first season (ex. 2016 means 2016/17)
        end (int): later year of final season to include (ex. 2025 means
            2024/25)
    """
    competition = db.get_competition_by_id(competition_id)
    if competition is None:
        raise ValueError(f"Invalid competition id: {competition_id} is not in database")
    if competition.avg_base is None or competition.home_advantage is None:
        raise Exception(f"{competition.name} is missing avg_base or home_advantage")
    AVG_BASE = competition.avg_base
    HOME_ADVANTAGE = competition.home_advantage

    T = scrape.Transfermarkt()
    FM = scrape.Fotmob()
    F = scrape.FBref()
    print("Adding data to tables...")
    for season in tqdm(range(start, end)):
        db.insert_transfervalues(T.get_transfer_values(competition_id, season))
        db.insert_clubs_competitions(FM.get_clubs_competitions(competition_id, season))

        fbref_matches = F.get_all_matches(competition_id, season)
        fotmob_matches = FM.get_all_matches(competition_id, season)
        db.insert_matches(fbref_matches)

        if season < 2020:  # use fbref match data
            completed_matches = [
                F.get_completed_match_stats(competition_id, season, m.matchweek, m.fbref_id)  # type: ignore - fbref_id is never None for completed matches
                for m in tqdm(fbref_matches)
                if m.completed
            ]
            db.update_matches_stats(completed_matches)
        else:  # use fotmob match data
            completed_matches = [
                FM.get_completed_match_stats(competition_id, season, m.fotmob_id)  # type: ignore - fotmob_id is never None
                for m in tqdm(fotmob_matches)
                if m.completed
            ]
            db.update_matches_stats(completed_matches)

        # order of these updates matters
        db.update_matches_time(fotmob_matches)
        db.update_matches_fotmob_id(fotmob_matches)
        update.update_display_matchweeks(competition_id, season)
        if competition_id == 1:
            PL = scrape.PremierLeague()
            db.update_matches_network(PL.get_match_networks(season))

    print("Running model on past data...")
    model.run_seasons(competition_id, start, end, save=True, sim=True)

    # run predictions for next matches of last season
    # does nothing if no predictions to make
    update.update_predictions(competition_id, end - 1, AVG_BASE, HOME_ADVANTAGE)


if __name__ == "__main__":
    initialize_data(1, 2017, 2025)
