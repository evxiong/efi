import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ScoresTab from "./components/scores";
import TableTabParent from "./components/tableParent";
import { MongoClient } from "mongodb";
import { Row } from "./data/tableData";

async function fetchTables() {
  const data: Map<number, Map<number, Row[]>> = new Map();
  const client = new MongoClient(process.env.MONGODB_URI as string);
  try {
    const db = client.db("efi");
    const tables = db.collection("tables");
    const cursor = tables.find().sort({ season: 1, matchweek: 1 });

    for await (const doc of cursor) {
      for (const row of doc.rows) {
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
      data.set(
        doc.season,
        (data.get(doc.season) || new Map()).set(doc.matchweek, doc.rows),
      );
    }
    return data;
  } catch (e) {
    console.error(e);
    throw e;
  } finally {
    await client.close();
  }
}

export default async function Home() {
  const data = await fetchTables();
  return (
    <div className="flex w-full flex-col pt-10">
      <section className="mx-auto flex w-full max-w-7xl px-6">
        <Tabs defaultValue="table" className="w-full">
          <TabsList className="mb-4 w-fit">
            <TabsTrigger value="table" className="px-6">
              Table
            </TabsTrigger>
            <TabsTrigger value="scores" className="px-6">
              Scores
            </TabsTrigger>
          </TabsList>
          <TabsContent value="table" className="w-full">
            <TableTabParent data={data} />
          </TabsContent>
          <TabsContent value="scores" className="w-full">
            <ScoresTab />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
