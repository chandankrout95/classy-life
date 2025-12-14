
"use server";

import { applyDemoDataWithGenAI } from "@/ai/flows/apply-demo-data-gen-ai";
import { duplicateInsightWithGenAI } from "@/ai/flows/duplicate-insight-gen-ai";
import type { Post, VideoInsight } from "@/lib/types";

export async function applyDemoDataAction(
  insight: VideoInsight
): Promise<Partial<Post>> {
  try {
    const aiResult = await applyDemoDataWithGenAI({
      title: insight.title,
      initialViews: insight.metrics.views,
    });

    const updatedPostData: Partial<Post> = {
      views: aiResult.views,
      likes: aiResult.likes,
      comments: aiResult.comments,
      shares: aiResult.shares,
      saves: aiResult.saves,
      watchTime: aiResult.watchTime,
      avgWatchTime: aiResult.avgWatchTime,
      interactions: aiResult.interactions,
      profileActivity: aiResult.profileActivity,
      follows: aiResult.follows,
      accountsReached: aiResult.accountsReached,
      viewRate: aiResult.viewRate,
      skipRate: aiResult.skipRate,
      reposts: aiResult.reposts,
      audienceBreakdown: aiResult.audienceBreakdown,
      interactionsBreakdown: aiResult.interactionsBreakdown,
      genderBreakdown: aiResult.genderBreakdown,
      ageBreakdown: aiResult.ageBreakdown,
      countryBreakdown: aiResult.countryBreakdown,
      viewSources: aiResult.viewSources,
    };
    return updatedPostData;
  } catch (error) {
    console.error("Error applying demo data:", error);
    throw new Error("Failed to apply demo data.");
  }
}

export async function duplicateInsightAction(
  insight: VideoInsight
): Promise<VideoInsight[]> {
  try {
    const aiResult = await duplicateInsightWithGenAI({
      originalInsight: insight,
      numberOfVariations: 1, // simplified for this use case to return one
    });
    return aiResult as VideoInsight[];
  } catch (error) {
    console.error("Error duplicating insight:", error);
    throw new Error("Failed to duplicate insight.");
  }
}
