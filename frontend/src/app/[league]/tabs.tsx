"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function LeagueTabs({ league }: { league: string }) {
  const pathname = usePathname();
  return (
    <Tabs
      defaultValue={pathname === `/${league}` ? "table" : "scores"}
      className="w-full"
    >
      <TabsList className="mb-4 w-fit">
        <TabsTrigger value="table" className="px-6" asChild>
          <Link href={`/${league}`}>Table</Link>
        </TabsTrigger>
        <TabsTrigger value="scores" className="px-6" asChild>
          <Link href={`/${league}/scores`}>Scores</Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
