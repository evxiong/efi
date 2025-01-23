export interface Score {
  pl_ids: [string, string];
  names: [string, string];
  scores: [number, number] | null;
  probs: [number, number, number] | null; // club1 win, draw, club2 win
  time: Date;
  network: string | null;
  complete: boolean;
}

export const scores: Score[] = [
  {
    pl_ids: ["t11", "t6"],
    names: ["Everton", "Tottenham"],
    scores: [3, 2],
    probs: [0.24, 0.2, 0.56],
    time: new Date("2025-01-19T17:00:00Z"),
    network: "USA",
    complete: true,
  },
  {
    pl_ids: ["t1", "t36"],
    names: ["Man United", "Brighton"],
    scores: [1, 3],
    probs: [0.4, 0.21, 0.39],
    time: new Date("2025-01-19T17:00:00Z"),
    network: "Peacock",
    complete: true,
  },
  {
    pl_ids: ["t3", "t7"],
    names: ["Arsenal", "Aston Villa"],
    scores: [2, 2],
    probs: [0.61, 0.21, 0.18],
    time: new Date("2025-01-19T17:00:00Z"),
    network: "NBC",
    complete: true,
  },
  {
    pl_ids: ["t11", "t6"],
    names: ["Everton", "Tottenham"],
    scores: null,
    probs: [0.24, 0.2, 0.56],
    time: new Date("2025-01-19T17:00:00Z"),
    network: "USA",
    complete: false,
  },
  {
    pl_ids: ["t40", "t43"],
    names: ["Ipswich Town", "Man City"],
    scores: [0, 6],
    probs: [0.08, 0.13, 0.79],
    time: new Date("2025-01-19:45:00Z"),
    network: "NBC",
    complete: true,
  },
];
