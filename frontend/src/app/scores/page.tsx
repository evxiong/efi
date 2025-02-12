"use client";

import type { Score as ScoreType } from "../data/scoreData";
import Score from "./score";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import useSWR from "swr";

export default function ScoresTab() {
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

  const matchweeks = [...Array(38)].map(
    (_, i) => "Matchweek " + (i + 1).toFixed(),
  );
  const [matchweek, setMatchweek] = useState<number | null>(null);
  const seasons: number[] = latest ? latest.latest.seasons : [];
  const seasonOptions = seasons.map((d) => `${d}/${(d + 1) % 100}`);
  const [season, setSeason] = useState<number | null>(null);

  const { data, isLoading } = useSWR(
    `/api/scores?matchweek=${matchweek}&season=${season}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnMount: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
    },
  );

  useEffect(() => {
    if (latest === undefined) return;
    setMatchweek(latest.latest.scores.matchweek);
    setSeason(latest.latest.scores.season);
  }, [latest]);

  useEffect(() => {
    if (!latest) mutateLatest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isLoading && data) {
    for (let i = 0; i < data.scores.length; i++) {
      data.scores[i].time = new Date(data.scores[i].time);
    }
  }
  const scores: ScoreType[] = !isLoading && data ? data.scores : [];
  const scoresByDate: Map<string, ScoreType[]> = scores.reduce((acc, score) => {
    const dateString = score.time.toLocaleDateString([], {
      timeZone: "UTC",
      month: "long",
      weekday: "long",
      day: "numeric",
    });
    const arr = acc.get(dateString) || [];
    arr.push(score);
    acc.set(dateString, arr);
    return acc;
  }, new Map<string, ScoreType[]>());

  // assume there is a max of 30 distinct days within a single matchweek
  const accordionValues = [...Array(30)].map((_, i) => i.toString());

  return (
    <div className="flex w-full flex-col">
      <section className="mx-auto flex w-full max-w-7xl px-4 sm:px-6">
        <div className="mb-20 flex w-full flex-col gap-4 pt-2">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-row gap-2.5">
              <Select
                disabled={matchweek && season ? false : true}
                value={matchweek ? matchweek.toFixed() : ""}
                onValueChange={(value) => setMatchweek(parseInt(value))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Matchweek" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Matchweek</SelectLabel>
                    {matchweeks.map((mw, i) => (
                      <SelectItem key={i} value={(i + 1).toFixed()}>
                        {mw}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select
                disabled={matchweek && season ? false : true}
                value={season ? season.toFixed() : ""}
                onValueChange={(value) => setSeason(parseInt(value))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Season" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Season</SelectLabel>
                    {seasonOptions.map((s, i) => (
                      <SelectItem key={i} value={seasons[i].toFixed()}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="text-xs font-medium text-gray-500 md:text-right">
              <p>All times shown in your local time.</p>
              <p>Scores update daily around midnight UTC.</p>
            </div>
          </div>
          {matchweek === null || isLoading ? (
            <div className="mt-4 flex flex-col gap-8">
              <div>
                <Skeleton className="h-6 w-20" />
                <div className="mb-6 mt-3 grid grid-cols-[repeat(auto-fill,_minmax(13rem,_1fr))] gap-x-8 gap-y-6 pl-2">
                  <Skeleton className="h-24" />
                  <Skeleton className="h-24" />
                  <Skeleton className="h-24" />
                  <Skeleton className="h-24" />
                  <Skeleton className="h-24" />
                  <Skeleton className="h-24" />
                  <Skeleton className="h-24" />
                </div>
              </div>
              <div>
                <Skeleton className="h-6 w-20" />
                <div className="mb-6 mt-3 grid grid-cols-[repeat(auto-fill,_minmax(13rem,_1fr))] gap-x-8 gap-y-6 pl-2">
                  <Skeleton className="h-24" />
                  <Skeleton className="h-24" />
                  <Skeleton className="h-24" />
                </div>
              </div>
            </div>
          ) : (
            <Accordion
              className="flex flex-col"
              type="multiple"
              defaultValue={accordionValues}
            >
              {[...scoresByDate.keys()].map((date, i) => (
                <AccordionItem
                  key={i}
                  value={i.toString()}
                  className="border-none"
                >
                  <AccordionTrigger className="text-base font-semibold text-gray-700">
                    {date}
                  </AccordionTrigger>
                  <AccordionContent className="mb-6 grid grid-cols-[repeat(auto-fill,_minmax(13rem,_1fr))] gap-x-8 gap-y-6 pl-2">
                    {scoresByDate.get(date)!.map((s, i) => (
                      <Score key={i} score={s} selectedMatchweek={matchweek} />
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </section>
    </div>
  );
}
