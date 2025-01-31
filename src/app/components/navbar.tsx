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
            <div>
              <div className="text-xl font-medium italic leading-6">PLFI</div>
              <div className="text-sm leading-4 text-gray-500">v1.0</div>
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
          <div className="flex-1 text-base leading-5 text-gray-500">
            A simple, fairly accurate power rankings model for the Premier
            League, based on FiveThirtyEight&rsquo;s SPI model&nbsp;&nbsp;
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
