import Image from "next/image";
import { Score, scores } from "../data/scoreData";

export default function ScoresTab() {
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
                className="flex-shrink-0 select-none"
              />
              <span>{score.names[0]}</span>
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
                className="flex-shrink-0 select-none"
              />
              <span>{score.names[1]}</span>
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
