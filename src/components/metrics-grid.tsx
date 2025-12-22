import {
  BarChart,
  Clock,
  Eye,
  Heart,
  MessageSquare,
  Bookmark,
  Share2,
  Users,
} from "lucide-react";
import type { Metric, MetricKey } from "@/lib/types";
import { MetricCard } from "./metric-card";

interface MetricsGridProps {
  metrics: Metric;
  onMetricUpdate: (key: MetricKey, value: number) => void;
}

const metricConfig: {
  key: MetricKey;
  label: string;
  icon: React.ElementType;
  editable: boolean;
}[] = [
  { key: "views", label: "Views", icon: Eye, editable: true },
  { key: "likes", label: "Likes", icon: Heart, editable: true },
  { key: "comments", label: "Comments", icon: MessageSquare, editable: true },
  { key: "saves", label: "Saves", icon: Bookmark, editable: true },
  { key: "shares", label: "Shares", icon: Share2, editable: true },
  { key: "reach", label: "Reach", icon: Users, editable: true },
  { key: "impressions", label: "Impressions", icon: BarChart, editable: true },
  { key: "avg_watch_time", label: "Avg. Watch Time (s)", icon: Clock, editable: true },
];

export function MetricsGrid({ metrics, onMetricUpdate }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {metricConfig.map((config) => (
        <MetricCard
          key={config.key}
          label={config.label}
          value={metrics[config.key]}
          icon={config.icon}
          isEditable={config.editable}
          onSave={(newValue) => onMetricUpdate(config.key, newValue)}
        />
      ))}
    </div>
  );
}
