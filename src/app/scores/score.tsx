import Image from "next/image";
import { Score } from "../data/scoreData";

export default function Score({
  score,
  selectedMatchweek,
}: {
  score: Score;
  selectedMatchweek: number;
}) {
  const finished =
    score.completed && score.score_1 !== null && score.score_2 !== null;
  const noPredictions =
    score.prob_1 === null && score.prob_2 === null && score.prob_d === null;
  const W = finished && score.score_1! > score.score_2!;
  const D = finished && score.score_1 === score.score_2;
  const L = finished && score.score_1! < score.score_2!;
  const prob_1_max =
    !score.completed &&
    score.prob_1 === Math.max(score.prob_1, score.prob_2, score.prob_d);
  const prob_d_max =
    !score.completed &&
    score.prob_d === Math.max(score.prob_1, score.prob_2, score.prob_d);
  const prob_2_max =
    !score.completed &&
    score.prob_2 === Math.max(score.prob_1, score.prob_2, score.prob_d);
  return (
    <div className="flex w-full flex-col text-base leading-5">
      <div className="mb-1 flex flex-row items-center justify-between text-xs font-medium text-gray-900">
        <div>
          {selectedMatchweek !== score.matchweek ? (
            <>
              <span>MW {score.matchweek}</span>&nbsp;&nbsp;·&nbsp;&nbsp;
            </>
          ) : score.matchweek !== score.display_with_matchweek ? (
            <>
              <span>Resched</span>&nbsp;&nbsp;·&nbsp;&nbsp;
            </>
          ) : (
            <></>
          )}
          <span>
            {score.completed
              ? "FT"
              : score.time
                  .toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })
                  .replace(" PM", "pm")
                  .replace(" AM", "am")}
          </span>
        </div>
        <div>{score.completed ? "" : score.network}</div>
      </div>
      <div className="flex flex-row items-center justify-between gap-2.5 border-y border-gray-300 text-base font-normal text-gray-500">
        <div className="flex w-full flex-col py-2">
          <div
            className={`${W || D || !score.completed ? "font-semibold text-gray-900" : ""} flex h-5 flex-row items-center justify-between pr-2.5`}
          >
            <div className="flex h-5 flex-row items-center gap-2">
              <div className="relative h-5 w-5">
                <Image
                  alt={score.club_1 + " logo"}
                  src={
                    "https://resources.premierleague.com/premierleague/badges/50/" +
                    score.pl_id_1 +
                    ".png"
                  }
                  sizes="50px"
                  fill={true}
                  draggable={false}
                  className="flex-shrink-0 select-none"
                />
              </div>

              <span>{score.club_1}</span>
            </div>
            <div>{score.score_1}</div>
          </div>
          <div className="flex h-5 items-center justify-center">
            <hr className="w-full border-gray-300" />
          </div>
          <div
            className={`${D || L || !score.completed ? "font-semibold text-gray-900" : ""} flex h-5 flex-row items-center justify-between pr-2.5`}
          >
            <div className="flex h-5 flex-row items-center gap-2">
              <div className="relative h-5 w-5">
                <Image
                  alt={score.club_2 + " logo"}
                  src={
                    "https://resources.premierleague.com/premierleague/badges/50/" +
                    score.pl_id_2 +
                    ".png"
                  }
                  sizes="50px"
                  fill={true}
                  draggable={false}
                  className="flex-shrink-0 select-none"
                />
              </div>
              <span>{score.club_2}</span>
            </div>
            <div>{score.score_2}</div>
          </div>
        </div>
        <div className="text-ss flex w-10 flex-shrink-0 select-none flex-col font-normal text-gray-500">
          <div
            className={`${W ? "border font-semibold text-gray-900" : prob_1_max ? "font-semibold text-zinc-900" : ""} flex h-5 items-center justify-center rounded-[0.25rem] border-gray-900`}
          >
            {score.prob_1 ? (score.prob_1 * 100).toFixed() + "%" : "—"}
          </div>
          <div
            className={`${D ? "border font-semibold text-gray-900" : prob_d_max ? "font-semibold text-zinc-900" : ""} flex h-5 items-center justify-center rounded-[0.25rem] border-gray-900`}
          >
            {score.prob_d ? (score.prob_d * 100).toFixed() + "%" : "—"}
          </div>
          <div
            className={`${L ? "border font-semibold text-gray-900" : prob_2_max ? "font-semibold text-zinc-900" : ""} flex h-5 items-center justify-center rounded-[0.25rem] border-gray-900`}
          >
            {score.prob_2 ? (score.prob_2 * 100).toFixed() + "%" : "—"}
          </div>
        </div>
      </div>
    </div>
  );
}
