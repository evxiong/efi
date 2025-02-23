import { Score } from "@/app/lib/types";
import { MongoClient } from "mongodb";
import { NextRequest } from "next/server";

export const revalidate = 3600;

export async function GET(request: NextRequest) {
  // Get all matches between first match of given matchweek and following matchweek,
  // as well as any matches belonging to this matchweek.
  const searchParams = request.nextUrl.searchParams;
  const competition = parseInt(searchParams.get("competition")!);
  const season = parseInt(searchParams.get("season")!);
  const matchweek = parseInt(searchParams.get("matchweek")!);

  if (isNaN(competition) || isNaN(season) || isNaN(matchweek)) {
    return new Response(
      "Error: competition, season, and matchweek must be specified in /api/scores",
      {
        status: 400,
      },
    );
  }

  const data: Score[] = [];
  const client = new MongoClient(process.env.MONGODB_URI as string);
  try {
    const db = client.db("efi");
    const scores = db.collection("scores");
    const cursor = scores.find(
      {
        $or: [
          { competition_id: competition, season: season, matchweek: matchweek },
          {
            competition_id: competition,
            season: season,
            "scores.display_with_matchweek": matchweek,
          },
        ],
      },
      { sort: { "scores.time": 1 } },
    );
    for await (const doc of cursor) {
      data.push(doc.scores);
    }
    return Response.json({ scores: data });
  } catch (e) {
    console.error(e);
    throw e;
  } finally {
    await client.close();
  }
}
