
"use client"

import * as React from "react"
import { Label, Pie, PieChart } from "recharts"

import {
  CardContent,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  men: {
    label: "Men",
    color: "hsl(var(--chart-1))",
  },
  women: {
    label: "Women",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

interface GenderChartProps {
  data: {
    men: number;
    women: number;
  };
}

export function GenderChart({ data }: GenderChartProps) {
  const chartData = [
    { gender: 'men', value: data.men, fill: 'var(--color-men)' },
    { gender: 'women', value: data.women, fill: 'var(--color-women)' },
  ];

  return (
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel formatter={(value) => `${value}%`} />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="gender"
              innerRadius={60}
              strokeWidth={5}
            >
               <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <>
                        <text x={(viewBox.cx || 0) - 70} y={(viewBox.cy || 0)} textAnchor="middle" dominantBaseline="middle">
                           <tspan className="fill-foreground font-bold text-lg">{data.men}%</tspan>
                           <tspan x={(viewBox.cx || 0) - 70} y={(viewBox.cy || 0) + 20} className="fill-muted-foreground text-sm">Men</tspan>
                           <tspan x={(viewBox.cx || 0) - 70} y={(viewBox.cy || 0) + 35} className="fill-chart-1 text-2xl">•</tspan>
                        </text>

                         <text x={(viewBox.cx || 0) + 70} y={(viewBox.cy || 0)} textAnchor="middle" dominantBaseline="middle">
                           <tspan className="fill-foreground font-bold text-lg">{data.women}%</tspan>
                           <tspan x={(viewBox.cx || 0) + 70} y={(viewBox.cy || 0) + 20} className="fill-muted-foreground text-sm">Women</tspan>
                           <tspan x={(viewBox.cx || 0) + 70} y={(viewBox.cy || 0) + 35} className="fill-chart-2 text-2xl">•</tspan>
                        </text>

                      </>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
  )
}
