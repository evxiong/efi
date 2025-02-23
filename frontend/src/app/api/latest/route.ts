import { MongoClient } from "mongodb";
import { NextRequest } from "next/server";

export const revalidate = 3600;

export async function GET(request: NextRequest) {
  // Get the matchweek and season of the latest table and scores for the given
  // competition, as well as a list of all seasons.
  const searchParams = request.nextUrl.searchParams;
  const competition = parseInt(searchParams.get("competition")!);

  if (isNaN(competition)) {
    return new Response("Error: competition must be specified in /api/latest", {
      status: 400,
    });
  }

  const client = new MongoClient(process.env.MONGODB_URI as string);
  try {
    const db = client.db("efi");
    const latest = db.collection("latest");
    const result = await latest.findOne(
      { competition_id: competition },
      { projection: { _id: 0, seasons: 1, scores: 1, table: 1, trends: 1 } },
    );
    return Response.json({ latest: result });
  } catch (e) {
    console.error(e);
    throw e;
  } finally {
    await client.close();
  }
}
