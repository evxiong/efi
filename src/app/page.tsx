import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  IconCaretDownFilled,
  IconCaretUpFilled,
  IconEqual,
} from "@tabler/icons-react";

export default function Home() {
  return (
    <div className="flex w-full flex-col pt-10">
      <section className="mx-auto flex w-full max-w-7xl px-6">
        <Tabs defaultValue="scores" className="w-full">
          <TabsList className="mb-10 w-fit">
            <TabsTrigger value="scores" className="px-6">
              Scores
            </TabsTrigger>
            <TabsTrigger value="table" className="px-6">
              Table
            </TabsTrigger>
          </TabsList>
          <TabsContent value="scores" className="w-full">
            <ScoresTab />
          </TabsContent>
          <TabsContent value="table" className="w-full">
            <TableTab />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}

function TableTab() {
  return (
    <div className="flex flex-col gap-4">
      <div className="text-2xl">Table</div>
      <Table>
        <TableHeader>
          <TableRow className="text-xs text-gray-500 hover:bg-transparent">
            <TableHead className="w-20 min-w-20">RK</TableHead>
            <TableHead className="min-w-44">CLUB</TableHead>
            <TableHead className="w-16 min-w-16 text-center text-gray-900">
              PLFI
            </TableHead>
            <TableHead className="w-12 min-w-12 text-center text-gray-900">
              OFF
            </TableHead>
            <TableHead className="w-12 min-w-12 text-center text-gray-900">
              DEF
            </TableHead>
            <TableHead className="relative text-center text-gray-900 before:absolute before:left-1.5 before:top-1/2 before:-translate-y-1/2 before:text-[10px] before:font-normal before:text-gray-500 before:content-['1'] after:absolute after:right-1.5 after:top-1/2 after:-translate-y-1/2 after:text-[10px] after:font-normal after:text-gray-500 after:content-['20']">
              <div>POS</div>
            </TableHead>
            <TableHead className="text-center text-gray-900">REL</TableHead>
            <TableHead className="text-center text-gray-900">T4</TableHead>
            <TableHead className="text-center text-gray-900">CH</TableHead>
            <TableHead className="w-10 min-w-10 text-center">MP</TableHead>
            <TableHead className="w-10 min-w-10 text-center">W</TableHead>
            <TableHead className="w-10 min-w-10 text-center">D</TableHead>
            <TableHead className="w-10 min-w-10 text-center">L</TableHead>
            <TableHead className="w-10 min-w-10 text-center">GF</TableHead>
            <TableHead className="w-10 min-w-10 text-center">GA</TableHead>
            <TableHead className="w-10 min-w-10 text-center">GD</TableHead>
            <TableHead className="w-10 min-w-10 text-center">PTS</TableHead>
            <TableHead>FORM</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="border-b text-base text-gray-500">
          {rows.map((r, i) => (
            <Row key={i} row={r} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

interface Row {
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
}

const rows: Row[] = [
  {
    rank: 1,
    change: 3,
    pl_id: "t6",
    name: "Tottenham",
    efi: 77.8,
    off: 1.6,
    def: 1.1,
    mp: 22,
    w: 10,
    d: 5,
    l: 7,
    gf: 32,
    ga: 21,
    gd: 11,
    pts: 35,
    form: ["D", "L", "W", "L", "D"],
  },
  {
    rank: 2,
    change: -1,
    pl_id: "t43",
    name: "Man City",
    efi: 77.8,
    off: 1.6,
    def: 1.1,
    mp: 22,
    w: 10,
    d: 5,
    l: 7,
    gf: 32,
    ga: 21,
    gd: 11,
    pts: 35,
    form: ["D", "L", "W", "L", "D"],
  },
  {
    rank: 3,
    change: 0,
    pl_id: "t3",
    name: "Arsenal",
    efi: 77.8,
    off: 1.6,
    def: 1.1,
    mp: 22,
    w: 10,
    d: 5,
    l: 7,
    gf: 32,
    ga: 21,
    gd: 11,
    pts: 35,
    form: ["D", "L", "W", "L", "D"],
  },
  {
    rank: 4,
    change: 0,
    pl_id: "t8",
    name: "Chelsea",
    efi: 77.8,
    off: 1.6,
    def: 1.1,
    mp: 22,
    w: 10,
    d: 5,
    l: 7,
    gf: 32,
    ga: 21,
    gd: 11,
    pts: 35,
    form: ["D", "L", "W", "L", "D"],
  },
  {
    rank: 5,
    change: 0,
    pl_id: "t1",
    name: "Man United",
    efi: 77.8,
    off: 1.6,
    def: 1.1,
    mp: 22,
    w: 10,
    d: 5,
    l: 7,
    gf: 32,
    ga: 21,
    gd: 11,
    pts: 35,
    form: ["D", "L", "W", "L", "D"],
  },
  {
    rank: 6,
    change: 0,
    pl_id: "t36",
    name: "Brighton",
    efi: 77.8,
    off: 1.6,
    def: 1.1,
    mp: 22,
    w: 10,
    d: 5,
    l: 7,
    gf: 32,
    ga: 21,
    gd: 11,
    pts: 35,
    form: ["D", "L", "W", "L", "D"],
  },
  {
    rank: 7,
    change: 0,
    pl_id: "t17",
    name: "Nott’m Forest",
    efi: 77.8,
    off: 1.6,
    def: 1.1,
    mp: 22,
    w: 10,
    d: 5,
    l: 7,
    gf: 32,
    ga: 21,
    gd: 11,
    pts: 35,
    form: ["D", "L", "W", "L", "D"],
  },
  {
    rank: 8,
    change: 0,
    pl_id: "t21",
    name: "West Ham",
    efi: 77.8,
    off: 1.6,
    def: 1.1,
    mp: 22,
    w: 10,
    d: 5,
    l: 7,
    gf: 32,
    ga: 21,
    gd: 11,
    pts: 35,
    form: ["D", "L", "W", "L", "D"],
  },
  {
    rank: 9,
    change: 0,
    pl_id: "t39",
    name: "Wolves",
    efi: 77.8,
    off: 1.6,
    def: 1.1,
    mp: 22,
    w: 10,
    d: 5,
    l: 7,
    gf: 32,
    ga: 21,
    gd: 11,
    pts: 35,
    form: ["D", "L", "W", "L", "D"],
  },
  {
    rank: 10,
    change: -2,
    pl_id: "t7",
    name: "Aston Villa",
    efi: 77.8,
    off: 1.6,
    def: 1.1,
    mp: 22,
    w: 10,
    d: 5,
    l: 7,
    gf: 32,
    ga: 21,
    gd: 11,
    pts: 35,
    form: ["D", "L", "W", "L", "D"],
  },
  {
    rank: 11,
    change: 0,
    pl_id: "t14",
    name: "Liverpool",
    efi: 77.8,
    off: 1.6,
    def: 1.1,
    mp: 22,
    w: 10,
    d: 5,
    l: 7,
    gf: 32,
    ga: 21,
    gd: 11,
    pts: 35,
    form: ["D", "L", "W", "L", "D"],
  },
];

function Row({ row }: { row: Row }) {
  const formLatestIndex = row.form.filter((r) => r !== null).length - 1;

  return (
    <TableRow>
      <TableCell className="w-20 min-w-20">
        <div className="flex flex-row items-center gap-1.5 text-sm font-medium">
          <span className="w-5">{row.rank}</span>
          <ChangeIndicator change={row.change} />
        </div>
      </TableCell>
      <TableCell className="min-w-44 font-semibold text-gray-900">
        <div className="flex flex-row items-center gap-2.5">
          <Image
            alt={row.name + " logo"}
            src={
              "https://resources.premierleague.com/premierleague/badges/50/" +
              row.pl_id +
              ".png"
            }
            height={24}
            width={24}
            draggable={false}
            className="flex-shrink-0"
          />
          {row.name}
        </div>
      </TableCell>
      <TableCell className="w-16 min-w-16 text-center text-base font-medium text-gray-900">
        {row.efi}
      </TableCell>
      <TableCell className="w-12 min-w-12 text-center text-sm font-medium text-gray-900">
        {row.off}
      </TableCell>
      <TableCell className="w-12 min-w-12 text-center text-sm font-medium text-gray-900">
        {row.def}
      </TableCell>
      <TableCell className="w-20 min-w-20 cursor-crosshair">
        <Positions />
      </TableCell>
      <TableCell className="w-12 min-w-12 text-center text-sm font-medium text-gray-900">
        21%
      </TableCell>
      <TableCell className="w-12 min-w-12 text-center text-sm font-medium text-gray-900">
        10%
      </TableCell>
      <TableCell className="w-12 min-w-12 text-center text-sm font-medium text-gray-900">
        —
      </TableCell>
      <TableCell className="w-10 min-w-10 text-center text-sm font-medium">
        {row.mp}
      </TableCell>
      <TableCell className="w-10 min-w-10 text-center text-sm font-medium">
        {row.w}
      </TableCell>
      <TableCell className="w-10 min-w-10 text-center text-sm font-medium">
        {row.d}
      </TableCell>
      <TableCell className="w-10 min-w-10 text-center text-sm font-medium">
        {row.l}
      </TableCell>
      <TableCell className="w-10 min-w-10 text-center text-sm font-medium">
        {row.gf}
      </TableCell>
      <TableCell className="w-10 min-w-10 text-center text-sm font-medium">
        {row.ga}
      </TableCell>
      <TableCell className="w-10 min-w-10 text-center text-sm font-medium">
        {(row.gd > 0 ? "+" : "") + row.gd.toFixed()}
      </TableCell>
      <TableCell className="w-10 min-w-10 text-center text-sm font-medium">
        {row.pts}
      </TableCell>
      <TableCell>
        <div className="flex flex-row items-center gap-1">
          {row.form.map((r, i) => (
            <Form key={i} result={r} outline={i === formLatestIndex} />
          ))}
        </div>
      </TableCell>
    </TableRow>
  );
}

function Positions() {
  const probs = [
    0, 0, 0.04, 0.15, 0.28, 0.32, 0.1, 0.05, 0.03, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0,
  ];
  return (
    <div className="flex flex-row gap-0.5">
      {probs.map((p, i) => (
        <div
          key={i}
          style={{ opacity: 3 * p + 0.1 }}
          className="h-6 w-0.5 rounded-sm bg-gray-900"
        ></div>
      ))}
    </div>
  );
}

function ChangeIndicator({ change }: { change: number }) {
  return (
    <div
      className={`${change > 0 ? "text-emerald-500" : change < 0 ? "text-rose-500" : "text-gray-500"} flex flex-row items-center text-xs font-semibold`}
    >
      {change > 0 ? (
        <IconCaretUpFilled className="size-3.5" />
      ) : change < 0 ? (
        <IconCaretDownFilled className="size-3.5" />
      ) : (
        <IconEqual className="size-3.5" />
      )}
      {change !== 0 && <span>{Math.abs(change)}</span>}
    </div>
  );
}

function Form({
  result,
  outline,
}: {
  result: string | null;
  outline: boolean;
}) {
  return (
    <div
      className={`${result === null ? "invisible" : "visible"} ${result === "W" ? "bg-emerald-500 outline-emerald-500" : result === "L" ? "bg-rose-500 outline-rose-500" : "bg-gray-500 outline-gray-500"} ${outline ? "underline outline" : ""} relative h-4 w-4 select-none rounded-full outline-1 outline-offset-1`}
    >
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[11px] font-medium leading-3 text-white">
        {result}
      </div>
    </div>
  );
}

function ScoresTab() {
  return (
    <div className="flex flex-col gap-4">
      <div className="text-2xl">Matchweek 23</div>
      <div className="font-semibold text-gray-700">Sunday, January 19th</div>
      <div className="grid grid-cols-[repeat(auto-fill,_minmax(14rem,_1fr))] gap-x-6 gap-y-4">
        {scores.map((s, i) => (
          <Score key={i} score={s} />
        ))}
      </div>
    </div>
  );
}

interface Score {
  pl_ids: [string, string];
  names: [string, string];
  scores: [number, number] | null;
  probs: [number, number, number] | null; // club1 win, draw, club2 win
  time: Date;
  network: string | null;
  complete: boolean;
}

const scores: Score[] = [
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

function Score({ score }: { score: Score }) {
  const W = score.complete && score.scores && score.scores[0] > score.scores[1];
  const D =
    score.complete && score.scores && score.scores[0] === score.scores[1];
  const L = score.complete && score.scores && score.scores[0] < score.scores[1];
  const prob1 =
    !score.complete &&
    score.probs &&
    score.probs[0] === Math.max(...score.probs);
  const prob2 =
    !score.complete &&
    score.probs &&
    score.probs[1] === Math.max(...score.probs);
  const prob3 =
    !score.complete &&
    score.probs &&
    score.probs[2] === Math.max(...score.probs);
  return (
    <div className="flex w-full flex-col text-base leading-5">
      <div className="mb-2 flex flex-row items-center justify-between text-xs font-medium text-gray-900">
        <div>
          {score.complete
            ? "FT"
            : score.time
                .toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                })
                .replace(" PM", "pm")
                .replace(" AM", "am")}
        </div>
        <div>{score.complete ? "" : score.network}</div>
      </div>
      <div className="flex flex-row items-center justify-between gap-2.5 border-y border-gray-300 text-base font-normal text-gray-500">
        <div className="flex w-full flex-col py-2">
          <div
            className={`${W || D || !score.complete ? "font-semibold text-gray-900" : ""} flex h-5 flex-row items-center justify-between pr-2.5`}
          >
            <div className="flex h-5 flex-row items-center gap-2">
              <Image
                alt={score.names[0] + " logo"}
                src={
                  "https://resources.premierleague.com/premierleague/badges/50/" +
                  score.pl_ids[0] +
                  ".png"
                }
                height={20}
                width={20}
                draggable={false}
                className="flex-shrink-0"
              />
              {score.names[0]}
            </div>
            <div>{score.scores?.[0]}</div>
          </div>
          <div className="flex h-5 items-center justify-center">
            <hr className="w-full border-gray-300" />
          </div>
          <div
            className={`${D || L || !score.complete ? "font-semibold text-gray-900" : ""} flex h-5 flex-row items-center justify-between pr-2.5`}
          >
            <div className="flex h-5 flex-row items-center gap-2">
              <Image
                alt={score.names[1] + " logo"}
                src={
                  "https://resources.premierleague.com/premierleague/badges/50/" +
                  score.pl_ids[1] +
                  ".png"
                }
                height={20}
                width={20}
                draggable={false}
                className="flex-shrink-0"
              />
              {score.names[1]}
            </div>
            <div>{score.scores?.[1]}</div>
          </div>
        </div>
        <div className="text-ss flex w-10 flex-shrink-0 select-none flex-col font-normal text-gray-500">
          <div
            className={`${W ? "border font-semibold text-gray-900" : prob1 ? "font-semibold text-zinc-900" : ""} flex h-5 items-center justify-center rounded-[0.25rem] border-gray-900`}
          >
            {score.probs && (score.probs[0] * 100).toFixed() + "%"}
          </div>
          <div
            className={`${D ? "border font-semibold text-gray-900" : prob2 ? "font-semibold text-zinc-900" : ""} flex h-5 items-center justify-center rounded-[0.25rem] border-gray-900`}
          >
            {score.probs && (score.probs[1] * 100).toFixed() + "%"}
          </div>
          <div
            className={`${L ? "border font-semibold text-gray-900" : prob3 ? "font-semibold text-zinc-900" : ""} flex h-5 items-center justify-center rounded-[0.25rem] border-gray-900`}
          >
            {score.probs && (score.probs[2] * 100).toFixed() + "%"}
          </div>
        </div>
      </div>
    </div>
  );
}
