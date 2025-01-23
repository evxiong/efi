"use client";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { numberToOrdinal } from "../lib/utils";

export default function PositionChart({ probs }: { probs: number[] }) {
  const chartData = probs.map((p, i) => ({ position: i + 1, prob: p * 100 }));
  const chartConfig = {
    prob: {
      label: "Probability",
      color: "#14b8a6",
    },
  } satisfies ChartConfig;
  return (
    <ChartContainer config={chartConfig} className="min-h-20 w-full font-sans">
      <BarChart data={chartData} barCategoryGap={1}>
        <CartesianGrid vertical={false} className="stroke-gray-300" />
        <YAxis
          dataKey="prob"
          tickLine={false}
          tickMargin={2}
          axisLine={false}
          width={20}
          className="text-[10px] font-semibold"
          interval={0}
          tick={{ fill: "#6b7280" }}
        />
        <XAxis
          label={{
            value: "Position",
            position: "insideBottom",
            offset: 0,
            fontSize: 11,
            fontWeight: 600,
          }}
          dataKey="position"
          tickLine={false}
          tickCount={20}
          tickMargin={1}
          axisLine={false}
          fontSize={10}
          fontWeight={600}
        />
        <ChartTooltip
          cursor={{ fill: "#e5e7eb", fillOpacity: 0.75 }}
          content={
            <ChartTooltipContent
              className="w-fit text-gray-900"
              formatter={(value, name, item, index) => {
                const v = value as number;
                return `${numberToOrdinal(item.payload.position)}: ${v > 0 ? v.toFixed(2) + "%" : "—"}`;
              }}
              hideIndicator
              hideLabel
            />
          }
        />
        <Bar dataKey="prob" radius={2} className="fill-teal-500" />
      </BarChart>
    </ChartContainer>
  );
}
