
"use client"

import * as React from "react"
import { Label, Pie, PieChart, Sector } from "recharts"
import { PieSectorDataItem } from "recharts/types/polar/Pie"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { formatNumber } from "@/lib/utils"

const chartConfig = {
  followers: {
    label: "Followers",
    color: "hsl(var(--chart-1))",
  },
  nonFollowers: {
    label: "Non-Followers",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

interface AudienceChartProps {
  data: {
    followers: number;
    nonFollowers: number;
  };
  totalViews: number;
}

export function AudienceChart({ data, totalViews }: AudienceChartProps) {
  const chartData = [
    { type: 'followers', value: data.followers, fill: 'var(--color-followers)' },
    { type: 'nonFollowers', value: data.nonFollowers, fill: 'var(--color-nonFollowers)' },
  ];
  const id = React.useId()

  return (
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="type"
              innerRadius={60}
              strokeWidth={5}
              activeIndex={0}
              activeShape={({
                outerRadius = 0,
                ...props
              }: PieSectorDataItem) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                  <Sector {...props} outerRadius={outerRadius + 20} cornerRadius={5} />
                </g>
              )}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <>
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {formatNumber(totalViews)}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            Views
                          </tspan>
                        </text>
                        
                        <text x={(viewBox.cx || 0) - 100} y={(viewBox.cy || 0)} textAnchor="middle" dominantBaseline="middle">
                           <tspan className="fill-foreground font-bold text-lg">{data.followers}%</tspan>
                           <tspan x={(viewBox.cx || 0) - 100} y={(viewBox.cy || 0) + 20} className="fill-muted-foreground text-sm">Followers</tspan>
                           <tspan x={(viewBox.cx || 0) - 100} y={(viewBox.cy || 0) + 35} className="fill-chart-1 text-2xl">•</tspan>
                        </text>

                         <text x={(viewBox.cx || 0) + 100} y={(viewBox.cy || 0)} textAnchor="middle" dominantBaseline="middle">
                           <tspan className="fill-foreground font-bold text-lg">{data.nonFollowers}%</tspan>
                           <tspan x={(viewBox.cx || 0) + 100} y={(viewBox.cy || 0) + 20} className="fill-muted-foreground text-sm">Non-followers</tspan>
                           <tspan x={(viewBox.cx || 0) + 100} y={(viewBox.cy || 0) + 35} className="fill-chart-2 text-2xl">•</tspan>
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
