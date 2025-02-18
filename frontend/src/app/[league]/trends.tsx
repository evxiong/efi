"use client";

import {
  IconArrowNarrowRightDashed,
  IconTrendingDown,
  IconTrendingUp,
} from "@tabler/icons-react";
import Image from "next/image";
import { Competition } from "../lib/types";
import useSWR from "swr";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface Trend {
  short_name: string;
  icon_link: string;
  change: number;
  current: number;
}

export default function Trends({ competition }: { competition: Competition }) {
  const fetcher = (url: string) => fetch(url).then((r) => r.json());
  const {
    data: latest,
    isLoading,
    mutate: mutateLatest,
  } = useSWR(`/api/latest?competition=${competition.id}`, fetcher, {
    revalidateOnFocus: false,
    revalidateOnMount: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
  });

  useEffect(() => {
    if (!latest) mutateLatest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const trendingUp: Trend = latest?.latest
    ? latest.latest.trends
      ? latest.latest.trends.up
      : null
    : undefined;
  const trendingDown: Trend = latest?.latest
    ? latest.latest.trends
      ? latest.latest.trends.down
      : null
    : undefined;

  return (
    <div className="hidden flex-row items-center gap-4 md:flex">
      {isLoading || trendingUp === undefined || trendingDown === undefined ? (
        <>
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-[75px] w-36" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-[75px] w-36" />
          </div>
        </>
      ) : (
        trendingUp &&
        trendingDown && (
          <>
            <Stat up={true} trend={trendingUp} />
            <Stat up={false} trend={trendingDown} />
          </>
        )
      )}
    </div>
  );
}

function Stat({ up, trend }: { up: boolean; trend: Trend }) {
  return (
    <div>
      <div className="mb-1.5 flex flex-row items-center gap-1.5 text-xs font-medium text-gray-500">
        {up ? (
          <IconTrendingUp className="size-4" />
        ) : (
          <IconTrendingDown className="size-4" />
        )}
        {up ? "On the rise" : "Dropping off"}
      </div>
      <div className="flex min-w-36 flex-col gap-2 border bg-white p-2 backdrop-blur-sm">
        <div className="flex flex-row items-center justify-between gap-0.5 border-b pb-2">
          <div
            className={`${up ? "text-emerald-500" : "text-rose-500"} text-xl font-medium leading-5 tracking-tight`}
          >
            {trend.change > 0
              ? `+${trend.change.toFixed(1)}`
              : trend.change.toFixed(1)}
          </div>
          <IconArrowNarrowRightDashed className="size-5 stroke-gray-400" />
          <div className="text-xl leading-5 tracking-tight text-gray-500">
            {trend.current.toFixed(1)}
          </div>
        </div>
        <div className="flex flex-row items-center gap-1.5">
          <div className="relative h-5 w-5">
            <Image
              alt={`${trend.short_name} logo`}
              src={trend.icon_link}
              fill={true}
              sizes="50px"
              draggable={false}
              className="flex-shrink-0 select-none object-contain"
            />
          </div>
          <span className="text-sm font-medium leading-4 text-gray-700">
            {trend.short_name}
          </span>
        </div>
      </div>
    </div>
  );
}
