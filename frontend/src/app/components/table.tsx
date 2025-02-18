import Image from "next/image";
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
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconEqual,
} from "@tabler/icons-react";
import type { Row } from "../lib/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import PositionChart from "./positionChart";
import { numberToOrdinal } from "../lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function RankingsTable({
  rows,
  showDetails,
  loading,
  selectedSortKey,
  sortDesc,
  setSortState,
}: {
  rows: Row[];
  showDetails: boolean;
  loading: boolean;
  selectedSortKey: keyof Row;
  sortDesc: boolean;
  setSortState: (a: keyof Row, b: boolean) => void;
}) {
  return (
    <>
      {(loading || rows.length > 0) && (
        <TooltipProvider delayDuration={0} skipDelayDuration={0}>
          <Table>
            <TableHeader>
              <TableRow className="text-xs text-gray-500 hover:bg-transparent">
                <TableHead className="w-20 min-w-20">RK</TableHead>
                <TableHead className="sticky left-0 z-10 min-w-44 bg-white">
                  CLUB
                </TableHead>
                <THSortableLargeTooltip
                  width="lg"
                  name="PLFI"
                  full="Premier League Football Index"
                  sortKey="efi"
                  desc="Expected percent of possible points this team would
                        take against an average Premier League opponent on a
                        neutral pitch."
                  note="Higher is better"
                  sortDesc={sortDesc}
                  selectedSortKey={selectedSortKey}
                  setSortState={setSortState}
                />
                <THSortableLargeTooltip
                  width="sm"
                  name="OFF"
                  full="Offensive Rating"
                  sortKey="off"
                  desc="Expected goals this team would score against an average
                        Premier League opponent on a neutral pitch."
                  note="Higher is better"
                  sortDesc={sortDesc}
                  selectedSortKey={selectedSortKey}
                  setSortState={setSortState}
                />
                <THSortableLargeTooltip
                  width="sm"
                  name="DEF"
                  full="Defensive Rating"
                  sortKey="def"
                  desc="Expected goals this team would concede to an average
                        Premier League opponent on a neutral pitch."
                  note="Lower is better"
                  sortDesc={sortDesc}
                  selectedSortKey={selectedSortKey}
                  setSortState={setSortState}
                />
                <THSortableLargeTooltip
                  width="md"
                  name="WIN"
                  full="Probability of winning title"
                  sortKey="prob_champion"
                  desc="After running 10,000 simulations"
                  sortDesc={sortDesc}
                  selectedSortKey={selectedSortKey}
                  setSortState={setSortState}
                />
                <THSortableLargeTooltip
                  width="md"
                  name="T4"
                  full="Probability of finishing top 4"
                  sortKey="prob_top_4"
                  desc="After running 10,000 simulations"
                  sortDesc={sortDesc}
                  selectedSortKey={selectedSortKey}
                  setSortState={setSortState}
                />
                <THSortableLargeTooltip
                  width="md"
                  name="REL"
                  full="Probability of relegation"
                  sortKey="prob_rel"
                  desc="After running 10,000 simulations"
                  sortDesc={sortDesc}
                  selectedSortKey={selectedSortKey}
                  setSortState={setSortState}
                />
                <TableHead className="relative text-center text-gray-900 before:absolute before:left-2 before:top-1/2 before:-translate-y-1/2 before:text-[10px] before:font-normal before:text-gray-500 before:content-['1'] after:absolute after:right-2 after:top-1/2 after:-translate-y-1/2 after:text-[10px] after:font-normal after:text-gray-500 after:content-['20']">
                  <Tooltip>
                    <TooltipTrigger>POS</TooltipTrigger>
                    <TooltipContent>
                      <StatExplainer
                        abbrev="POS"
                        full="Projected end-of-season positions"
                        desc="After running 10,000 simulations"
                      />
                    </TooltipContent>
                  </Tooltip>
                </TableHead>
                <THSortableLargeTooltip
                  width="sm"
                  name="APTS"
                  full="Average end-of-season points"
                  sortKey="avg_pts"
                  desc="After running 10,000 simulations"
                  sortDesc={sortDesc}
                  selectedSortKey={selectedSortKey}
                  setSortState={setSortState}
                />
                <THSortableLargeTooltip
                  width="sm"
                  name="AGD"
                  full="Average end-of-season goal difference"
                  sortKey="avg_gd"
                  desc="After running 10,000 simulations"
                  sortDesc={sortDesc}
                  selectedSortKey={selectedSortKey}
                  setSortState={setSortState}
                />
                <THSortableSmallTooltip
                  name="MP"
                  full="Matches Played"
                  sortKey="mp"
                  sortDesc={sortDesc}
                  selectedSortKey={selectedSortKey}
                  setSortState={setSortState}
                />
                {showDetails && (
                  <>
                    <THSortableSmallTooltip
                      name="W"
                      full="Wins"
                      sortKey="w"
                      sortDesc={sortDesc}
                      selectedSortKey={selectedSortKey}
                      setSortState={setSortState}
                    />
                    <THSortableSmallTooltip
                      name="D"
                      full="Draws"
                      sortKey="d"
                      sortDesc={sortDesc}
                      selectedSortKey={selectedSortKey}
                      setSortState={setSortState}
                    />
                    <THSortableSmallTooltip
                      name="L"
                      full="Losses"
                      sortKey="l"
                      sortDesc={sortDesc}
                      selectedSortKey={selectedSortKey}
                      setSortState={setSortState}
                    />
                    <THSortableSmallTooltip
                      name="GF"
                      full="Goals For"
                      sortKey="gf"
                      sortDesc={sortDesc}
                      selectedSortKey={selectedSortKey}
                      setSortState={setSortState}
                    />
                    <THSortableSmallTooltip
                      name="GA"
                      full="Goals Against"
                      sortKey="ga"
                      sortDesc={sortDesc}
                      selectedSortKey={selectedSortKey}
                      setSortState={setSortState}
                    />
                    <THSortableSmallTooltip
                      name="GD"
                      full="Goal Difference"
                      sortKey="gd"
                      sortDesc={sortDesc}
                      selectedSortKey={selectedSortKey}
                      setSortState={setSortState}
                    />
                  </>
                )}
                <THSortableSmallTooltip
                  name="PTS"
                  full="Points"
                  sortKey="pts"
                  sortDesc={sortDesc}
                  selectedSortKey={selectedSortKey}
                  setSortState={setSortState}
                />
                <TableHead>
                  <Tooltip>
                    <TooltipTrigger>FORM</TooltipTrigger>
                    <TooltipContent align="start" alignOffset={-12}>
                      Last 5 match results
                    </TooltipContent>
                  </Tooltip>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="border-b text-base text-gray-500">
              {loading
                ? [...Array(20)].map((_, i) => (
                    <SkeletonRow key={i} showDetails={showDetails} />
                  ))
                : rows.map((r, i) => (
                    <Row key={i} row={r} showDetails={showDetails} />
                  ))}
            </TableBody>
          </Table>
        </TooltipProvider>
      )}
    </>
  );
}

function THSortableLargeTooltip({
  width,
  name,
  full,
  sortKey,
  desc = "",
  note = "",
  selectedSortKey,
  sortDesc,
  setSortState,
}: {
  width: "lg" | "md" | "sm";
  name: string;
  full: string;
  sortKey: keyof Row;
  desc?: string;
  note?: string;
  selectedSortKey: keyof Row;
  sortDesc: boolean;
  setSortState: (a: keyof Row, b: boolean) => void;
}) {
  return (
    <TableHead
      className={`${width === "lg" ? "w-16 min-w-16" : width === "md" ? "w-14 min-w-14" : width === "sm" ? "w-12 min-w-12" : ""} text-gray-900`}
    >
      <div className="relative flex w-full flex-row items-center justify-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className={`${sortKey === selectedSortKey ? "absolute" : ""} -mx-1.5 flex h-fit flex-row items-center gap-0.5 px-1.5 py-1 text-xs`}
              onClick={() => {
                if (sortKey === selectedSortKey) {
                  setSortState(sortKey, !sortDesc);
                } else {
                  setSortState(sortKey, true);
                }
              }}
            >
              <span>{name}</span>
              {sortKey === selectedSortKey &&
                (sortDesc ? (
                  <IconChevronDown className="!size-3.5 stroke-teal-500" />
                ) : (
                  <IconChevronUp className="!size-3.5 stroke-teal-500" />
                ))}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <StatExplainer abbrev={name} full={full} desc={desc} note={note} />
          </TooltipContent>
        </Tooltip>
      </div>
    </TableHead>
  );
}

function THSortableSmallTooltip({
  name,
  full,
  sortKey,
  selectedSortKey,
  sortDesc,
  setSortState,
}: {
  name: string;
  full: string;
  sortKey: keyof Row;
  selectedSortKey: keyof Row;
  sortDesc: boolean;
  setSortState: (a: keyof Row, b: boolean) => void;
}) {
  return (
    <TableHead className="w-10 min-w-10">
      <div className="relative flex w-full flex-row items-center justify-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className={`${sortKey === selectedSortKey ? "absolute" : ""} -mx-1.5 flex h-fit flex-row items-center gap-0.5 px-1.5 py-1 text-xs`}
              onClick={() => {
                if (sortKey === selectedSortKey) {
                  setSortState(sortKey, !sortDesc);
                } else {
                  setSortState(sortKey, true);
                }
              }}
            >
              <span>{name}</span>
              {sortKey === selectedSortKey &&
                (sortDesc ? (
                  <IconChevronDown className="!size-3.5 stroke-teal-500" />
                ) : (
                  <IconChevronUp className="!size-3.5 stroke-teal-500" />
                ))}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{full}</TooltipContent>
        </Tooltip>
      </div>
    </TableHead>
  );
}

function StatExplainer({
  abbrev,
  full,
  desc = "",
  note = "",
}: {
  abbrev: string;
  full: string;
  desc: string;
  note?: string;
}) {
  return (
    <div className="max-w-60 py-1">
      <div className="text-sm font-semibold">{abbrev}</div>
      <div className="mb-2 text-xs font-semibold leading-3">{full}</div>
      {desc && <div className="font-normal">{desc}</div>}
      {note && <div className="mt-2 italic">{note}</div>}
    </div>
  );
}

function Row({ row, showDetails }: { row: Row; showDetails: boolean }) {
  const formLatestIndex = row.form.filter((r) => r !== null).length - 1;

  return (
    <TableRow className="group/row">
      <TableCell className="w-20 min-w-20">
        <div className="flex flex-row items-center gap-1.5 text-sm font-medium">
          <span className="w-5">{row.rank}</span>
          <ChangeIndicator change={row.change} />
        </div>
      </TableCell>
      <TableCell className="sticky left-0 z-10 min-w-44 max-w-96 font-semibold text-gray-900">
        <div className="-mx-2 -my-2 bg-white px-2 py-2 transition-colors group-hover/row:bg-gray-50">
          <div className="flex flex-row items-center gap-2.5">
            <div className="relative h-6 w-6">
              <Image
                alt={row.name + " logo"}
                src={row.icon_link}
                fill={true}
                sizes="50px"
                draggable={false}
                className="flex-shrink-0 select-none object-contain"
              />
            </div>
            <span>{row.name}</span>
          </div>
        </div>
      </TableCell>
      <TableCell className="w-16 min-w-16 text-center text-base font-medium text-gray-900">
        {row.efi.toFixed(1)}
      </TableCell>
      <TableCell className="w-12 min-w-12 text-center text-sm font-medium text-gray-900">
        {row.off.toFixed(1)}
      </TableCell>
      <TableCell className="w-12 min-w-12 text-center text-sm font-medium text-gray-900">
        {row.def.toFixed(1)}
      </TableCell>
      <TableCell className="text-center text-sm font-medium">
        {row.prob_champion >= 1 ? (
          <div className="flex h-full w-full items-center justify-center">
            <IconCheck className="size-5 stroke-gray-900" />
          </div>
        ) : row.prob_champion > 0 ? (
          row.prob_champion < 0.01 ? (
            "<1%"
          ) : row.prob_champion > 0.99 ? (
            ">99%"
          ) : (
            (row.prob_champion * 100).toFixed() + "%"
          )
        ) : (
          "—"
        )}
      </TableCell>
      <TableCell className="text-center text-sm font-medium">
        {row.prob_top_4 >= 1 ? (
          <div className="flex h-full w-full items-center justify-center">
            <IconCheck className="size-5 stroke-gray-900" />
          </div>
        ) : row.prob_top_4 > 0 ? (
          row.prob_top_4 < 0.01 ? (
            "<1%"
          ) : row.prob_top_4 > 0.99 ? (
            ">99%"
          ) : (
            (row.prob_top_4 * 100).toFixed() + "%"
          )
        ) : (
          "—"
        )}
      </TableCell>
      <TableCell className="text-center text-sm font-medium">
        {row.prob_rel >= 1 ? (
          <div className="flex h-full w-full items-center justify-center">
            <IconCheck className="size-5 stroke-gray-900" />
          </div>
        ) : row.prob_rel > 0 ? (
          row.prob_rel < 0.01 ? (
            "<1%"
          ) : row.prob_rel > 0.99 ? (
            ">99%"
          ) : (
            (row.prob_rel * 100).toFixed() + "%"
          )
        ) : (
          "—"
        )}
      </TableCell>
      <TableCell className="w-20 min-w-20">
        <Positions
          name={row.name}
          icon_link={row.icon_link}
          probs={row.prob_positions}
        />
      </TableCell>
      <TableCell className="w-12 min-w-12 text-center text-sm font-medium">
        {row.avg_pts.toFixed()}
      </TableCell>
      <TableCell className="w-12 min-w-12 text-center text-sm font-medium">
        {(
          (row.avg_gd > 0 ? "+" : "") + row.avg_gd.toFixed().replace("-0", "0")
        ).replace("+0", "0")}
      </TableCell>
      <TableCell className="w-10 min-w-10 text-center text-sm font-medium">
        {row.mp}
      </TableCell>
      {showDetails && (
        <>
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
            {(
              (row.gd > 0 ? "+" : "") + row.gd.toFixed().replace("-0", "0")
            ).replace("+0", "0")}
          </TableCell>
        </>
      )}
      <TableCell className="w-10 min-w-10 text-center text-sm font-medium">
        {row.pts}
      </TableCell>
      <TableCell>
        <div className="flex w-fit min-w-24 flex-row items-center gap-1">
          {row.form.map((r, i) => (
            <Form key={i} result={r} outline={i === formLatestIndex} />
          ))}
        </div>
      </TableCell>
    </TableRow>
  );
}

function Positions({
  name,
  icon_link,
  probs,
}: {
  name: string;
  icon_link: string;
  probs: number[];
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="-m-1.5 flex cursor-pointer flex-row rounded-md p-1.5 hover:bg-white hover:drop-shadow">
          {probs.map((p, i) => (
            <Tooltip key={i}>
              <TooltipTrigger>
                <div className="group/bar h-6 w-1 px-[1px]">
                  <div
                    style={{
                      backgroundColor: `rgba(17, 24, 39, ${4 * p + 0.1})`,
                    }}
                    className="h-full w-full rounded-sm group-hover/bar:!bg-teal-500"
                  ></div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="border bg-white/80 text-gray-900 drop-shadow-sm backdrop-blur">
                <span className="font-semibold">{numberToOrdinal(i + 1)}</span>
                :&nbsp;
                {p > 0 ? (p * 100).toFixed(1) + "%" : "—"}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </PopoverTrigger>
      <PopoverContent>
        <div>
          <div className="mb-3 flex flex-row items-center gap-1 text-sm font-semibold text-gray-700">
            <Image
              alt={name + " logo"}
              src={icon_link}
              height={16}
              width={16}
              draggable={false}
              className="flex-shrink-0 select-none"
            />
            <span>{name}</span>
          </div>
          <PositionChart probs={probs} />
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ChangeIndicator({ change }: { change: number }) {
  return (
    <div
      className={`${change > 0 ? "text-emerald-500" : change < 0 ? "text-rose-500" : "text-gray-500"} flex select-none flex-row items-center text-xs font-semibold`}
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
      className={`${result === null ? "invisible" : "visible"} ${result === "W" ? "bg-emerald-500 outline-emerald-500" : result === "L" ? "bg-rose-500 outline-rose-500" : "bg-gray-500 outline-gray-500"} ${outline ? "outline" : ""} relative h-4 w-4 select-none rounded-full outline-1 outline-offset-1`}
    >
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[11px] font-medium leading-3 text-white">
        {result}
      </div>
    </div>
  );
}

function SkeletonRow({ showDetails }: { showDetails: boolean }) {
  return (
    <TableRow className="group/row">
      <TableCell className="w-20 min-w-20">
        <Skeleton className="h-6 w-full" />
      </TableCell>
      <TableCell className="sticky left-0 z-10 min-w-44 max-w-96 font-semibold text-gray-900">
        <div className="-mx-2 -my-2 bg-white px-2 py-2 transition-colors group-hover/row:bg-gray-50">
          <Skeleton className="h-6 w-full" />
        </div>
      </TableCell>
      <TableCell className="w-16 min-w-16 text-center text-base font-medium text-gray-900">
        <Skeleton className="h-6 w-full" />
      </TableCell>
      <TableCell className="w-12 min-w-12 text-center text-sm font-medium text-gray-900">
        <Skeleton className="h-6 w-full" />
      </TableCell>
      <TableCell className="w-12 min-w-12 text-center text-sm font-medium text-gray-900">
        <Skeleton className="h-6 w-full" />
      </TableCell>
      <TableCell className="text-center text-sm font-medium">
        <Skeleton className="h-6 w-full" />
      </TableCell>
      <TableCell className="text-center text-sm font-medium">
        <Skeleton className="h-6 w-full" />
      </TableCell>
      <TableCell className="text-center text-sm font-medium">
        <Skeleton className="h-6 w-full" />
      </TableCell>
      <TableCell className="w-20 min-w-20">
        <Skeleton className="h-6 w-20" />
      </TableCell>
      <TableCell className="w-12 min-w-12 text-center text-sm font-medium">
        <Skeleton className="h-6 w-full" />
      </TableCell>
      <TableCell className="w-12 min-w-12 text-center text-sm font-medium">
        <Skeleton className="h-6 w-full" />
      </TableCell>
      <TableCell className="w-10 min-w-10 text-center text-sm font-medium">
        <Skeleton className="h-6 w-full" />
      </TableCell>
      {showDetails && (
        <>
          <TableCell className="w-10 min-w-10 text-center text-sm font-medium">
            <Skeleton className="h-6 w-full" />
          </TableCell>
          <TableCell className="w-10 min-w-10 text-center text-sm font-medium">
            <Skeleton className="h-6 w-full" />
          </TableCell>
          <TableCell className="w-10 min-w-10 text-center text-sm font-medium">
            <Skeleton className="h-6 w-full" />
          </TableCell>
          <TableCell className="w-10 min-w-10 text-center text-sm font-medium">
            <Skeleton className="h-6 w-full" />
          </TableCell>
          <TableCell className="w-10 min-w-10 text-center text-sm font-medium">
            <Skeleton className="h-6 w-full" />
          </TableCell>
          <TableCell className="w-10 min-w-10 text-center text-sm font-medium">
            <Skeleton className="h-6 w-full" />
          </TableCell>
        </>
      )}
      <TableCell className="w-10 min-w-10 text-center text-sm font-medium">
        <Skeleton className="h-6 w-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-6 w-24" />
      </TableCell>
    </TableRow>
  );
}
