
"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  percentage: {
    label: "Percentage",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

interface AgeChartProps {
  data: { range: string; percentage: number }[];
}

export function AgeChart({ data }: AgeChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <BarChart
        accessibilityLayer
        data={data}
        layout="vertical"
        margin={{ left: 10 }}
      >
        <CartesianGrid horizontal={false} />
        <YAxis
          dataKey="range"
          type="category"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          className="text-xs"
        />
        <XAxis dataKey="percentage" type="number" hide />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent 
            indicator="line" 
            formatter={(value) => `${value}%`}
             />}
        />
        <Bar dataKey="percentage" fill="var(--color-percentage)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
