import { MongoClient } from "mongodb";

export const revalidate = 3600;

export async function GET() {
  // Get the matchweek and season of the latest table and scores,
  // as well as a list of all seasons.
  const client = new MongoClient(process.env.MONGODB_URI as string);
  try {
    const db = client.db("efi");
    const latest = db.collection("latest");
    const result = await latest.findOne(
      {},
      { projection: { _id: 0, seasons: 1, scores: 1, table: 1 } },
    );
    return Response.json({ latest: result });
  } catch (e) {
    console.error(e);
    throw e;
  } finally {
    await client.close();
  }
}
