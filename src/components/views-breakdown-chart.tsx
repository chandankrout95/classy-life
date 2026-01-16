
"use client"

import * as React from "react"
import { Pie, PieChart, Cell, Label } from "recharts"
import { formatNumber } from "@/lib/utils"

import {
  ChartConfig,
  ChartContainer,
} from "@/components/ui/chart"

const chartConfig = {
  views: {
    label: "Views",
  },
  followers: {
    label: "Followers",
    color: "hsl(var(--chart-1))",
  },
  "non-followers": {
    label: "Non-followers",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

interface ViewsBreakdownChartProps {
    data: { name: string; value: number; color: string }[];
    totalViews: number;
    fullNumberFormat?: boolean;
}

export function ViewsBreakdownChart({ data, totalViews, fullNumberFormat = false }: ViewsBreakdownChartProps) {

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square h-[250px]"
    >
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={109}
          outerRadius={120}
          startAngle={90}
          endAngle={450}
          strokeWidth={2}
          stroke="hsl(var(--background))"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
           <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <g>
                    <text
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) - 10}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-muted-foreground text-sm"
                    >
                      Views
                    </text>
                    <text
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 20}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-foreground text-4xl font-bold"
                    >
                      {fullNumberFormat ? totalViews.toLocaleString('en-US') : formatNumber(totalViews)}
                    </text>
                  </g>
                )
              }
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}
