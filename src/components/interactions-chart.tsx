"use client"

import * as React from "react"
import { Pie, PieChart, Cell, Label } from "recharts"
import { formatNumber } from "@/lib/utils"

import {
  ChartConfig,
  ChartContainer,
} from "@/components/ui/chart"

const chartConfig = {
  Interactions: {
    label: "Interactions",
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

interface InteractionsChartProps {
  data: { followers: number; nonFollowers: number };
  totalInteractions: number;
  fullNumberFormat?: boolean;
}

export function InteractionsChart({ data, totalInteractions, fullNumberFormat = false }: InteractionsChartProps) {
  const chartData = [
    { name: 'followers', value: data.followers, color: 'hsl(var(--chart-1))' },
    { name: 'non-followers', value: data.nonFollowers, color: 'hsl(var(--chart-2))' },
  ];

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square h-[250px]"
    >
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          innerRadius={90}
          outerRadius={120}
          startAngle={90}
          endAngle={450}
          strokeWidth={2}
          stroke="hsl(var(--background))"
        >
          {chartData.map((entry, index) => (
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
                      Interactions
                    </text>
                    <text
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 20}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-foreground text-4xl font-bold"
                    >
                      {fullNumberFormat ? totalInteractions.toLocaleString('en-US') : formatNumber(totalInteractions)}
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
