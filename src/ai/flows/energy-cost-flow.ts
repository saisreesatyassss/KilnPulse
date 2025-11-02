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


const energyCostFlow = async (input: EnergyCostInput): Promise<EnergyCostOutput> => {
    // Return static data for demo purposes
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    return {
        insight: "The cost of Petcoke has surged by over 20% this week, becoming the primary driver of the total energy cost increase.",
        recommendation: "Consider increasing the proportion of Biomass in the fuel mix by up to 5% to offset the rising Petcoke prices, if operational constraints on ash content and calorific value allow."
    };
}
