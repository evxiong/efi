"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  IconArrowNarrowRightDashed,
  IconBrandGithub,
  IconChevronLeft,
  IconFlask,
  IconTrendingDown,
  IconTrendingUp,
  IconWorld,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  return (
    <div className="flex w-full flex-col">
      <section className="flex w-full flex-col bg-gray-800 py-4 text-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 md:flex-row md:items-center md:px-6">
          <div className="flex flex-1 flex-row items-center justify-between">
            <div className="flex select-none flex-row items-center gap-2 font-doppio text-xl leading-6">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="24" height="24" className="fill-teal-500" />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M7 16C11.9706 16 16 11.9706 16 7H18C18 13.0751 13.0751 18 7 18V16Z"
                  className="fill-white"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M9 8C8.44772 8 8 8.44772 8 9V24H6V9C6 7.34315 7.34315 6 9 6H24V8H9Z"
                  className="fill-white"
                />
              </svg>
              <div>EFI</div>
            </div>
            <div className="flex flex-row items-center gap-4">
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://github.com/evxiong/plfi"
                className="group"
              >
                <IconFlask className="stroke-gray-500 group-hover:stroke-teal-500" />
              </a>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://github.com/evxiong/plfi"
                className="group"
              >
                <IconBrandGithub className="stroke-gray-500 group-hover:stroke-teal-500" />
              </a>
            </div>
          </div>
          {/* <div className="hidden flex-1 text-base leading-5 text-gray-500 md:inline-block">
            A simple, fairly accurate prediction model for the Premier League,
            based on FiveThirtyEight&rsquo;s SPI model&nbsp;&nbsp;
            <span className="hidden md:inline-block">
              ·&nbsp;&nbsp;
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://github.com/evxiong/plfi"
                className="underline decoration-teal-500 underline-offset-2 hover:opacity-75"
              >
                Methodology
              </a>
              &nbsp;&nbsp;·&nbsp;&nbsp;
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://github.com/evxiong/plfi"
                className="underline decoration-teal-500 underline-offset-2 hover:opacity-75"
              >
                GitHub
              </a>
            </span>
          </div> */}
        </div>
      </section>
      <section className="flex w-full flex-col gap-3 border-b bg-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-center gap-4 px-4 md:flex-row md:items-center md:px-6">
          <div className="flex flex-row items-center gap-6 text-xs font-medium leading-3 text-gray-500 sm:gap-6">
            <div className="-mb-[1px] box-border flex h-10 flex-shrink-0 flex-row items-center gap-2 border-b border-teal-500 px-1 py-2 font-semibold text-gray-900">
              <img
                src="https://www.premierleague.com/resources/rebrand/v7.153.44/i/elements/pl-main-logo.png"
                className="h-6 w-6 object-scale-down"
              />
              <span className="hidden sm:flex">Premier League</span>
            </div>
            <div className="flex flex-shrink-0 flex-row items-center gap-2 rounded-sm px-2 py-2">
              <img
                src="https://images.fotmob.com/image_resources/logo/leaguelogo/87.png"
                className="h-6 w-6 object-scale-down"
              />
              <span className="hidden sm:flex">LaLiga</span>
            </div>
            <div className="flex flex-shrink-0 flex-row items-center gap-2 rounded-sm px-2 py-2">
              <img
                src="https://images.fotmob.com/image_resources/logo/leaguelogo/55.png"
                className="h-6 w-6 object-scale-down"
              />
              <span className="hidden sm:flex">Serie A</span>
            </div>
            <div className="flex flex-shrink-0 flex-row items-center gap-2 rounded-sm px-2 py-2">
              <img
                src="https://images.fotmob.com/image_resources/logo/leaguelogo/54.png"
                className="h-6 w-6 object-scale-down"
              />
              <span className="hidden sm:flex">Bundesliga</span>
            </div>
            <div className="flex flex-shrink-0 flex-row items-center gap-2 rounded-sm px-2 py-2">
              <img
                src="https://images.fotmob.com/image_resources/logo/leaguelogo/53.png"
                className="h-6 w-6 object-scale-down"
              />
              <span className="hidden sm:flex">Ligue 1</span>
            </div>
          </div>
        </div>
      </section>
      <section className="flex w-full flex-col gap-3 border-b bg-white">
        <div className="mx-auto flex h-full w-full max-w-7xl flex-col justify-center px-0 md:px-6">
          {/* <div className="-my-1 flex w-6 flex-shrink-0 items-center justify-center rounded-l-sm bg-white drop-shadow-sm">
              <IconChevronLeft className="size-5 stroke-gray-500" />
            </div> */}
          <Carousel
            className="flex h-full w-full flex-row items-center"
            opts={{ align: "start", slidesToScroll: "auto", skipSnaps: true }}
          >
            <CarouselPrevious variant="ghost" />
            <CarouselContent className="flex w-full flex-row *:border-r [&>div:last-child]:border-none">
              <CarouselItem>
                <div className="flex h-full w-16 flex-shrink-0 select-none flex-col items-center justify-center rounded-sm bg-gray-50 text-xxs">
                  <div className="rounded-sm border border-gray-200 bg-white px-1.5 py-1">
                    Feb. 12
                  </div>
                </div>
              </CarouselItem>
              <CarouselItem>
                <Scoreboard />
              </CarouselItem>
              <CarouselItem>
                <div className="flex h-full w-16 flex-shrink-0 select-none flex-col items-center justify-center rounded-sm bg-gray-50 text-xxs">
                  <div className="rounded-sm border border-gray-200 bg-white px-1.5 py-1">
                    Feb. 13
                  </div>
                </div>
              </CarouselItem>
              <CarouselItem>
                <Scoreboard />
              </CarouselItem>
              <CarouselItem>
                <Scoreboard />
              </CarouselItem>
              <CarouselItem>
                <Scoreboard />
              </CarouselItem>
              <CarouselItem>
                <Scoreboard />
              </CarouselItem>
              <CarouselItem>
                <div className="flex h-full w-16 flex-shrink-0 select-none flex-col items-center justify-center rounded-sm bg-gray-50 text-xxs">
                  <div className="rounded-sm border border-gray-200 bg-white px-1.5 py-1">
                    Feb. 13
                  </div>
                </div>
              </CarouselItem>
              {[...Array(30)].map((_, i) => (
                <CarouselItem key={i}>
                  <Scoreboard ind={i} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselNext variant="ghost" />
          </Carousel>
        </div>
      </section>
      <section className="relative flex w-full flex-col gap-3 border-b bg-gray-50 py-6 md:py-12">
        {/* <div className="absolute top-0 h-0.5 w-full bg-[#085fff]"></div> */}
        <div className="mx-auto flex w-full max-w-7xl flex-col justify-center px-4 md:px-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="mt-36 md:mt-0">
              <div className="mb-1.5 text-4xl font-light leading-9 md:text-3xl md:leading-8">
                Premier League
              </div>
              <div className="text-gray-500">ENGLAND</div>
            </div>
            {/* <hr className="border-gray-300 md:hidden" /> */}
            <div className="hidden flex-row items-center gap-4 md:flex">
              {/* <div className="flex min-w-36 flex-col gap-1.5 rounded-sm border bg-white/75 p-2 backdrop-blur-sm">
                <div className="flex flex-row items-center gap-1.5 border-b pb-1.5 text-xs font-medium text-gray-500">
                  <IconTrendingUp className="size-4" />
                  Last 2 weeks
                </div>
                <div className="flex flex-row items-center justify-between gap-0.5 border-b pb-1.5">
                  <div className="text-lg font-medium leading-5 text-emerald-500">
                    +9.1
                  </div>
                  <IconArrowNarrowRightDashed className="size-5 stroke-gray-500" />
                  <div className="text-lg leading-5 text-gray-500">59.5</div>
                </div>
                <div className="flex flex-row items-center gap-1.5">
                  <div className="relative h-5 w-5">
                    <Image
                      alt="Man City logo"
                      src="https://resources.premierleague.com/premierleague/badges/50/t43.png"
                      fill={true}
                      sizes="50px"
                      draggable={false}
                      className="flex-shrink-0 select-none object-contain"
                    />
                  </div>
                  <span className="text-sm font-medium leading-4 text-gray-700">
                    Man City
                  </span>
                </div>
              </div> */}
              <div>
                <div className="mb-1.5 flex flex-row items-center gap-1.5 text-xs font-medium text-gray-500">
                  <IconTrendingUp className="size-4" />
                  On the rise
                </div>
                <div className="flex min-w-36 flex-col gap-2 border bg-white p-2 backdrop-blur-sm">
                  <div className="flex flex-row items-center justify-between gap-0.5 border-b pb-2">
                    <div className="text-xl font-medium leading-5 tracking-tight text-emerald-500">
                      +9.1
                    </div>
                    <IconArrowNarrowRightDashed className="size-5 stroke-gray-400" />
                    <div className="text-xl leading-5 tracking-tight text-gray-500">
                      59.5
                    </div>
                  </div>
                  <div className="flex flex-row items-center gap-1.5">
                    <div className="relative h-5 w-5">
                      <Image
                        alt="Man City logo"
                        src="https://resources.premierleague.com/premierleague/badges/50/t43.png"
                        fill={true}
                        sizes="50px"
                        draggable={false}
                        className="flex-shrink-0 select-none object-contain"
                      />
                    </div>
                    <span className="text-sm font-medium leading-4 text-gray-700">
                      Man City
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex flex-row items-center gap-1.5 text-xs font-medium text-gray-500">
                  <IconTrendingDown className="size-4" />
                  Dropping off
                </div>
                <div className="flex min-w-36 flex-col gap-2 border bg-white p-2 backdrop-blur-sm">
                  <div className="flex flex-row items-center justify-between gap-0.5 border-b pb-2">
                    <div className="text-xl font-medium leading-5 tracking-tight text-rose-500">
                      -9.1
                    </div>
                    <IconArrowNarrowRightDashed className="size-5 stroke-gray-400" />
                    <div className="text-xl leading-5 tracking-tight text-gray-500">
                      59.5
                    </div>
                  </div>
                  <div className="flex flex-row items-center gap-1.5">
                    <div className="relative h-5 w-5">
                      <Image
                        alt="Man City logo"
                        src="https://resources.premierleague.com/premierleague/badges/50/t43.png"
                        fill={true}
                        sizes="50px"
                        draggable={false}
                        className="flex-shrink-0 select-none object-contain"
                      />
                    </div>
                    <span className="text-sm font-medium leading-4 text-gray-700">
                      Man City
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto mt-6 flex w-full max-w-7xl flex-col px-4 sm:px-6">
        <Tabs
          defaultValue={pathname === "/" ? "table" : "scores"}
          className="w-full"
        >
          <TabsList className="mb-4 w-fit">
            <TabsTrigger value="table" className="px-6" asChild>
              <Link href="/">Table</Link>
            </TabsTrigger>
            <TabsTrigger value="scores" className="px-6" asChild>
              <Link href="/scores">Scores</Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </section>
    </div>
  );
}

function Scoreboard({ ind = 0 }: { ind?: number }) {
  return (
    <div className="mx-0.5 flex h-full w-32 select-none flex-col gap-1.5 bg-white px-1.5 py-1.5 text-[13px]">
      <div className="flex flex-row justify-between gap-1 text-xxs text-gray-700">
        <div>12:00pm</div>
        <div>Peacock</div>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex flex-row justify-between gap-1 font-medium text-gray-900">
          <div className="flex flex-row items-center gap-1.5">
            <div className="relative h-4 w-4">
              <Image
                alt="Man City logo"
                src="https://resources.premierleague.com/premierleague/badges/50/t17.png"
                fill={true}
                sizes="50px"
                draggable={false}
                className="flex-shrink-0 select-none object-contain"
              />
            </div>
            <span className="leading-4">NFO {ind}</span>
          </div>
          <div className="text-xs">44%</div>
        </div>
        <div className="flex flex-row justify-between gap-1 font-medium text-gray-900">
          <div className="flex flex-row items-center gap-1.5">
            <div className="relative h-4 w-4">
              <Image
                alt="Man City logo"
                src="https://resources.premierleague.com/premierleague/badges/50/t36.png"
                fill={true}
                sizes="50px"
                draggable={false}
                className="flex-shrink-0 select-none object-contain"
              />
            </div>
            <span className="leading-4">BHA</span>
          </div>
          <div className="text-xs text-gray-500">15%</div>
        </div>
      </div>
    </div>
  );
}
