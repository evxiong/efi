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
import { Row } from "../data/tableData";

export default function TableTabParent({
  data,
}: {
  data: Map<number, Map<number, Row[]>>;
}) {
  const matchweeks = [...Array(39)].map((_, i) =>
    i == 0 ? "Preseason" : "Matchweek " + i.toFixed(),
  );
  const seasons = [...data.keys()];
  const seasonOptions = seasons.map((d) => `${d}/${(d + 1) % 100}`);
  const [matchweek, setMatchweek] = useState(
    data.get(seasons.at(-1)!)!.size - 1,
  );
  const [season, setSeason] = useState(seasons[seasons.length - 1]);
  const [showDetails, setShowDetails] = useState<boolean | "indeterminate">(
    false,
  );
  const [rows, setRows] = useState(data.get(season)?.get(matchweek));
  const [selectedSortKey, setSelectedSortKey] = useState<keyof Row>("efi");
  const [sortDesc, setSortDesc] = useState(true);

  const dateString = data.get(season)?.get(matchweek)?.at(0)?.update_date;

  useEffect(() => {
    setRows(data.get(season)?.get(matchweek));
  }, [matchweek, season]);

  useEffect(() => {
    setRows(
      data.get(season)?.get(matchweek)
        ? [...data.get(season)!.get(matchweek)!].sort((a, b) =>
            sortDesc
              ? (b[selectedSortKey] as number) - (a[selectedSortKey] as number)
              : (a[selectedSortKey] as number) - (b[selectedSortKey] as number),
          )
        : undefined,
    );
  }, [selectedSortKey, sortDesc, matchweek, season]);

  function setSortState(sortKey: keyof Row, sortDesc: boolean) {
    if (sortKey !== selectedSortKey) {
      setSelectedSortKey(sortKey);
    }
    setSortDesc(sortDesc);
  }

  return (
    <div className="mb-40 flex flex-col gap-4">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex flex-row gap-2.5">
            <Select
              value={matchweek.toFixed()}
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
              value={season.toFixed()}
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
            {dateString && (
              <>
                <p className="font-semibold">
                  Rankings as of{" "}
                  {new Date(dateString)
                    .toLocaleDateString([], {
                      timeZone: "UTC",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                    .replace(" ", ". ")
                    .replace("May. ", "May ")}
                </p>
                <p className="text-xs">
                  {matchweek === 0
                    ? "Preseason rankings"
                    : `Includes — of 10 matches played in Matchweek ${matchweek}.`}
                </p>
              </>
            )}
          </div>
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
        </div>
      </div>
      <RankingsTable
        rows={rows}
        showDetails={showDetails === true}
        selectedSortKey={selectedSortKey}
        sortDesc={sortDesc}
        setSortState={setSortState}
      />
    </div>
  );
}
