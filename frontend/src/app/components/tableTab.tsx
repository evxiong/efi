"use client";

import { useEffect, useState } from "react";
import RankingsTable from "./table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Competition, Row, Season } from "../lib/types";
import { formatDate } from "../lib/utils";
import useSWR from "swr";
import { Skeleton } from "@/components/ui/skeleton";

export default function TableTab({
  competition,
}: {
  competition: Competition;
}) {
  const fetcher = (url: string) => fetch(url).then((r) => r.json());
  const {
    data: latest,
    isLoading: latestIsLoading,
    mutate: mutateLatest,
  } = useSWR(`/api/latest?competition=${competition.id}`, fetcher, {
    revalidateOnFocus: false,
    revalidateOnMount: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
  });

  const seasons: number[] = latest?.latest
    ? latest.latest.seasons.map((s: Season) => s.season)
    : [];
  const seasonOptions = seasons.map((d) => `${d}/${(d + 1) % 100}`);
  const [matchweek, setMatchweek] = useState<number | null>(null);
  const [season, setSeason] = useState<number | null>(null);

  const matchweeks: string[] = [
    ...Array(
      latest?.latest
        ? latest.latest.seasons.at(
            latest.latest.seasons.findIndex((s: Season) => s.season === season),
          ).matchweeks + 1
        : 0,
    ),
  ].map((_, i) => (i === 0 ? "Preseason" : "Matchweek " + i.toFixed()));

  const { data, isLoading } = useSWR(
    `/api/table?competition=${competition.id}&season=${season}&matchweek=${matchweek}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnMount: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
    },
  );

  useEffect(() => {
    if (matchweek !== null && matchweek > matchweeks.length - 1) {
      setMatchweek(matchweeks.length - 1);
    }
  }, [season, matchweek, matchweeks.length]);

  useEffect(() => {
    if (latest === undefined || !latest.latest) return;
    setMatchweek(latest.latest?.table.matchweek);
    setSeason(latest.latest?.table.season);
  }, [latest]);

  useEffect(() => {
    if (!latest) mutateLatest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [showDetails, setShowDetails] = useState<boolean | "indeterminate">(
    false,
  );
  const [rows, setRows] = useState<Row[]>([]);
  const [selectedSortKey, setSelectedSortKey] = useState<keyof Row>("efi");
  const [sortDesc, setSortDesc] = useState(true);

  const dateString = rows.length > 0 ? rows[0].update_date : "";
  const completedMatches = data ? data.completed_matches : 0;
  const totalMatches = data ? data.total_matches : 0;
  const ranks = sortedRowsToRanks([...rows], selectedSortKey, sortDesc);

  useEffect(() => {
    if (data === undefined) return;
    setRows(
      data === null
        ? []
        : sortRows([...(data.rows as Row[])], selectedSortKey, sortDesc),
    );
  }, [selectedSortKey, sortDesc, data]);

  function setSortState(sortKey: keyof Row, sortDesc: boolean) {
    if (sortKey !== selectedSortKey) {
      setSelectedSortKey(sortKey);
    }
    setSortDesc(sortDesc);
  }

  return (
    <div className="flex w-full flex-col">
      <section className="mx-auto flex w-full max-w-7xl px-4 sm:px-6">
        <div className="mb-20 flex w-full flex-col gap-4 pt-2">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div className="flex flex-row gap-2.5">
                <Select
                  disabled={
                    matchweek !== null && season !== null ? false : true
                  }
                  value={matchweek !== null ? matchweek.toFixed() : ""}
                  onValueChange={(value) => setMatchweek(parseInt(value))}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Matchweek" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Matchweek</SelectLabel>
                      {matchweeks.map((mw, i) => (
                        <SelectItem key={i} value={i.toFixed()}>
                          {mw}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Select
                  disabled={
                    matchweek !== null && season !== null ? false : true
                  }
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
            </div>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="text-sm text-gray-700">
                {matchweek === null || latestIsLoading || isLoading ? (
                  <Skeleton className="mb-1 h-5 w-40" />
                ) : (
                  <p className="font-semibold">
                    {rows && dateString
                      ? `Rankings as of ${formatDate(dateString)}`
                      : `No matches have been played in Matchweek ${matchweek}.`}
                  </p>
                )}
                {matchweek === null || latestIsLoading || isLoading ? (
                  <Skeleton className="h-3 w-64" />
                ) : (
                  <p className="text-xs">
                    {rows.length > 0
                      ? matchweek === 0
                        ? "Preseason rankings"
                        : `Includes ${completedMatches} of ${totalMatches} matches played in Matchweek ${matchweek}.`
                      : "Rankings update daily around midnight UTC."}
                  </p>
                )}
              </div>
              {matchweek === null || latestIsLoading || isLoading ? (
                <Skeleton className="h-3.5 w-32" />
              ) : (
                rows.length > 0 && (
                  <div className="flex flex-row items-center gap-1.5">
                    <Checkbox
                      id="stats"
                      checked={showDetails}
                      onCheckedChange={setShowDetails}
                    />
                    <label
                      htmlFor="stats"
                      className="text-xs font-medium leading-3 text-gray-500"
                    >
                      Show detailed table
                    </label>
                  </div>
                )
              )}
            </div>
          </div>

          <RankingsTable
            rows={rows}
            ranks={ranks}
            showDetails={showDetails === true}
            loading={matchweek === null || latestIsLoading || isLoading}
            selectedSortKey={selectedSortKey}
            sortDesc={sortDesc}
            setSortState={setSortState}
          />
        </div>
      </section>
    </div>
  );
}

function sortRows(rows: Row[], sortKey: keyof Row, desc: boolean): Row[] {
  return sortKey === "pts"
    ? rows.sort((a, b) =>
        desc
          ? b["pts"] - a["pts"] || b["gd"] - a["gd"] || b["gf"] - a["gf"]
          : a["pts"] - b["pts"] || a["gd"] - b["gd"] || a["gf"] - b["gf"],
      )
    : rows.sort((a, b) =>
        desc
          ? (b[sortKey] as number) - (a[sortKey] as number)
          : (a[sortKey] as number) - (b[sortKey] as number),
      );
}

function sortedRowsToRanks(
  rows: Row[],
  sortKey: keyof Row,
  desc: boolean,
): number[] {
  const ranks: number[] = [];
  let curRank = 0;
  let curVal = null;
  if (!desc) {
    rows.reverse();
  }
  if (sortKey === "def") {
    rows.reverse();
  }
  for (let i = 0; i < rows.length; i++) {
    if (curVal === null || rows[i][sortKey] !== curVal) {
      curRank = i + 1;
      curVal = rows[i][sortKey];
    }
    ranks.push(curRank);
  }
  if (!desc) {
    ranks.reverse();
  }
  if (sortKey === "def") {
    ranks.reverse();
  }
  return ranks;
}
