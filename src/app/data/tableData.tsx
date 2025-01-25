export interface Row {
  update_date: string;
  rank: number;
  change: number;
  pl_id: string;
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
  avg_pts: number;
  avg_gd: number;
}
