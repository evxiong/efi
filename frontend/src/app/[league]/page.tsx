import TableTab from "../components/tableTab";
import { LEAGUES } from "../lib/constants";

export async function generateStaticParams() {
  const leagues = LEAGUES.map((l) => l.slug);
  return leagues.map((league) => ({ league: league }));
}

export default async function League({
  params,
}: {
  params: Promise<{ league: string }>;
}) {
  const leagueSlug = (await params).league;
  return <TableTab />;
}
