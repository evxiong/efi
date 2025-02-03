"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IconBrandGithub, IconFlask } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  return (
    <div className="flex w-full flex-col">
      <section className="mb-6 flex w-full flex-col border-b bg-gray-100 py-4">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 md:flex-row md:items-center md:px-6">
          <div className="flex flex-1 flex-row items-center justify-between">
            <div className="font-doppio flex select-none flex-row items-center gap-2 text-xl leading-6">
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
              <div>PLFI</div>
            </div>
            <div className="flex flex-row items-center gap-4 md:hidden">
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
          <div className="hidden flex-1 text-base leading-5 text-gray-500 md:inline-block">
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
          </div>
        </div>
      </section>
      <section className="mx-auto flex w-full max-w-7xl flex-col px-4 sm:px-6">
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
