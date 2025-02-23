"""
Functions for writing to MongoDB cloud database.

Specify MONGODB_URI in model/.env file.
"""

import numpy as np
import os
from . import db
from collections import defaultdict
from dotenv import load_dotenv
from pymongo import MongoClient, UpdateOne

load_dotenv()


def prepare_tables(competition_id: int) -> list[UpdateOne]:
    """Prepares bulk write requests for tables from all seasons.

    Args:
        competition_id (int): competition's db id, ex. 1 for Premier League

    Returns:
        list[UpdateOne]: list of upsert requests, one per unique
            season/matchweek
    """
    df = db.get_mongo_tables(competition_id)
    rows = df.to_dict(orient="records")
    map = defaultdict(lambda: defaultdict(list))
    for row in rows:
        row["form"] = row["form"].tolist()
        row["prob_positions"] = ["{:.4f}".format(p) for p in row["prob_positions"]]
        map[row["season"]][row["matchweek"]].append(row)

    counts_map = defaultdict(dict)
    df = db.get_mongo_matchweek_counts(competition_id)
    counts = df.to_dict(orient="records")
    for c in counts:
        counts_map[c["season"]][c["matchweek"]] = (
            c["completed_matches"],
            c["total_matches"],
        )

    return [
        UpdateOne(
            {
                "competition_id": competition_id,
                "season": season,
                "matchweek": matchweek,
            },
            {
                "$set": {
                    "competition_id": competition_id,
                    "season": season,
                    "matchweek": matchweek,
                    "completed_matches": (
                        counts_map[season][matchweek][0] if matchweek != 0 else 0
                    ),
                    "total_matches": (
                        counts_map[season][matchweek][1] if matchweek != 0 else 0
                    ),
                    "rows": map[season][matchweek],
                }
            },
            upsert=True,
        )
        for season in map
        for matchweek in map[season]
    ]


def prepare_scores(competition_id: int, season: int | None = None) -> list[UpdateOne]:
    """Prepares bulk write requests for scores from given season.

    Args:
        competition_id (int): competition's db id, ex. 1 for Premier League
        season (int | None, optional): earlier year of season (ex. 2016 means
            2016/17); if None, prepares scores from all seasons. Defaults to
            None.

    Returns:
        list[UpdateOne]: list of upsert requests, one per match
    """
    df = db.get_mongo_scores(competition_id, season)
    scores = df.replace({np.nan: None}).to_dict(orient="records")

    return [
        UpdateOne(
            {"_id": score["id"]},
            {
                "$set": {
                    "competition_id": competition_id,
                    "season": score["season"],
                    "matchweek": score["matchweek"],
                    "scores": score,
                }
            },
            upsert=True,
        )
        for score in scores
    ]


def prepare_latest(competition_id: int) -> list[UpdateOne]:
    """Prepares bulk write requests for latest table and scores info.

    Args:
        competition_id (int): competition's db id, ex. 1 for Premier League

    Returns:
        list[UpdateOne]: upsert request for latest info (length 1)
    """
    df = db.get_mongo_latest_table_info(competition_id)
    latest_table = df.to_dict(orient="records")[0]

    df = db.get_mongo_latest_scores_info(competition_id)
    latest_scores = df.to_dict(orient="records")[0]

    df = db.get_mongo_competition_seasons(competition_id)
    seasons = df.to_dict(orient="records")

    df = db.get_mongo_latest_trends(competition_id, seasons[-1]["season"])
    t = df.to_dict(orient="records")
    latest_trends = (
        {
            "up": t[0],
            "down": t[1],
        }
        if len(t) == 2
        else None
    )

    return [
        UpdateOne(
            {"competition_id": competition_id},
            {
                "$set": {
                    "competition_id": competition_id,
                    "table": latest_table,
                    "scores": latest_scores,
                    "seasons": seasons,
                    "trends": latest_trends,
                }
            },
            upsert=True,
        )
    ]


def upsert_all(competition_id: int):
    """Upserts tables and scores from all seasons, as well as latest info.

    Raises:
        Exception: PyMongo exception
    """
    try:
        uri = os.getenv("MONGODB_URI")
        client = MongoClient(uri)

        db = client["efi"]

        tables = db["tables"]
        requests = prepare_tables(competition_id)
        tables.bulk_write(requests)

        scores = db["scores"]
        requests = prepare_scores(competition_id)
        scores.bulk_write(requests)

        latest = db["latest"]
        requests = prepare_latest(competition_id)
        latest.bulk_write(requests)

    except Exception as e:
        raise Exception(e)


if __name__ == "__main__":
    for competition_id in range(1, 6):
        upsert_all(competition_id)
