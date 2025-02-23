"""
Dataclass and enum definitions.
"""

from collections import deque
from dataclasses import dataclass
from datetime import datetime, date
from decimal import Decimal
from enum import Enum


class IdType(Enum):
    # name -> col index in clubs table
    OFFICIAL = 6
    FOTMOB = 7
    FBREF = 8
    TRANSFERMARKT = 9


@dataclass(kw_only=True)
class Match:
    competition_id: int
    season: int
    matchweek: int
    time: datetime
    completed: bool
    neutral: bool
    club_id_1: int
    club_id_2: int
    fotmob_id: str | None = None
    fbref_id: str | None = None
    score_1: int | None = None
    score_2: int | None = None
    xg_1: float | None = None
    xg_2: float | None = None
    ag_1: float | None = None
    ag_2: float | None = None
    events: str | None = None
    off_1: float | None = None
    def_1: float | None = None
    efi_1: float | None = None
    off_2: float | None = None
    def_2: float | None = None
    efi_2: float | None = None
    prob_1: float | None = None
    prob_2: float | None = None
    prob_d: float | None = None
    mp_off_1: float | None = None
    mp_def_1: float | None = None
    mp_off_2: float | None = None
    mp_def_2: float | None = None
    network: str | None = None
    display_with_matchweek: int | None = None


@dataclass
class MatchAlreadyInserted(Match):
    id: int


@dataclass
class TableSnapshot:
    competition_id: int
    season: int
    club_id: int
    match_id: int | None
    off: float
    def_: float
    efi: float
    form: list[str | None]
    mp: int = 0
    w: int = 0
    d: int = 0
    l: int = 0
    gf: int = 0
    ga: int = 0
    gd: int = 0
    pts: int = 0


@dataclass
class ClubSnapshot:
    name: str
    mp_off: deque[float]
    mp_def: deque[float]
    efi: list[float]


@dataclass
class SimTableSnapshot:
    club_id: int
    gf: int
    gd: int
    pts: int


@dataclass
class SimClubSnapshot:
    mp_off: deque[float]
    mp_def: deque[float]


@dataclass
class SimResults:
    counts: list[int]
    total_gd: int
    total_pts: int
    simulations: int


@dataclass
class Projection:
    club_id: int
    update_date: date
    matchweek: int  # 0 if preseason
    season: int
    competition_id: int
    positions: list[float] | None = None
    avg_gd: float | None = None
    avg_pts: float | None = None


@dataclass
class TransferValue:
    club_id: int
    season: int
    off_value: Decimal
    def_value: Decimal


@dataclass
class Competition:
    id: int
    name: str
    abbrev: str
    country_code: str
    fotmob_id: str
    fbref_id: str
    transfermarkt_id: str
    transfermarkt_path: str
    avg_base: float | None
    home_advantage: float | None
    transfer_int: float | None
    transfer_off_slope: float | None
    transfer_def_slope: float | None


@dataclass
class Club:
    id: int
    name: str
    short_name: str
    abbrev: str
    country_code: str
    icon_link: str
    official_id: str
    fotmob_id: str
    fbref_id: str
    transfermarkt_id: str
    transfermarkt_path: str


@dataclass
class Club_Competition:
    season: int
    competition_id: int
    club_id: int


@dataclass
class Event:
    team: int  # 0 for home, 1 for away
    type: str  # "Goal" or "Card"
    minute: int


@dataclass
class Performance:
    rps: float = 0.0
    ign: float = 0.0
    bs: float = 0.0
    mp: int = 0
