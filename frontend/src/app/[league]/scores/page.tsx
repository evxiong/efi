import ScoresTab from "@/app/components/scoresTab";
import { LEAGUES } from "@/app/lib/constants";

export default async function Scores({
  params,
}: {
  params: Promise<{ league: string }>;
}) {
  const leagueSlug = (await params).league;
  const competition = LEAGUES.find((c) => c.slug === leagueSlug)!;
  return <ScoresTab competition={competition} />;
}
