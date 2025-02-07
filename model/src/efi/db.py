"""
Functions for interacting with DuckDB database.
"""

import dataclasses
import duckdb
import numpy as np
import pandas as pd
from . import scoring
from .data import (
    Match,
    TableSnapshot,
    Projection,
    SimClubSnapshot,
    MatchAlreadyInserted,
    SimTableSnapshot,
    Competition,
    Club,
    TransferValue,
    Club_Competition,
)
from collections import deque
from datetime import datetime, date

DB_FILE = "efi.db"


def create():
    """Creates all db tables and sequences."""
    with duckdb.connect(DB_FILE) as con:
        con.begin()

        con.execute(
            """
            CREATE SEQUENCE IF NOT EXISTS clubs_id_seq START 1;
            CREATE SEQUENCE IF NOT EXISTS competitions_id_seq START 1;
            CREATE SEQUENCE IF NOT EXISTS clubs_competitions_id_seq START 1;
            CREATE SEQUENCE IF NOT EXISTS transfervalues_id_seq START 1;
            CREATE SEQUENCE IF NOT EXISTS matches_id_seq START 1;
            CREATE SEQUENCE IF NOT EXISTS history_id_seq START 1;
            CREATE SEQUENCE IF NOT EXISTS projections_id_seq START 1;
            """
        )

        con.execute(
            """
            CREATE TABLE IF NOT EXISTS
                clubs (
                    id INTEGER PRIMARY KEY DEFAULT nextval('clubs_id_seq'),
                    name VARCHAR NOT NULL,
                    short_name VARCHAR,
                    abbrev VARCHAR, -- 3-letter abbreviation
                    country_code VARCHAR, -- 2-letter ISO code
                    icon_link VARCHAR,
                    official_id VARCHAR,
                    fotmob_id VARCHAR,
                    fbref_id VARCHAR,
                    transfermarkt_id VARCHAR,
                    transfermarkt_path VARCHAR,
                );

            CREATE TABLE IF NOT EXISTS
                competitions (
                    id INTEGER PRIMARY KEY DEFAULT nextval('competitions_id_seq'),
                    name VARCHAR NOT NULL,
                    abbrev VARCHAR, -- 2-letter abbreviation
                    country_code VARCHAR, -- 2-letter ISO code
                    fotmob_id VARCHAR,
                    fbref_id VARCHAR,
                    transfermarkt_id VARCHAR,
                    transfermarkt_path VARCHAR,
                    avg_base DOUBLE, -- average base goals scored
                    home_advantage DOUBLE,
                );

            CREATE TABLE IF NOT EXISTS
                clubs_competitions (
                    id INTEGER PRIMARY KEY DEFAULT nextval('clubs_competitions_id_seq'),
                    season INTEGER NOT NULL,
                    competition_id INTEGER NOT NULL REFERENCES competitions (id),
                    club_id INTEGER NOT NULL REFERENCES clubs (id),
                );

            CREATE TABLE IF NOT EXISTS
                transfervalues (
                    id INTEGER PRIMARY KEY DEFAULT nextval('transfervalues_id_seq'),
                    club_id INTEGER NOT NULL REFERENCES clubs (id),
                    season INTEGER NOT NULL, -- ex. 2016 means pre-2016/17 season
                    off_value DECIMAL(15, 2) NOT NULL, -- mid, att total market value in euros
                    def_value DECIMAL(15, 2) NOT NULL, -- gk, def total market value in euros
                );

            CREATE TABLE IF NOT EXISTS
                matches (
                    id INTEGER PRIMARY KEY DEFAULT nextval('matches_id_seq'),
                    time TIMESTAMPTZ NOT NULL,
                    season INTEGER NOT NULL,
                    matchweek INTEGER NOT NULL,
                    competition_id INTEGER NOT NULL REFERENCES competitions (id),
                    completed BOOLEAN NOT NULL,
                    neutral BOOLEAN NOT NULL,
                    club_id_1 INTEGER NOT NULL REFERENCES clubs (id),
                    club_id_2 INTEGER NOT NULL REFERENCES clubs (id),
                    fotmob_id VARCHAR,
                    fbref_id VARCHAR,
                    off_1 DOUBLE,
                    def_1 DOUBLE,
                    efi_1 DOUBLE,
                    off_2 DOUBLE,
                    def_2 DOUBLE,
                    efi_2 DOUBLE,
                    prob_1 DOUBLE,
                    prob_2 DOUBLE,
                    prob_d DOUBLE,
                    score_1 INTEGER,
                    score_2 INTEGER,
                    xg_1 DOUBLE,
                    xg_2 DOUBLE,
                    ag_1 DOUBLE,
                    ag_2 DOUBLE,
                    mp_off_1 DOUBLE,
                    mp_def_1 DOUBLE,
                    mp_off_2 DOUBLE,
                    mp_def_2 DOUBLE,
                    events VARCHAR, -- ex. "1-67'G,2-70'R,1-90'G"
                    network VARCHAR,
                    display_with_matchweek INTEGER,
                );

            CREATE TABLE IF NOT EXISTS
                history ( -- club_id's updated ratings and stats AFTER match_id completed
                    id INTEGER PRIMARY KEY DEFAULT nextval('history_id_seq'),
                    competition_id INTEGER NOT NULL REFERENCES competitions (id),
                    season INTEGER NOT NULL,
                    club_id INTEGER NOT NULL REFERENCES clubs (id),
                    match_id INTEGER REFERENCES matches (id), -- NULL if preseason
                    off DOUBLE NOT NULL,
                    def DOUBLE NOT NULL,
                    efi DOUBLE NOT NULL,
                    mp INTEGER NOT NULL,
                    w INTEGER NOT NULL,
                    d INTEGER NOT NULL,
                    l INTEGER NOT NULL,
                    gf INTEGER NOT NULL,
                    ga INTEGER NOT NULL,
                    gd INTEGER NOT NULL,
                    pts INTEGER NOT NULL,
                    form VARCHAR[5] NOT NULL,
                );

            CREATE TABLE IF NOT EXISTS
                projections (
                    id INTEGER PRIMARY KEY DEFAULT nextval('projections_id_seq'),
                    club_id INTEGER NOT NULL REFERENCES clubs (id),
                    competition_id INTEGER NOT NULL REFERENCES competitions (id),
                    season INTEGER NOT NULL,
                    matchweek INTEGER NOT NULL, -- 0 if preseason
                    positions DOUBLE[] NOT NULL,
                    avg_gd DOUBLE NOT NULL,
                    avg_pts DOUBLE NOT NULL,
                    update_date DATE NOT NULL,
                );
            """
        )

        con.commit()


def initialize():
    """Initializes clubs and competitions tables.

    Uses `data/clubs.csv` and `data/competitions.csv`.
    """
    with duckdb.connect(DB_FILE) as con:
        con.begin()

        con.execute(
            """
            INSERT INTO clubs BY NAME
            SELECT * FROM read_csv(
                'data/clubs.csv',
                header = true,
                columns = {
                    'name': 'VARCHAR',
                    'short_name': 'VARCHAR',
                    'abbrev': 'VARCHAR',
                    'country_code': 'VARCHAR',
                    'icon_link': 'VARCHAR',
                    'official_id': 'VARCHAR',
                    'fotmob_id': 'VARCHAR',
                    'fbref_id': 'VARCHAR',
                    'transfermarkt_id': 'VARCHAR',
                    'transfermarkt_path': 'VARCHAR'
                }
            );

            INSERT INTO competitions BY NAME
            SELECT * FROM read_csv(
                'data/competitions.csv',
                header = true,
                columns = {
                    'name': 'VARCHAR',
                    'abbrev': 'VARCHAR',
                    'country_code': 'VARCHAR',
                    'fotmob_id': 'VARCHAR',
                    'fbref_id': 'VARCHAR',
                    'transfermarkt_id': 'VARCHAR',
                    'transfermarkt_path': 'VARCHAR',
                    'avg_base': 'DOUBLE',
                    'home_advantage': 'DOUBLE'
                }
            );
            """
        )

        con.commit()


def drop():
    """Drops all db tables and sequences."""
    with duckdb.connect(DB_FILE) as con:
        con.begin()

        con.execute(
            """
            DROP SEQUENCE clubs_id_seq;
            DROP SEQUENCE competitions_id_seq;
            DROP SEQUENCE clubs_competitions_id_seq;
            DROP SEQUENCE transfervalues_id_seq;
            DROP SEQUENCE matches_id_seq;
            DROP SEQUENCE history_id_seq;
            DROP SEQUENCE projections_id_seq;
            """
        )

        con.execute(
            """
            DROP TABLE projections;
            DROP TABLE history;
            DROP TABLE matches;
            DROP TABLE transfervalues;
            DROP TABLE clubs_competitions;
            DROP TABLE competitions;
            DROP TABLE clubs;
            """
        )

        con.commit()


def clear():
    """Clears all db tables and resets sequences."""
    with duckdb.connect(DB_FILE) as con:
        con.begin()

        con.execute(
            """
            TRUNCATE projections;
            TRUNCATE history;
            TRUNCATE matches;
            TRUNCATE transfervalues;
            TRUNCATE clubs_competitions;
            TRUNCATE competitions;
            TRUNCATE clubs;
            """
        )

        con.execute(
            """
            DROP SEQUENCE clubs_id_seq;
            DROP SEQUENCE competitions_id_seq;
            DROP SEQUENCE clubs_competitions_id_seq;
            DROP SEQUENCE transfervalues_id_seq;
            DROP SEQUENCE matches_id_seq;
            DROP SEQUENCE history_id_seq;
            DROP SEQUENCE projections_id_seq;
            """
        )

        con.execute(
            """
            CREATE SEQUENCE clubs_id_seq START 1;
            CREATE SEQUENCE competitions_id_seq START 1;
            CREATE SEQUENCE clubs_competitions_id_seq START 1;
            CREATE SEQUENCE transfervalues_id_seq START 1;
            CREATE SEQUENCE matches_id_seq START 1;
            CREATE SEQUENCE history_id_seq START 1;
            CREATE SEQUENCE projections_id_seq START 1;
            """
        )

        con.commit()


def dataclasses_to_dataframe(classes: list) -> pd.DataFrame:
    """Converts list of dataclasses to dataframe.

    Args:
        classes (list): list of dataclasses of any type

    Returns:
        pd.DataFrame: dataframe with dataclass fields as column names
    """
    return pd.DataFrame(
        # note: astuple(obj) raises TypeError if obj is not a dataclass instance
        [dataclasses.astuple(c) for c in classes],
        columns=list([field.name for field in dataclasses.fields(classes[0])]),
    )


def get_competition_by_id(id: int) -> Competition | None:
    with duckdb.connect(DB_FILE) as con:
        results = con.execute(
            """
            SELECT *
            FROM competitions
            WHERE id = ?
            """,
            [id],
        ).fetchall()
    return Competition(*(results[0])) if results else None


def get_clubs(competition_id: int, season: int) -> list[Club]:
    with duckdb.connect(DB_FILE) as con:
        results = con.execute(
            """
            SELECT c.*
            FROM clubs c
            JOIN clubs_competitions cc ON cc.club_id = c.id
            WHERE cc.competition_id = ? AND cc.season = ?
            """,
            [competition_id, season],
        ).fetchall()
    return [Club(*r) for r in results]


def get_club_by_fotmob_id(fotmob_id: str) -> Club | None:
    with duckdb.connect(DB_FILE) as con:
        results = con.execute(
            """
            SELECT *
            FROM clubs
            WHERE fotmob_id = ?
            """,
            [fotmob_id],
        ).fetchall()
    return Club(*(results[0])) if results else None


def get_club_by_fbref_id(fbref_id: str) -> Club | None:
    with duckdb.connect(DB_FILE) as con:
        results = con.execute(
            """
            SELECT *
            FROM clubs
            WHERE fbref_id = ?
            """,
            [fbref_id],
        ).fetchall()
    return Club(*(results[0])) if results else None


def get_club_by_official_id(official_id: str) -> Club | None:
    with duckdb.connect(DB_FILE) as con:
        results = con.execute(
            """
            SELECT *
            FROM clubs
            WHERE official_id = ?
            """,
            [official_id],
        ).fetchall()
    return Club(*(results[0])) if results else None


def get_club_by_transfermarkt_id(transfermarkt_id: str) -> Club | None:
    with duckdb.connect(DB_FILE) as con:
        results = con.execute(
            """
            SELECT *
            FROM clubs
            WHERE transfermarkt_id = ?
            """,
            [transfermarkt_id],
        ).fetchall()
    return Club(*(results[0])) if results else None


def get_match_by_fotmob_id(fotmob_id: str) -> MatchAlreadyInserted | None:
    with duckdb.connect(DB_FILE) as con:
        df = con.execute(
            """
            SELECT *
            FROM matches
            WHERE fotmob_id = ?
            """,
            [fotmob_id],
        ).df()
    results = df.replace({np.nan: None}).to_dict(orient="records")
    return MatchAlreadyInserted(**results[0]) if results else None  # type: ignore


def get_matches(
    competition_id: int, season: int, completed: bool | None = None
) -> list[MatchAlreadyInserted]:
    with duckdb.connect(DB_FILE) as con:
        df = con.execute(
            """
            SELECT *
            FROM matches
            WHERE
                competition_id = $competition_id AND
                season = $season AND
                ($completed IS NULL OR completed = $completed)
            ORDER BY time
            """,
            {
                "competition_id": competition_id,
                "season": season,
                "completed": completed,
            },
        ).df()
    return [
        MatchAlreadyInserted(**d)  # type: ignore
        for d in df.replace({np.nan: None}).to_dict(orient="records")
    ]


def get_matches_sim(
    competition_id: int, season: int, start_date: date
) -> list[MatchAlreadyInserted]:
    with duckdb.connect(DB_FILE) as con:
        df = con.execute(
            """
            SELECT *
            FROM matches
            WHERE competition_id = ? AND season = ? AND time >= ?
            ORDER BY time
            """,
            [competition_id, season, start_date],
        ).df()
    return [
        MatchAlreadyInserted(**d)  # type: ignore
        for d in df.replace({np.nan: None}).to_dict(orient="records")
    ]


def get_season_dates(competition_id: int, season: int) -> tuple[date, date]:
    """Gets dates of first and last match for given competition and season."""
    with duckdb.connect(DB_FILE) as con:
        results = con.execute(
            """
            SELECT MIN(time), MAX(time)
            FROM matches
            WHERE competition_id = ? AND season = ?
            """,
            [competition_id, season],
        ).fetchall()
    return (results[0][0].date(), results[0][1].date())


def get_transfervalues_z(season: int) -> dict[int, tuple[float, float]]:
    """Gets z-scores of preseason offensive and defensive transfer values.

    Returns:
        dict[int, tuple[float, float]]: club id -> (z_off, z_def)
    """
    with duckdb.connect(DB_FILE) as con:
        results = con.execute(
            """
            SELECT
                t.club_id,
                (t.off_value - AVG(t.off_value) OVER (PARTITION BY season)) / STDDEV(t.off_value) OVER (PARTITION BY season) AS z_off,
                (t.def_value - AVG(t.def_value) OVER (PARTITION BY season)) / STDDEV(t.def_value) OVER (PARTITION BY season) AS z_def
            FROM transfervalues t
            JOIN clubs c ON t.club_id = c.id
            WHERE t.season = ?
            """,
            [season],
        ).fetchall()
    return {r[0]: r[1:] for r in results}


def get_history_latest_sim_table_snapshots(
    competition_id: int, season: int
) -> dict[int, SimTableSnapshot]:
    with duckdb.connect(DB_FILE) as con:
        results = con.execute(
            """
            SELECT DISTINCT ON (h.club_id) h.club_id, h.gf, h.gd, h.pts
            FROM history h
            LEFT JOIN matches m ON h.match_id = m.id
            WHERE h.competition_id = ? AND h.season = ?
            ORDER BY m.time DESC
            """,
            [competition_id, season],
        ).fetchall()

    return {r[0]: SimTableSnapshot(r[0], r[1], r[2], r[3]) for r in results}


def get_history_latest_table_snapshot(
    club_id: int, competition_id: int, season: int
) -> TableSnapshot:
    with duckdb.connect(DB_FILE) as con:
        df = con.execute(
            """
            SELECT
                h.competition_id,
                h.season,
                h.club_id,
                h.match_id,
                h.off,
                h.def AS def_,
                h.efi,
                h.form,
                h.mp,
                h.w,
                h.d,
                h.l,
                h.gf,
                h.ga,
                h.gd,
                h.pts
            FROM history h
            LEFT JOIN matches m ON h.match_id = m.id
            WHERE h.club_id = ? AND h.competition_id = ? AND h.season = ?
            ORDER BY m.time DESC
            LIMIT 1
            """,
            [club_id, competition_id, season],
        ).df()
    d = df.to_dict(orient="records")[0]
    d["form"] = d["form"].tolist()
    return TableSnapshot(**d)  # type: ignore


def get_recent_match_performances(
    competition_id: int, season: int, n: int = 25
) -> dict[int, SimClubSnapshot]:
    """Gets recent match performances per club in given competition/season.

    Match performances ordered from most recent to oldest, left to right, within
    SimClubSnapshot. Includes initial off/def ratings at beginning of season,
    when applicable.

    Args:
        competition_id (int): competition's db id, ex. 1 for Premier League
        season (int): earlier year of season (ex. 2016 means 2016/17)
        n (int, optional): max number of match performances. Defaults to 25.

    Returns:
        dict[int, SimClubSnapshot]: club id -> SimClubSnapshot
    """
    with duckdb.connect(DB_FILE) as con:
        results = con.execute(
            """
            -- Get n latest match performances within competition/season per club,
            -- including initial ratings at beginning of season.
            WITH cte AS (
            	SELECT NULL as time, club_id, off AS mp_off, def AS mp_def
                FROM history
                WHERE competition_id = $competition_id AND season = $season AND match_id IS NULL
                UNION
                SELECT time, club_id_1 AS club_id, mp_off_1 AS mp_off, mp_def_1 AS mp_def
                FROM matches
                WHERE
                    competition_id = $competition_id AND
                    season = $season AND
                    completed = TRUE AND
                    mp_off_1 IS NOT NULL AND
                    mp_def_1 IS NOT NULL
                UNION 
                SELECT time, club_id_2 AS club_id, mp_off_2 AS mp_off, mp_def_2 AS mp_def
                FROM matches
                WHERE
                    competition_id = $competition_id AND
                    season = $season AND
                    completed = TRUE AND
                    mp_off_2 IS NOT NULL AND
                    mp_def_2 IS NOT NULL
            )
            SELECT
                club_id,
                array_agg(mp_off ORDER BY time DESC)[1:$n] AS mp_off,
                array_agg(mp_def ORDER BY time DESC)[1:$n] AS mp_def
            FROM cte
            GROUP BY club_id
            ORDER BY club_id
            """,
            {
                "competition_id": competition_id,
                "season": season,
                "n": n,
            },
        ).fetchall()

    return {
        r[0]: SimClubSnapshot(mp_off=deque(r[1], n), mp_def=deque(r[2], n))
        for r in results
    }


def get_matches_for_predictions(
    competition_id: int, season: int
) -> list[MatchAlreadyInserted]:
    with duckdb.connect(DB_FILE) as con:
        df = con.execute(
            """
            -- get all matches where both clubs do not have an earlier incomplete match
            -- i.e., get all matches where the match is the earliest next match for both clubs
            WITH upcoming AS (
                SELECT club_id_1 AS club_id, time
                FROM matches
                WHERE completed = FALSE AND competition_id = $competition_id AND season = $season 
                UNION
                SELECT club_id_2 AS club_id, time
                FROM matches
                WHERE completed = FALSE AND competition_id = $competition_id AND season = $season
            ), next_per_club AS (
                SELECT DISTINCT ON (club_id) club_id, time
                FROM upcoming
                ORDER BY time
            )
            SELECT m.*
            FROM matches m
            JOIN next_per_club n1 ON m.club_id_1 = n1.club_id AND n1.time = m.time
            JOIN next_per_club n2 ON m.club_id_2 = n2.club_id AND n2.time = m.time
            ORDER BY m.time, m.id
            """,
            {
                "competition_id": competition_id,
                "season": season,
            },
        ).df()
    return [
        MatchAlreadyInserted(**d)  # type: ignore
        for d in df.replace({np.nan: None}).to_dict(orient="records")
    ]


def get_mongo_tables(competition_id: int) -> pd.DataFrame:
    with duckdb.connect(DB_FILE) as con:
        df = con.execute(
            """
            WITH cte AS (
                SELECT row_number() OVER (PARTITION BY season, matchweek ORDER BY efi DESC) AS rank, *
                FROM (
                    SELECT DISTINCT ON(h.season, p.matchweek, h.club_id)
                        h.season,
                        p.matchweek,
                        strftime(p.update_date, '%Y-%m-%d') as update_date,
                        c.icon_link AS icon_link,
                        c.short_name AS name,
                        h.efi,
                        h.off,
                        h.def,
                        h.mp,
                        h.w,
                        h.d,
                        h.l,
                        h.gf,
                        h.ga,
                        h.gd,
                        h.pts,
                        h.form,
                        p.positions AS prob_positions,
                        p.avg_pts,
                        p.avg_gd
                    FROM history h
                    LEFT JOIN matches m ON h.match_id = m.id 
                    JOIN clubs c ON h.club_id = c.id
                    JOIN projections p ON p.season = h.season AND p.club_id = h.club_id AND (m.time IS NULL OR m.time < p.update_date + 1)
                    WHERE h.competition_id = ?
                    ORDER BY h.season ASC, p.matchweek ASC, m.time DESC, h.club_id
                )
                ORDER BY season, matchweek, efi DESC
            )
            SELECT coalesce(b.rank - a.rank, 0) AS change, a.*
            FROM cte a
            LEFT JOIN cte b ON a.season = b.season AND a.name = b.name AND a.matchweek = b.matchweek + 1
            ORDER BY a.season, a.matchweek, a.efi DESC
            """,
            [competition_id],
        ).df()
    return df


def get_mongo_matchweek_counts(competition_id: int) -> pd.DataFrame:
    with duckdb.connect(DB_FILE) as con:
        df = con.execute(
            """
            SELECT
                season,
                display_with_matchweek AS matchweek,
                COUNT(*) FILTER (completed = TRUE) AS completed_matches,
                COUNT(*) AS total_matches
            FROM matches
            WHERE competition_id = ?
            GROUP BY season, display_with_matchweek
            """,
            [competition_id],
        ).df()
    return df


def get_mongo_scores(competition_id: int, season: int | None = None) -> pd.DataFrame:
    with duckdb.connect(DB_FILE) as con:
        df = con.execute(
            """
            SELECT
                m.id,
                m.season,
                m.matchweek,
                m.time,
                m.completed,
                c1.short_name AS club_1,
                c2.short_name AS club_2,
                m.score_1,
                m.score_2,
                m.prob_1,
                m.prob_2,
                m.prob_d,
                m.network,
                c1.icon_link AS icon_link_1,
                c2.icon_link AS icon_link_2,
                m.display_with_matchweek
            FROM matches m
            JOIN clubs c1 ON m.club_id_1 = c1.id
            JOIN Clubs c2 ON m.club_id_2 = c2.id
            WHERE competition_id = $competition_id AND ($season IS NULL or m.season = $season)
            ORDER BY season DESC, matchweek DESC, time
            """,
            {"competition_id": competition_id, "season": season},
        ).df()
    return df


def get_mongo_latest_table_info(competition_id: int) -> pd.DataFrame:
    with duckdb.connect(DB_FILE) as con:
        df = con.execute(
            """
            SELECT season, matchweek
            FROM projections
            WHERE competition_id = ?
            ORDER BY season DESC, matchweek DESC
            LIMIT 1
            """,
            [competition_id],
        ).df()
    return df


def get_mongo_latest_scores_info(competition_id: int) -> pd.DataFrame:
    with duckdb.connect(DB_FILE) as con:
        df = con.execute(
            """
            SELECT season, display_with_matchweek AS matchweek
            FROM matches
            WHERE competition_id = ?
            ORDER BY abs(date_diff('day', date_trunc('day', time AT TIME ZONE 'UTC'), current_date()))
            LIMIT 1
            """,
            [competition_id],
        ).df()
    return df


def get_mongo_competition_seasons(competition_id: int) -> pd.DataFrame:
    with duckdb.connect(DB_FILE) as con:
        df = con.execute(
            """
            SELECT DISTINCT season
            FROM matches
            WHERE competition_id = ?
            ORDER BY season
            """,
            [competition_id],
        ).df()
    return df


def insert_transfervalues(values: list[TransferValue]):
    if not values:
        return

    df = dataclasses_to_dataframe(values)
    with duckdb.connect(DB_FILE) as con:
        con.execute(
            """
            INSERT INTO transfervalues BY NAME
            SELECT * FROM df
            """
        )


def insert_clubs_competitions(values: list[Club_Competition]):
    if not values:
        return

    df = dataclasses_to_dataframe(values)
    with duckdb.connect(DB_FILE) as con:
        con.execute(
            """
            INSERT INTO clubs_competitions BY NAME
            SELECT * FROM df
            """
        )


def insert_matches(values: list[Match]):
    if not values:
        return

    df = dataclasses_to_dataframe(values)
    with duckdb.connect(DB_FILE) as con:
        con.execute(
            """
            INSERT INTO matches BY NAME
            SELECT * FROM df
            """
        )


def update_matches_time(values: list[Match]):
    if not values:
        return

    df = dataclasses_to_dataframe(values)
    with duckdb.connect(DB_FILE) as con:
        con.execute(
            """
            UPDATE matches m SET time = df.time
            FROM df
            WHERE
                m.competition_id = df.competition_id AND
                m.season = df.season AND
                m.matchweek = df.matchweek AND
                m.club_id_1 = df.club_id_1 AND
                m.club_id_2 = df.club_id_2

            """
        )


def update_matches_fotmob_id(values: list[Match]):
    if not values:
        return

    df = dataclasses_to_dataframe(values)
    with duckdb.connect(DB_FILE) as con:
        con.execute(
            """
            UPDATE matches m SET fotmob_id = df.fotmob_id
            FROM df
            WHERE
                m.competition_id = df.competition_id AND
                m.season = df.season AND
                m.matchweek = df.matchweek AND
                m.club_id_1 = df.club_id_1 AND
                m.club_id_2 = df.club_id_2
            """
        )


def update_matches_display_matchweek(values: list[Match]):
    if not values:
        return

    df = dataclasses_to_dataframe(values)
    with duckdb.connect(DB_FILE) as con:
        con.execute(
            """
            UPDATE matches m SET display_with_matchweek = df.display_with_matchweek
            FROM df
            WHERE
                m.competition_id = df.competition_id AND
                m.season = df.season AND
                m.matchweek = df.matchweek AND
                m.club_id_1 = df.club_id_1 AND
                m.club_id_2 = df.club_id_2
            """
        )


def update_matches_network(values: list[Match]):
    if not values:
        return

    df = dataclasses_to_dataframe(values)
    with duckdb.connect(DB_FILE) as con:
        con.execute(
            """
            UPDATE matches m SET network = df.network
            FROM df
            WHERE
                m.competition_id = df.competition_id AND
                m.season = df.season AND
                (
                    m.matchweek = df.matchweek OR
                    (
                        m.display_with_matchweek IS NOT NULL AND
                        m.display_with_matchweek = df.matchweek
                    )
                ) AND
                m.club_id_1 = df.club_id_1 AND
                m.club_id_2 = df.club_id_2
            """
        )


def update_matches_predictions(values: list[Match]):
    if not values:
        return

    df = dataclasses_to_dataframe(values)
    with duckdb.connect(DB_FILE) as con:
        con.execute(
            """
            UPDATE matches m
            SET
                off_1 = df.off_1,
                def_1 = df.def_1,
                efi_1 = df.efi_1,
                off_2 = df.off_2,
                def_2 = df.def_2,
                efi_2 = df.efi_2,
                prob_1 = df.prob_1,
                prob_2 = df.prob_2,
                prob_d = df.prob_d
            FROM df
            WHERE
                m.competition_id = df.competition_id AND
                m.season = df.season AND
                m.matchweek = df.matchweek AND
                m.club_id_1 = df.club_id_1 AND
                m.club_id_2 = df.club_id_2
            """
        )


def update_matches_performances(values: list[Match]):
    if not values:
        return

    df = dataclasses_to_dataframe(values)
    with duckdb.connect(DB_FILE) as con:
        con.execute(
            """
            UPDATE matches m
            SET
                completed = df.completed,
                mp_off_1 = df.mp_off_1,
                mp_def_1 = df.mp_def_1,
                mp_off_2 = df.mp_off_2,
                mp_def_2 = df.mp_def_2
            FROM df
            WHERE
                m.competition_id = df.competition_id AND
                m.season = df.season AND
                m.matchweek = df.matchweek AND
                m.club_id_1 = df.club_id_1 AND
                m.club_id_2 = df.club_id_2
            """
        )


def update_matches_stats(values: list[Match]):
    if not values:
        return

    df = dataclasses_to_dataframe(values)
    with duckdb.connect(DB_FILE) as con:
        con.execute(
            """
            UPDATE matches m
            SET
                completed = df.completed,
                score_1 = df.score_1,
                score_2 = df.score_2,
                xg_1 = df.xg_1,
                xg_2 = df.xg_2,
                ag_1 = df.ag_1,
                ag_2 = df.ag_2,
                events = df.events
            FROM df
            WHERE
                m.competition_id = df.competition_id AND
                m.season = df.season AND
                m.matchweek = df.matchweek AND
                m.club_id_1 = df.club_id_1 AND
                m.club_id_2 = df.club_id_2
            """
        )


def upsert_history(values: list[TableSnapshot]):
    if not values:
        return

    df = dataclasses_to_dataframe(values)
    df.rename(columns={"def_": "def"}, inplace=True)

    with duckdb.connect(DB_FILE) as con:
        con.execute(
            """
            DELETE FROM history USING df
            WHERE
                history.competition_id = df.competition_id AND
                history.season = df.season AND
                history.club_id = df.club_id AND
                history.match_id = df.match_id
            """
        )

        con.execute(
            """
            INSERT INTO history BY NAME
            SELECT * FROM df
            """
        )


def upsert_projections(values: list[Projection]):
    if not values:
        return

    df = dataclasses_to_dataframe(values)
    with duckdb.connect(DB_FILE) as con:
        con.execute(
            """
            DELETE FROM projections USING df
            WHERE
                projections.club_id = df.club_id AND
                projections.competition_id = df.competition_id AND
                projections.season = df.season AND
                projections.matchweek = df.matchweek
            """
        )

        con.execute(
            """
            INSERT INTO projections BY NAME
            SELECT * FROM df
        """
        )


def evaluate_rps(
    competition_id: int | None = None, start: int | None = None, end: int | None = None
) -> pd.DataFrame:
    """Evaluates model using RPS over given competition and seasons.

    RPS: ranked probability score. See README.md for details.

    Args:
        competition_id (int | None, optional): restrict evaluation to a single
            competition using competition's db id, ex. 1 for Premier League. If
            None, evaluates model over all competitions. Defaults to None.
        start (int | None, optional): earlier year of first season to include in
            evaluation (ex. 2016 means 2016/17). If None, starts from earliest
            possible season per competition. Defaults to None.
        end (int | None, optional): later year of final season to include in
            evaluation (ex. 2025 means 2024/25). If None, ends at most recent
            season per competition. Defaults to None.

    Returns:
        pd.DataFrame: dataframe with average RPS, standard deviation, median,
            and number of matches the model was evaluated over.
    """
    with duckdb.connect(DB_FILE) as con:
        con.create_function("compute_rps", scoring.compute_rps)
        df = con.execute(
            """
            SELECT avg(rps) AS avg_rps, stddev(rps) AS sd_rps, median(rps) AS med_rps, COUNT(*) AS count
            FROM (
                SELECT season, time, prob_1, prob_d, prob_2, score_1, score_2,
                    compute_rps(
                        array_value(prob_1, prob_d, prob_2),
                        array_value(
                            CASE WHEN score_1 > score_2 THEN 1 ELSE 0 END, 
                            CASE WHEN score_1 = score_2 THEN 1 ELSE 0 END, 
                            CASE WHEN score_1 < score_2 THEN 1 ELSE 0 END
                        )
                    ) as rps
                FROM matches
                WHERE
                    ($competition_id IS NULL OR competition_id = $competition_id) AND
                    ($start IS NULL OR season >= $start) AND
                    ($end IS NULL OR season < $end)
                ORDER BY time
            )
            """,
            {"competition_id": competition_id, "start": start, "end": end},
        ).df()

    return df


def evaluate_ign(
    competition_id: int | None = None, start: int | None = None, end: int | None = None
) -> pd.DataFrame:
    """Evaluates model using IGN over given competition and seasons.

    IGN: ignorance score. See README.md for details.

    Args:
        competition_id (int | None, optional): restrict evaluation to a single
            competition using competition's db id, ex. 1 for Premier League. If
            None, evaluates model over all competitions. Defaults to None.
        start (int | None, optional): earlier year of first season to include in
            evaluation (ex. 2016 means 2016/17). If None, starts from earliest
            possible season per competition. Defaults to None.
        end (int | None, optional): later year of final season to include in
            evaluation (ex. 2025 means 2024/25). If None, ends at most recent
            season per competition. Defaults to None.

    Returns:
        pd.DataFrame: dataframe with average IGN, standard deviation, median,
            and number of matches the model was evaluated over.
    """
    with duckdb.connect(DB_FILE) as con:
        df = con.execute(
            """
            SELECT avg(ign) AS avg_ign, stddev(ign) AS sd_ign, median(ign) AS med_ign, COUNT(*) AS count
            FROM (
                SELECT season, time, prob_1, prob_d, prob_2, score_1, score_2,
                    -log2(
                        CASE
                            WHEN score_1 > score_2 THEN prob_1
                            WHEN score_1 = score_2 THEN prob_d
                            ELSE prob_2
                        END
                    ) as ign
                FROM matches
                WHERE
                    ($competition_id IS NULL OR competition_id = $competition_id) AND
                    ($start IS NULL OR season >= $start) AND
                    ($end IS NULL OR season < $end)
                ORDER BY time
            )
            """,
            {"competition_id": competition_id, "start": start, "end": end},
        ).df()

    return df


def evaluate_bs(
    competition_id: int | None = None, start: int | None = None, end: int | None = None
) -> pd.DataFrame:
    """Evaluates model using BS over given competition and seasons.

    BS: Brier score. See README.md for details.

    Args:
        competition_id (int | None, optional): restrict evaluation to a single
            competition using competition's db id, ex. 1 for Premier League. If
            None, evaluates model over all competitions. Defaults to None.
        start (int | None, optional): earlier year of first season to include in
            evaluation (ex. 2016 means 2016/17). If None, starts from earliest
            possible season per competition. Defaults to None.
        end (int | None, optional): later year of final season to include in
            evaluation (ex. 2025 means 2024/25). If None, ends at most recent
            season per competition. Defaults to None.

    Returns:
        pd.DataFrame: dataframe with average BS, standard deviation, median,
            and number of matches the model was evaluated over.
    """
    with duckdb.connect(DB_FILE) as con:
        con.create_function("compute_bs", scoring.compute_bs)
        df = con.execute(
            """
            SELECT avg(bs) AS avg_bs, stddev(bs) AS sd_bs, median(bs) AS med_bs, COUNT(*) AS count
            FROM (
                SELECT season, time, prob_1, prob_d, prob_2, score_1, score_2,
                    compute_bs(
                        array_value(prob_1, prob_d, prob_2),
                        array_value(
                            CASE WHEN score_1 > score_2 THEN 1 ELSE 0 END,
                            CASE WHEN score_1 = score_2 THEN 1 ELSE 0 END,
                            CASE WHEN score_1 < score_2 THEN 1 ELSE 0 END
                        )
                    ) as bs
                FROM matches
                WHERE
                    ($competition_id IS NULL OR competition_id = $competition_id) AND
                    ($start IS NULL OR season >= $start) AND
                    ($end IS NULL OR season < $end)
                ORDER BY time
            )
            """,
            {"competition_id": competition_id, "start": start, "end": end},
        ).df()

    return df


if __name__ == "__main__":
    pass
