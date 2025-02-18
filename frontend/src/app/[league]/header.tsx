import { Competition } from "../lib/types";
import Trends from "./trends";

export default function Header({ competition }: { competition: Competition }) {
  return (
    <section className="relative flex w-full flex-col gap-3 border-b bg-gray-50 py-6 md:py-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col justify-center px-4 md:px-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="mt-36 md:mt-0">
            <div className="mb-1.5 text-4xl font-light leading-9 md:text-3xl md:leading-8">
              {competition.name}
            </div>
            <div className="uppercase text-gray-500">{competition.country}</div>
          </div>
          <Trends competition={competition} />
        </div>
      </div>
    </section>
  );
}
