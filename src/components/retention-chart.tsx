
"use client";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { RetentionData } from "@/lib/types";

const chartConfig = {
  retention: {
    label: "Retention",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

type LineType = "basis" | "basisClosed" | "basisOpen" | "linear" | "linearClosed" | "natural" | "monotoneX" | "monotoneY" | "monotone" | "step" | "stepBefore" | "stepAfter";

interface RetentionChartProps {
  data: RetentionData[];
  yAxisTicks?: number[];
  yAxisDomain?: [number, number];
  lineType?: LineType;
}

export function RetentionChart({ data, yAxisTicks, yAxisDomain, lineType = "monotone" }: RetentionChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-[200px] w-full">
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 20,
          left: 0,
          bottom: 5,
        }}
      >
        <CartesianGrid vertical={false} horizontal={true} stroke="hsl(var(--border))" />
        <XAxis
          dataKey="timestamp"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => `0:${value.toString().padStart(2, '0')}`}
          ticks={[0, 10, 20, 30, 40, 50].filter(t => t <= (data[data.length - 1]?.timestamp || 0) || t === 0)}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => `${value}%`}
          domain={yAxisDomain || [0, 'dataMax']}
          ticks={yAxisTicks || [0, 50, 100]}
        />
        <ChartTooltip
          cursor={true}
          content={<ChartTooltipContent 
            indicator="dot" 
            formatter={(value, name) => [`${value}%`, "Retention"]}
          />}
        />
        <Line
          dataKey="retention"
          type={lineType}
          stroke="hsl(var(--chart-1))"
          strokeWidth={3}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
