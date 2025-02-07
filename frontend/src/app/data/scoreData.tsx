export interface Score {
  matchweek: number;
  icon_link_1: string;
  icon_link_2: string;
  club_1: string;
  club_2: string;
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
