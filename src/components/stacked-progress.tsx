
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface StackedProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value1: number;
  value2: number;
  total: number;
}

const StackedProgress = React.forwardRef<
  HTMLDivElement,
  StackedProgressProps
>(({ className, value1, value2, total, ...props }, ref) => {
  const percentage1 = (value1 / total) * 100;
  const percentage2 = (value2 / total) * 100;

  return (
    <div
      ref={ref}
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-secondary", className)}
      {...props}
    >
      <div
        className="h-full bg-chart-1"
        style={{ width: `${percentage1}%` }}
      />
      <div
        className="absolute top-0 h-full bg-chart-2"
        style={{ left: `${percentage1}%`, width: `${percentage2}%` }}
      />
    </div>
  )
})
StackedProgress.displayName = "StackedProgress"

export { StackedProgress }
