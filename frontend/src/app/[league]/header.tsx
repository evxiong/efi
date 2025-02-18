import {
  IconArrowNarrowRightDashed,
  IconTrendingDown,
  IconTrendingUp,
} from "@tabler/icons-react";
import Image from "next/image";

export default function Header() {
  return (
    <section className="relative flex w-full flex-col gap-3 border-b bg-gray-50 py-6 md:py-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col justify-center px-4 md:px-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="mt-36 md:mt-0">
            <div className="mb-1.5 text-4xl font-light leading-9 md:text-3xl md:leading-8">
              Premier League
            </div>
            <div className="text-gray-500">ENGLAND</div>
          </div>
          <div className="hidden flex-row items-center gap-4 md:flex">
            <Stat
              up={true}
              change={9.1}
              current={59.5}
              iconLink="https://resources.premierleague.com/premierleague/badges/50/t11.png"
              club="Everton"
            />
            <Stat
              up={false}
              change={-5.5}
              current={59.5}
              iconLink="https://resources.premierleague.com/premierleague/badges/50/t43.png"
              club="Man City"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({
  up,
  change,
  current,
  iconLink,
  club,
}: {
  up: boolean;
  change: number;
  current: number;
  iconLink: string;
  club: string;
}) {
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
            {change > 0 ? `+${change.toFixed(1)}` : change.toFixed(1)}
          </div>
          <IconArrowNarrowRightDashed className="size-5 stroke-gray-400" />
          <div className="text-xl leading-5 tracking-tight text-gray-500">
            {current.toFixed(1)}
          </div>
        </div>
        <div className="flex flex-row items-center gap-1.5">
          <div className="relative h-5 w-5">
            <Image
              alt={`${club} logo`}
              src={iconLink}
              fill={true}
              sizes="50px"
              draggable={false}
              className="flex-shrink-0 select-none object-contain"
            />
          </div>
          <span className="text-sm font-medium leading-4 text-gray-700">
            {club}
          </span>
        </div>
      </div>
    </div>
  );
}
