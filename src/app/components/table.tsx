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
  IconEqual,
} from "@tabler/icons-react";
import { Row } from "../data/tableData";
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

export default function TableTab({
  rows,
  showDetails,
}: {
  rows: Row[] | undefined;
  showDetails: boolean;
}) {
  return (
    <>
      {rows && (
        <TooltipProvider delayDuration={0} skipDelayDuration={0}>
          <Table>
            <TableHeader>
              <TableRow className="text-xs text-gray-500 hover:bg-transparent">
                <TableHead className="w-20 min-w-20">RK</TableHead>
                <TableHead className="min-w-44">CLUB</TableHead>
                <TableHead className="w-16 min-w-16 text-center text-gray-900">
                  <Tooltip>
                    <TooltipTrigger>PLFI</TooltipTrigger>
                    <TooltipContent>
                      <StatExplainer
                        abbrev="PLFI"
                        full="Premier League Football Index"
                        desc="Expected percent of possible points this team would
                        gain against an average Premier League opponent on a
                        neutral pitch."
                        note="Higher is better"
                      />
                    </TooltipContent>
                  </Tooltip>
                </TableHead>
                <TableHead className="w-12 min-w-12 text-center text-gray-900">
                  <Tooltip>
                    <TooltipTrigger>OFF</TooltipTrigger>
                    <TooltipContent>
                      <StatExplainer
                        abbrev="OFF"
                        full="Offensive Rating"
                        desc="Expected goals this team would score against an average
                      Premier League opponent on a neutral pitch."
                        note="Higher is better"
                      />
                    </TooltipContent>
                  </Tooltip>
                </TableHead>
                <TableHead className="w-12 min-w-12 text-center text-gray-900">
                  <Tooltip>
                    <TooltipTrigger>DEF</TooltipTrigger>
                    <TooltipContent>
                      <StatExplainer
                        abbrev="DEF"
                        full="Defensive Rating"
                        desc="Expected goals this team would concede to an average
                      Premier League opponent on a neutral pitch."
                        note="Lower is better"
                      />
                    </TooltipContent>
                  </Tooltip>
                </TableHead>
                <TableHead className="text-center text-gray-900">
                  <Tooltip>
                    <TooltipTrigger>WIN</TooltipTrigger>
                    <TooltipContent>
                      <StatExplainer
                        abbrev="WIN"
                        full="Probability of winning title"
                        desc="After running 10,000 simulations"
                      />
                    </TooltipContent>
                  </Tooltip>
                </TableHead>
                <TableHead className="text-center text-gray-900">
                  <Tooltip>
                    <TooltipTrigger>T4</TooltipTrigger>
                    <TooltipContent>
                      <StatExplainer
                        abbrev="T4"
                        full="Probability of finishing top 4"
                        desc="After running 10,000 simulations"
                      />
                    </TooltipContent>
                  </Tooltip>
                </TableHead>
                <TableHead className="text-center text-gray-900">
                  <Tooltip>
                    <TooltipTrigger>REL</TooltipTrigger>
                    <TooltipContent>
                      <StatExplainer
                        abbrev="REL"
                        full="Probability of relegation"
                        desc="After running 10,000 simulations"
                      />
                    </TooltipContent>
                  </Tooltip>
                </TableHead>
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
                <TableHead className="text-center text-gray-900">
                  <Tooltip>
                    <TooltipTrigger>APTS</TooltipTrigger>
                    <TooltipContent>
                      <StatExplainer
                        abbrev="APTS"
                        full="Average end-of-season points"
                        desc="After running 10,000 simulations"
                      />
                    </TooltipContent>
                  </Tooltip>
                </TableHead>
                <TableHead className="text-center text-gray-900">
                  <Tooltip>
                    <TooltipTrigger>AGD</TooltipTrigger>
                    <TooltipContent>
                      <StatExplainer
                        abbrev="AGD"
                        full="Average end-of-season goal difference"
                        desc="After running 10,000 simulations"
                      />
                    </TooltipContent>
                  </Tooltip>
                </TableHead>
                <TableHead className="w-10 min-w-10 text-center">
                  <Tooltip>
                    <TooltipTrigger>MP</TooltipTrigger>
                    <TooltipContent>Matches Played</TooltipContent>
                  </Tooltip>
                </TableHead>
                {showDetails && (
                  <>
                    <TableHead className="w-10 min-w-10 text-center">
                      <Tooltip>
                        <TooltipTrigger>W</TooltipTrigger>
                        <TooltipContent>Wins</TooltipContent>
                      </Tooltip>
                    </TableHead>
                    <TableHead className="w-10 min-w-10 text-center">
                      <Tooltip>
                        <TooltipTrigger>D</TooltipTrigger>
                        <TooltipContent>Draws</TooltipContent>
                      </Tooltip>
                    </TableHead>
                    <TableHead className="w-10 min-w-10 text-center">
                      <Tooltip>
                        <TooltipTrigger>L</TooltipTrigger>
                        <TooltipContent>Losses</TooltipContent>
                      </Tooltip>
                    </TableHead>
                    <TableHead className="w-10 min-w-10 text-center">
                      <Tooltip>
                        <TooltipTrigger>GF</TooltipTrigger>
                        <TooltipContent>Goals For</TooltipContent>
                      </Tooltip>
                    </TableHead>
                    <TableHead className="w-10 min-w-10 text-center">
                      <Tooltip>
                        <TooltipTrigger>GA</TooltipTrigger>
                        <TooltipContent>Goals Against</TooltipContent>
                      </Tooltip>
                    </TableHead>
                    <TableHead className="w-10 min-w-10 text-center">
                      <Tooltip>
                        <TooltipTrigger>GD</TooltipTrigger>
                        <TooltipContent>Goal Difference</TooltipContent>
                      </Tooltip>
                    </TableHead>
                  </>
                )}
                <TableHead className="w-10 min-w-10 text-center">
                  <Tooltip>
                    <TooltipTrigger>PTS</TooltipTrigger>
                    <TooltipContent>Points</TooltipContent>
                  </Tooltip>
                </TableHead>
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
              {rows.map((r, i) => (
                <Row key={i} row={r} showDetails={showDetails} />
              ))}
            </TableBody>
          </Table>
        </TooltipProvider>
      )}
    </>
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
  const prob_champion = row.prob_positions[0];
  const prob_top_4 =
    row.prob_positions[0] +
    row.prob_positions[1] +
    row.prob_positions[2] +
    row.prob_positions[3];
  const prob_rel =
    row.prob_positions[17] + row.prob_positions[18] + row.prob_positions[19];

  return (
    <TableRow>
      <TableCell className="w-20 min-w-20">
        <div className="flex flex-row items-center gap-1.5 text-sm font-medium">
          <span className="w-5">{row.rank}</span>
          <ChangeIndicator change={row.change} />
        </div>
      </TableCell>
      <TableCell className="min-w-44 max-w-96 font-semibold text-gray-900">
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
            className="flex-shrink-0 select-none"
          />
          <span>{row.name}</span>
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
      <TableCell className="w-12 min-w-12 text-center text-sm font-medium">
        {prob_champion >= 1 ? (
          <div className="flex h-full w-full items-center justify-center">
            <IconCheck className="size-5" />
          </div>
        ) : prob_champion > 0 ? (
          prob_champion < 0.01 ? (
            "<1%"
          ) : prob_champion > 0.99 ? (
            ">99%"
          ) : (
            (prob_champion * 100).toFixed() + "%"
          )
        ) : (
          "—"
        )}
      </TableCell>
      <TableCell className="w-12 min-w-12 text-center text-sm font-medium">
        {prob_top_4 >= 1 ? (
          <div className="flex h-full w-full items-center justify-center">
            <IconCheck className="size-5" />
          </div>
        ) : prob_top_4 > 0 ? (
          prob_top_4 < 0.01 ? (
            "<1%"
          ) : prob_top_4 > 0.99 ? (
            ">99%"
          ) : (
            (prob_top_4 * 100).toFixed() + "%"
          )
        ) : (
          "—"
        )}
      </TableCell>
      <TableCell className="w-12 min-w-12 text-center text-sm font-medium">
        {prob_rel >= 1 ? (
          <div className="flex h-full w-full items-center justify-center">
            <IconCheck className="size-5" />
          </div>
        ) : prob_rel > 0 ? (
          prob_rel < 0.01 ? (
            "<1%"
          ) : prob_rel > 0.99 ? (
            ">99%"
          ) : (
            (prob_rel * 100).toFixed() + "%"
          )
        ) : (
          "—"
        )}
      </TableCell>
      <TableCell className="w-20 min-w-20">
        <Positions
          name={row.name}
          pl_id={row.pl_id}
          probs={row.prob_positions}
        />
      </TableCell>
      <TableCell className="w-12 min-w-12 text-center text-sm font-medium">
        {row.avg_pts.toFixed()}
      </TableCell>
      <TableCell className="w-12 min-w-12 text-center text-sm font-medium">
        {(row.avg_gd > 0 ? "+" : "") + row.avg_gd.toFixed()}
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
            {(row.gd > 0 ? "+" : "") + row.gd.toFixed()}
          </TableCell>
        </>
      )}
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

function Positions({
  name,
  pl_id,
  probs,
}: {
  name: string;
  pl_id: string;
  probs: number[];
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="-m-1.5 flex cursor-pointer flex-row rounded-md p-1.5 hover:bg-white hover:drop-shadow">
          {probs.map((p, i) => (
            <Tooltip key={i}>
              <TooltipTrigger>
                <div className="group h-6 w-1 px-[1px]">
                  <div
                    style={{
                      backgroundColor: `rgba(17, 24, 39, ${4 * p + 0.1})`,
                    }}
                    className="h-full w-full rounded-sm group-hover:!bg-teal-500"
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
              src={
                "https://resources.premierleague.com/premierleague/badges/50/" +
                pl_id +
                ".png"
              }
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
      className={`${result === null ? "invisible" : "visible"} ${result === "W" ? "bg-emerald-500 outline-emerald-500" : result === "L" ? "bg-rose-500 outline-rose-500" : "bg-gray-500 outline-gray-500"} ${outline ? "underline outline" : ""} relative h-4 w-4 select-none rounded-full outline-1 outline-offset-1`}
    >
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[11px] font-medium leading-3 text-white">
        {result}
      </div>
    </div>
  );
}
