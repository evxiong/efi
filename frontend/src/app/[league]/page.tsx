import type { Metadata } from "next";
import TableTab from "../components/tableTab";
import { LEAGUES } from "../lib/constants";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const leagues = LEAGUES.map((l) => l.slug);
  return leagues.map((league) => ({ league: league }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ league: string }>;
}): Promise<Metadata> {
  const leagueSlug = (await params).league;
  const competition = LEAGUES.find((c) => c.slug === leagueSlug);

  if (competition === undefined) {
    notFound();
  }

  return {
    title: `${competition.name} Predictions`,
    description: `${competition.name} match predictions, power rankings, and season projections.`,
  };
}

export default async function League({
  params,
}: {
  params: Promise<{ league: string }>;
}) {
  const leagueSlug = (await params).league;
  const competition = LEAGUES.find((c) => c.slug === leagueSlug);

  if (competition === undefined) {
    notFound();
  }

  return <TableTab competition={competition} />;
}
