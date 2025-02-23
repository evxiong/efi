import { LEAGUES } from "../lib/constants";
import Header from "./header";
import Scoreboard from "./scoreboard";
import LeagueTabs from "./tabs";

export default async function LeagueLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ league: string }>;
}>) {
  const leagueSlug = (await params).league;
  const competition = LEAGUES.find((c) => c.slug === leagueSlug)!;
  return (
    <div className="flex w-full flex-col">
      <Scoreboard competition={competition} />
      <Header competition={competition} />
      <section className="mx-auto mt-6 flex w-full max-w-7xl flex-col px-4 sm:px-6">
        <LeagueTabs league={leagueSlug} />
      </section>
      {children}
    </div>
  );
}
