
"use client";

import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import {
  MoreVertical,
  Upload,
  Copy,
  Wand2,
  Loader2,
} from "lucide-react";

import type { VideoInsight } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InsightForgeLogo } from "./icons";

interface DashboardHeaderProps {
  insight: VideoInsight;
  onDuplicate: () => void;
  onExport: () => void;
  onApplyDemoData: () => void;
  isProcessing: boolean;
}

export function DashboardHeader({
  insight,
  onDuplicate,
  onExport,
  onApplyDemoData,
  isProcessing,
}: DashboardHeaderProps) {
  return (
    <header>
       <div className="flex items-center gap-2 mb-6 text-2xl font-semibold text-foreground">
        <InsightForgeLogo className="w-8 h-8 text-primary" />
        <h1>InsightForge</h1>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          {insight.thumbnailUrl && (
            <Image
              src={insight.thumbnailUrl}
              alt={insight.title}
              width={160}
              height={90}
              className="rounded-lg border hidden sm:block"
            />
          )}
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{insight.title}</h2>
            <p className="text-sm text-muted-foreground">
              Last updated{" "}
              {formatDistanceToNow(new Date(insight.lastEdited), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>
        <div className="flex w-full sm:w-auto items-center gap-2">
          {isProcessing && <Loader2 className="h-5 w-5 animate-spin" />}
          <div className="hidden md:flex gap-2">
            <Button variant="outline" onClick={onApplyDemoData} disabled={isProcessing}>
              <Wand2 className="mr-2 h-4 w-4" /> Apply Demo Data
            </Button>
            <Button variant="outline" onClick={onDuplicate} disabled={isProcessing}>
              <Copy className="mr-2 h-4 w-4" /> Duplicate
            </Button>
            <Button onClick={onExport} disabled={isProcessing}>
              <Upload className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </div>
          <div className="flex-1 md:hidden">
            <Button onClick={onExport} className="w-full" disabled={isProcessing}>
                <Upload className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <MoreVertical className="h-5 w-5" />
                <span className="sr-only">More actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onApplyDemoData} disabled={isProcessing}>
                <Wand2 className="mr-2 h-4 w-4" />
                Apply Demo Data
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate} disabled={isProcessing}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate Insight
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
