'use server';

/**
 * @fileOverview Duplicates a video insight and uses AI to generate variations for A/B testing or presentations.
 *
 * - duplicateInsightWithGenAI - A function that duplicates a video insight and generates variations.
 * - DuplicateInsightWithGenAIInput - The input type for the duplicateInsightWithGenAI function.
 * - DuplicateInsightWithGenAIOutput - The return type for the duplicateInsightWithGenAI function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DuplicateInsightWithGenAIInputSchema = z.object({
  originalInsight: z.object({
    videoId: z.string(),
    title: z.string(),
    thumbnailUrl: z.string(),
    metrics: z.object({
      views: z.number(),
      likes: z.number(),
      comments: z.number(),
      saves: z.number(),
      shares: z.number(),
      reach: z.number(),
      impressions: z.number(),
      avg_watch_time: z.number(),
    }),
    timeseries: z.array(z.object({date: z.string(), views: z.number()})),
    countryBreakdown: z.array(z.object({country: z.string(), views: z.number()})),
    lastEdited: z.string(),
    isDemo: z.boolean(),
  }).describe('The original video insight data to duplicate and generate variations from.'),
  numberOfVariations: z.number().default(3).describe('The number of variations to generate.'),
});

export type DuplicateInsightWithGenAIInput = z.infer<
  typeof DuplicateInsightWithGenAIInputSchema
>;

const DuplicateInsightWithGenAIOutputSchema = z.array(
  z.object({
    videoId: z.string(),
    title: z.string(),
    thumbnailUrl: z.string(),
    metrics: z.object({
      views: z.number(),
      likes: z.number(),
      comments: z.number(),
      saves: z.number(),
      shares: z.number(),
      reach: z.number(),
      impressions: z.number(),
      avg_watch_time: z.number(),
    }),
    timeseries: z.array(z.object({date: z.string(), views: z.number()})),
    countryBreakdown: z.array(z.object({country: z.string(), views: z.number()})),
    lastEdited: z.string(),
    isDemo: z.boolean(),
  })
);

export type DuplicateInsightWithGenAIOutput = z.infer<
  typeof DuplicateInsightWithGenAIOutputSchema
>;

export async function duplicateInsightWithGenAI(
  input: DuplicateInsightWithGenAIInput
): Promise<DuplicateInsightWithGenAIOutput> {
  return duplicateInsightWithGenAIFlow(input);
}

const duplicateInsightWithGenAIPrompt = ai.definePrompt({
  name: 'duplicateInsightWithGenAIPrompt',
  input: {schema: DuplicateInsightWithGenAIInputSchema},
  output: {schema: DuplicateInsightWithGenAIOutputSchema},
  prompt: `You are an expert in video analytics and content creation.
Given an original video insight, your task is to generate {{numberOfVariations}} variations of it.
These variations should have slightly altered metrics, titles, and potentially different country breakdowns, while maintaining a realistic and coherent data set.
The purpose is to create multiple scenarios for A/B testing or presentations.

Original Insight:
{{json originalInsight}}

Output: A JSON array containing {{numberOfVariations}} new video insight objects.
Each insight object should have the same structure as the original but with modified values. For example:
- Titles can be rephrased or slightly altered.
- Metrics (views, likes, etc.) should be adjusted, but keep them proportional to each other (e.g., higher views should generally correlate with higher likes).
- Time series data should reflect the overall trend, but with some random fluctuations.
- Country breakdowns can be adjusted to reflect different potential audience distributions.
- The videoId should be unique for each variation.
- isDemo should be true.
Consider different types of insight variations based on the prompt.`,
});

const duplicateInsightWithGenAIFlow = ai.defineFlow(
  {
    name: 'duplicateInsightWithGenAIFlow',
    inputSchema: DuplicateInsightWithGenAIInputSchema,
    outputSchema: DuplicateInsightWithGenAIOutputSchema,
  },
  async input => {
    const {output} = await duplicateInsightWithGenAIPrompt(input);
    return output!;
  }
);
