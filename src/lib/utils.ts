import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { VideoInsight } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function formatNumber(num: number): string {
  if (num === null || typeof num === 'undefined') {
    return '0';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function exportToCSV(data: VideoInsight) {
  const { title, metrics, timeseries, countryBreakdown } = data;

  let csvContent = "data:text/csv;charset=utf-8,";

  // Title
  csvContent += `Video Title,"${title}"\n\n`;

  // Metrics
  csvContent += "Metric,Value\n";
  for (const key in metrics) {
    csvContent += `${key},${metrics[key as keyof typeof metrics]}\n`;
  }
  csvContent += "\n";

  // Timeseries data
  csvContent += "Date,Views\n";
  timeseries.forEach(row => {
    csvContent += `${row.date},${row.views}\n`;
  });
  csvContent += "\n";

  // Country breakdown
  csvContent += "Country,Views\n";
  countryBreakdown.forEach(row => {
    csvContent += `${row.country},${row.views}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  link.setAttribute("download", `insightforge_${safeTitle}_export.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

    