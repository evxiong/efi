import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Home() {
  return (
    <div className="flex w-full flex-col pt-10">
      <section className="mx-auto flex w-full max-w-7xl px-6">
        <Tabs defaultValue="scores" className="w-full">
          <TabsList className="mb-10 w-fit">
            <TabsTrigger value="scores" className="px-4">
              Scores
            </TabsTrigger>
            <TabsTrigger value="table" className="px-4">
              Table
            </TabsTrigger>
            <TabsTrigger value="projections" className="px-4">
              Projections
            </TabsTrigger>
          </TabsList>
          <TabsContent value="scores" className="w-full">
            <ScoresTab />
          </TabsContent>
          <TabsContent value="table">table tab</TabsContent>
          <TabsContent value="projections">projections tab</TabsContent>
        </Tabs>
      </section>
    </div>
  );
}

function ScoresTab() {
  return (
    <div className="flex flex-col gap-4">
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
  espn_ids: [number, number];
  names: [string, string];
  scores: [number, number] | null;
  probs: [number, number, number] | null; // club1 win, draw, club2 win
  time: Date;
  network: string | null;
  complete: boolean;
}

const scores: Score[] = [
  {
    espn_ids: [368, 367],
    names: ["Everton", "Tottenham"],
    scores: [3, 2],
    probs: [0.24, 0.2, 0.56],
    time: new Date("2025-01-19T17:00:00Z"),
    network: "USA",
    complete: true,
  },
  {
    espn_ids: [360, 331],
    names: ["Man United", "Brighton"],
    scores: [1, 3],
    probs: [0.4, 0.21, 0.39],
    time: new Date("2025-01-19T17:00:00Z"),
    network: "Peacock",
    complete: true,
  },
  {
    espn_ids: [359, 362],
    names: ["Arsenal", "Aston Villa"],
    scores: [2, 2],
    probs: [0.61, 0.21, 0.18],
    time: new Date("2025-01-19T17:00:00Z"),
    network: "NBC",
    complete: true,
  },
  {
    espn_ids: [368, 367],
    names: ["Everton", "Tottenham"],
    scores: null,
    probs: [0.24, 0.2, 0.56],
    time: new Date("2025-01-19T17:00:00Z"),
    network: "USA",
    complete: false,
  },
  {
    espn_ids: [373, 382],
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
                  "https://a.espncdn.com/i/teamlogos/soccer/500/" +
                  score.espn_ids[0].toFixed() +
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
                  "https://a.espncdn.com/i/teamlogos/soccer/500/" +
                  score.espn_ids[1].toFixed() +
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
