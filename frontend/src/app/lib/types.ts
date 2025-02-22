export interface Competition {
  name: string;
  slug: string;
  icon_link: string;
  id: number;
  country: string;
}

export interface Score {
  matchweek: number;
  icon_link_1: string;
  icon_link_2: string;
  club_1: string;
  club_2: string;
  club_1_abbrev: string;
  club_2_abbrev: string;
  score_1: number | null;
  score_2: number | null;
  prob_1: number;
  prob_2: number;
  prob_d: number;
  time: Date;
  network: string | null;
  completed: boolean;
  display_with_matchweek: number;
}

export interface Row {
  update_date: string;
  rank: number;
  change: number;
  icon_link: string;
  name: string;
  efi: number;
  off: number;
  def: number;
  mp: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
  form: [
    string | null,
    string | null,
    string | null,
    string | null,
    string | null,
  ];
  prob_positions: number[];
  prob_champion: number;
  prob_top_4: number;
  prob_rel: number;
  avg_pts: number;
  avg_gd: number;
}

export interface Season {
  season: number;
  matchweeks: number;
}
