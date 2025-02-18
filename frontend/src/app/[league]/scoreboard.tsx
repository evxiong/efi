"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import { Score } from "../lib/types";
import useSWR from "swr";
import { useEffect } from "react";
import { formatDate, formatTime } from "../lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function Scoreboard() {
  const fetcher = (url: string) => fetch(url).then((r) => r.json());
  const { data: latest, mutate: mutateLatest } = useSWR(
    "/api/latest",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnMount: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
    },
  );
  const { data: scores_1, isLoading: isLoading_1 } = useSWR(
    `/api/scores?matchweek=${latest?.latest.scores.matchweek}&season=${latest?.latest.scores.season}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnMount: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
    },
  );
  const { data: scores_2, isLoading: isLoading_2 } = useSWR(
    `/api/scores?matchweek=${latest?.latest.scores.matchweek + 1}&season=${latest?.latest.scores.season}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnMount: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
    },
  );

  useEffect(() => {
    if (!latest) mutateLatest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const seenDates = new Set();
  const scoreboard: (Score | Date)[] = [];
  const now = new Date().getTime();

  // scoreboard index of match closest to today; if all matches completed,
  // should be scoreboard.length-1
  let closestInd: number | null = null;

  // ms between today and match date, neg if before now, pos if after now
  let closestDist: number | null = null;

  if (!isLoading_1 && !isLoading_2 && scores_1 && scores_2) {
    for (const data of [scores_1, scores_2]) {
      for (let i = 0; i < data.scores.length; i++) {
        const date = new Date(data.scores[i].time);
        if (!seenDates.has(date.toDateString())) {
          scoreboard.push(date);
          seenDates.add(date.toDateString());
        }
        data.scores[i].time = date;
        scoreboard.push(data.scores[i]);

        const diff = date.getTime() - now; // diff in ms
        // if diff negative (match before now) and more than a day ago,
        // closestInd should be index of next match, if it exists
        // otherwise, use closest match
        if (
          closestDist === null ||
          (closestDist < -86400000 && diff > 0) ||
          (diff < 0 && closestDist < 0 && diff >= closestDist) ||
          (diff > 0 && closestDist > 0 && diff < closestDist)
        ) {
          closestDist = diff;
          closestInd = scoreboard.length - 1;
        }
      }
    }
  }

  return (
    <section className="flex w-full flex-col gap-3 border-b bg-white">
      {isLoading_1 || isLoading_2 || !scores_1 || !scores_2 ? (
        <Skeleton className="h-[66px] w-full rounded-none" />
      ) : (
        <div className="mx-auto flex h-full w-full max-w-7xl flex-col justify-center px-0 lg:px-6">
          <Carousel
            className="flex h-full w-full flex-row items-center"
            opts={{ align: "start", slidesToScroll: "auto", skipSnaps: true }}
            startInd={closestInd}
          >
            <CarouselPrevious variant="ghost" />
            <CarouselContent className="flex w-full flex-row *:border-r [&>div:last-child]:border-none">
              {scoreboard.map((score, i) =>
                score instanceof Date ? (
                  <ScoreboardDate key={i} date={score} />
                ) : (
                  <ScoreboardScore key={i} score={score} />
                ),
              )}
            </CarouselContent>
            <CarouselNext variant="ghost" />
          </Carousel>
        </div>
      )}
    </section>
  );
}

function ScoreboardDate({ date }: { date: Date }) {
  return (
    <CarouselItem>
      <div className="flex h-full w-16 flex-shrink-0 select-none flex-col items-center justify-center rounded-sm bg-gray-50 text-xxs">
        <div className="rounded-sm border border-gray-200 bg-white px-1.5 py-1">
          {formatDate(date, false)}
        </div>
      </div>
    </CarouselItem>
  );
}

function ScoreboardScore({ score }: { score: Score }) {
  const finished =
    score.completed && score.score_1 !== null && score.score_2 !== null;
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
    <CarouselItem>
      <div className="mx-0.5 flex h-full w-32 select-none flex-col gap-1.5 bg-white px-1.5 py-1.5 text-[13px] leading-4">
        <div className="flex flex-row justify-between gap-1 text-xxs text-gray-700">
          <div>{score.completed ? "FT" : formatTime(score.time)}</div>
          <div>{score.completed ? "" : score.network}</div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex flex-row justify-between gap-1 font-medium text-gray-900">
            <div className="flex flex-row items-center gap-1.5">
              <div className="relative h-4 w-4">
                <Image
                  alt={score.club_1 + " logo"}
                  src={score.icon_link_1}
                  sizes="50px"
                  fill={true}
                  draggable={false}
                  className="flex-shrink-0 select-none object-contain"
                />
              </div>
              <span
                className={`${!finished || W || D ? "" : "font-normal text-gray-500"}`}
              >
                {score.club_1_abbrev}
              </span>
            </div>
            <div
              className={`${prob_1_max || W || D ? "" : "font-normal text-gray-500"} ${!finished ? "text-xs" : ""}`}
            >
              {finished
                ? score.score_1
                : score.prob_1
                  ? (score.prob_1 * 100).toFixed() + "%"
                  : "—"}
            </div>
          </div>
          <div className="flex flex-row justify-between gap-1 font-medium text-gray-900">
            <div className="flex flex-row items-center gap-1.5">
              <div className="relative h-4 w-4">
                <Image
                  alt={score.club_2 + " logo"}
                  src={score.icon_link_2}
                  sizes="50px"
                  fill={true}
                  draggable={false}
                  className="flex-shrink-0 select-none object-contain"
                />
              </div>
              <span
                className={`${!finished || D || L ? "" : "font-normal text-gray-500"}`}
              >
                {score.club_2_abbrev}
              </span>
            </div>
            <div
              className={`${prob_2_max || D || L ? "" : "font-normal text-gray-500"} ${!finished ? "text-xs" : ""}`}
            >
              {finished
                ? score.score_2
                : score.prob_2
                  ? (score.prob_2 * 100).toFixed() + "%"
                  : "—"}
            </div>
          </div>
        </div>
      </div>
    </CarouselItem>
  );
}
