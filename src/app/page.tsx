import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TableTab from "./components/table";
import ScoresTab from "./components/scores";

export default function Home() {
  return (
    <div className="flex w-full flex-col pt-10">
      <section className="mx-auto flex w-full max-w-7xl px-6">
        <Tabs defaultValue="scores" className="w-full">
          <TabsList className="mb-10 w-fit">
            <TabsTrigger value="scores" className="px-6">
              Scores
            </TabsTrigger>
            <TabsTrigger value="table" className="px-6">
              Table
            </TabsTrigger>
          </TabsList>
          <TabsContent value="scores" className="w-full">
            <ScoresTab />
          </TabsContent>
          <TabsContent value="table" className="w-full">
            <TableTab />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
