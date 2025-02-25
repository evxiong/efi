"use client";

import { IconBrandGithub, IconFlask } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LEAGUES } from "../lib/constants";

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
                href="https://github.com/evxiong/efi/wiki/Methodology"
                className="group"
              >
                <IconFlask className="stroke-gray-500 group-hover:stroke-teal-500" />
              </a>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://github.com/evxiong/efi"
                className="group"
              >
                <IconBrandGithub className="stroke-gray-500 group-hover:stroke-teal-500" />
              </a>
            </div>
          </div>
        </div>
      </section>
      <section className="flex w-full flex-col gap-3 border-b bg-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-center gap-4 px-4 md:flex-row md:items-center md:px-6">
          <div className="flex flex-row items-center gap-4 text-xs font-medium leading-3 text-gray-500 min-[360px]:gap-6 sm:gap-6">
            {LEAGUES.map((league, i) => (
              <Link
                key={i}
                href={"/" + league.slug}
                className={`${pathname.endsWith("/" + league.slug) ? "-mb-[1px] border-b border-teal-500 font-semibold text-gray-900" : "hover:-mb-[1px] hover:border-b hover:border-gray-400 hover:text-gray-700"} box-border flex h-full flex-shrink-0 flex-row items-center gap-2 p-2`}
              >
                <div className="relative h-6 w-6">
                  <Image
                    alt={`${league.name} logo`}
                    src={`/icons/leagues/${league.id}.png`}
                    fill={true}
                    sizes="50px"
                    draggable={false}
                    className="flex-shrink-0 select-none object-contain"
                  />
                </div>
                <span className="hidden sm:flex">{league.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
