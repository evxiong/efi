import { MongoClient } from "mongodb";
import { NextRequest } from "next/server";

export const revalidate = 3600;

export async function GET(request: NextRequest) {
  // Get table for given competition, season, and matchweek
  const searchParams = request.nextUrl.searchParams;
  const competition = parseInt(searchParams.get("competition")!);
  const season = parseInt(searchParams.get("season")!);
  const matchweek = parseInt(searchParams.get("matchweek")!);

  if (isNaN(competition) || isNaN(season) || isNaN(matchweek)) {
    return new Response(
      "Error: competition, season, and matchweek must be specified in /api/table",
      {
        status: 400,
      },
    );
  }

  const client = new MongoClient(process.env.MONGODB_URI as string);
  try {
    const db = client.db("efi");
    const tables = db.collection("tables");
    const table = await tables.findOne(
      {
        competition_id: competition,
        season: season,
        matchweek: matchweek,
      },
      {
        projection: {
          _id: 0,
          season: 1,
          matchweek: 1,
          completed_matches: 1,
          total_matches: 1,
          rows: 1,
        },
      },
    );
    if (table) {
      for (const row of table.rows) {
        row.prob_positions = (row.prob_positions as string[]).map((p) =>
          parseFloat(p),
        );
        row.prob_champion = row.prob_positions[0];
        row.prob_top_4 = +(
          row.prob_positions[0] +
          row.prob_positions[1] +
          row.prob_positions[2] +
          row.prob_positions[3]
        ).toFixed(4);
        row.prob_rel = +(
          row.prob_positions[17] +
          row.prob_positions[18] +
          row.prob_positions[19]
        ).toFixed(4);
      }
    }
    return Response.json(table);
  } catch (e) {
    console.error(e);
    throw e;
  } finally {
    await client.close();
  }
}
