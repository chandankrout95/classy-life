"use client";

import React, { useState, useTransition } from "react";
import type { DateRange } from "react-day-picker";
import type { VideoInsight, Metric, MetricKey } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { addDays, format } from "date-fns";
import { DashboardHeader } from "@/components/dashboard-header";
import { DateRangePicker } from "@/components/date-range-picker";
import { MetricsGrid } from "@/components/metrics-grid";
import { ViewsChart } from "@/components/views-chart";
import { CountriesChart } from "@/components/countries-chart";
import { applyDemoDataAction, duplicateInsightAction } from "@/app/actions";
import { exportToCSV } from "@/lib/utils";

export function InsightDashboard({
  initialData,
}: {
  initialData: VideoInsight;
}) {
  const [isPending, startTransition] = useTransition();
  const [insight, setInsight] = useState<VideoInsight>(initialData);
  const { toast } = useToast();
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -29),
    to: new Date(),
  });

  const handleMetricUpdate = (key: MetricKey, value: number) => {
    setInsight((prev) => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        [key]: value,
      },
      lastEdited: new Date().toISOString(),
    }));
  };

  const handleApplyDemoData = () => {
    startTransition(async () => {
      try {
        const updatedInsight = await applyDemoDataAction(insight);
        setInsight(updatedInsight);
        toast({
          title: "Success",
          description: "New demo data has been applied.",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not apply demo data.",
        });
      }
    });
  };
  
  const handleDuplicateInsight = () => {
    startTransition(async () => {
      try {
        const newInsights = await duplicateInsightAction(insight);
        // For this example, we'll just toast a success message.
        // In a real app, you might navigate or add to a list.
        toast({
          title: "Insight Duplicated",
          description: `Created a new variation: "${newInsights[0].title}"`,
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not duplicate the insight.",
        });
      }
    });
  };

  const handleExport = () => {
    exportToCSV(insight);
     toast({
      title: "Export Started",
      description: "Your CSV download will begin shortly.",
    });
  }

  const filteredTimeseries = insight.timeseries.filter((item) => {
    const itemDate = new Date(item.date);
    if (!date?.from || !date?.to) return true;
    return itemDate >= date.from && itemDate <= date.to;
  });

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <DashboardHeader 
        insight={insight}
        onApplyDemoData={handleApplyDemoData}
        onDuplicate={handleDuplicateInsight}
        onExport={handleExport}
        isProcessing={isPending}
      />
      <div className="mt-8">
        <DateRangePicker date={date} setDate={setDate} />
      </div>
      <div className="mt-6">
        <MetricsGrid
          metrics={insight.metrics}
          onMetricUpdate={handleMetricUpdate}
        />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ViewsChart data={filteredTimeseries} />
        </div>
        <div className="lg:col-span-2">
          <CountriesChart data={insight.countryBreakdown} />
        </div>
      </div>
    </div>
  );
}
