
'use server';
/**
 * @fileOverview A flow that applies AI-generated demo data to a video insight.
 *
 * - applyDemoDataWithGenAI - A function that applies demo data to a video insight.
 * - ApplyDemoDataInput - The input type for the applyDemoDataWithGenAI function.
 * - ApplyDemoDataOutput - The return type for the applyDemoDataWithGenAI function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ApplyDemoDataInputSchema = z.object({
  title: z.string().describe('The title of the video.'),
  initialViews: z.number().describe('The initial number of views for the video.'),
});
export type ApplyDemoDataInput = z.infer<typeof ApplyDemoDataInputSchema>;

const ApplyDemoDataOutputSchema = z.object({
  views: z.number().describe('The AI-generated number of views for the video.'),
  likes: z.number().describe('The AI-generated number of likes for the video.'),
  comments: z.number().describe('The AI-generated number of comments for the video.'),
  shares: z.number().describe('The AI-generated number of shares for the video.'),
  saves: z.number().describe('The AI-generated number of saves for the video.'),
  watchTime: z.string().describe('The total watch time, e.g., "2h 45m".'),
  avgWatchTime: z.number().describe('The average watch time in seconds.'),
  interactions: z.number().describe('The total number of interactions.'),
  profileActivity: z.number().describe('The number of profile visits from this post.'),
  follows: z.number().describe('The number of new follows from this post.'),
  accountsReached: z.number().describe('The total number of unique accounts reached.'),
  viewRate: z.number().describe('The percentage of viewers who watched past the first 3 seconds.'),
  skipRate: z.number().describe('The percentage of viewers who skipped the reel.'),
  reposts: z.number().describe('The number of reposts or re-shares.'),
  audienceBreakdown: z.object({
    followers: z.number(),
    nonFollowers: z.number(),
  }),
  interactionsBreakdown: z.object({
    followers: z.number(),
    nonFollowers: z.number(),
  }),
  genderBreakdown: z.object({
    men: z.number(),
    women: z.number(),
  }),
  ageBreakdown: z.array(z.object({
    range: z.string(),
    percentage: z.number(),
  })),
  countryBreakdown: z.array(z.object({
    name: z.string(),
    percentage: z.number(),
  })),
  viewSources: z.array(z.object({
    source: z.string(),
    percentage: z.number(),
  })),
});

export type ApplyDemoDataOutput = z.infer<typeof ApplyDemoDataOutputSchema>;

export async function applyDemoDataWithGenAI(input: ApplyDemoDataInput): Promise<ApplyDemoDataOutput> {
  return applyDemoDataFlow(input);
}

const applyDemoDataPrompt = ai.definePrompt({
  name: 'applyDemoDataPrompt',
  input: {schema: ApplyDemoDataInputSchema},
  output: {schema: ApplyDemoDataOutputSchema},
  prompt: `You are a video analytics expert. Given the title of a video and its initial views, generate a complete and realistic set of demo data for a social media reel.

Video Title: {{{title}}}
Initial Views: {{{initialViews}}}

Generate values for all fields in the output schema.
- Base the metrics on the initial views. Likes should be around 5-8% of views, and comments around 0.2-1%. Other metrics should be proportional.
- Interactions is the sum of likes, comments, shares, saves, and reposts.
- Create a realistic breakdown for audience, interactions, gender, age, country, and view sources. The percentages in each breakdown should sum to 100.
- For country breakdown, provide 5 countries. For age, provide 3-4 standard ranges. For view sources, provide 5 common sources.
- Return the complete data as a single JSON object. Make sure all numbers are realistic for a popular reel.
`,
});

const applyDemoDataFlow = ai.defineFlow(
  {
    name: 'applyDemoDataFlow',
    inputSchema: ApplyDemoDataInputSchema,
    outputSchema: ApplyDemoDataOutputSchema,
  },
  async input => {
    const {output} = await applyDemoDataPrompt(input);
    return output!;
  }
);
