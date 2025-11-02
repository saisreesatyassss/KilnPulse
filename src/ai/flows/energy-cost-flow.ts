'use server';

/**
 * @fileOverview An AI agent for providing insights on energy cost data.
 *
 * - getEnergyCostInsight - A function that returns an insight on energy cost data.
 * - EnergyCostInput - The input type for the getEnergyCostInsight function.
 * - EnergyCostOutput - The return type for the getEnergyCostInsight function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const EnergyCostInputSchema = z.object({
  costData: z.string().describe('A JSON string representing the weekly energy cost data.'),
});
export type EnergyCostInput = z.infer<typeof EnergyCostInputSchema>;

const EnergyCostOutputSchema = z.object({
  insight: z.string().describe('An AI-generated insight based on the energy cost data.'),
  recommendation: z.string().describe('A specific recommendation to optimize energy costs.'),
});
export type EnergyCostOutput = z.infer<typeof EnergyCostOutputSchema>;

export async function getEnergyCostInsight(input: EnergyCostInput): Promise<EnergyCostOutput> {
  return energyCostFlow(input);
}

const prompt = ai.definePrompt({
  name: 'energyCostPrompt',
  input: { schema: EnergyCostInputSchema },
  output: { schema: EnergyCostOutputSchema },
  prompt: `You are an energy cost analyst AI for a cement plant. Based on the following weekly cost data (JSON format), provide a key insight and a specific, actionable recommendation.

Weekly Cost Data:
{{{costData}}}

Example Insight: "The cost of Petcoke has increased by 15% this week, contributing significantly to the overall energy cost rise."
Example Recommendation: "Consider increasing the proportion of Biomass in the fuel mix by 5% to offset the rising Petcoke prices, if operational constraints allow."

Generate a plausible insight and recommendation.`,
});

const energyCostFlow = ai.defineFlow(
  {
    name: 'energyCostFlow',
    inputSchema: EnergyCostInputSchema,
    outputSchema: EnergyCostOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
