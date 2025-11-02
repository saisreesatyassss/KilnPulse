'use server';

/**
 * @fileOverview An AI agent for summarizing safety compliance status.
 *
 * - getSafetySummary - A function that returns a safety compliance summary.
 * - SafetySummaryInput - The input type for the getSafetySummary function.
 * - SafetySummaryOutput - The return type for the getSafetySummary function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SafetySummaryInputSchema = z.object({
  timeframe: z.enum(['daily', 'weekly', 'monthly']).describe('The time frame for the safety summary.'),
});
export type SafetySummaryInput = z.infer<typeof SafetySummaryInputSchema>;

const SafetySummaryOutputSchema = z.object({
  summary: z.string().describe('A summary of safety incidents and compliance for the given timeframe.'),
  recommendations: z.string().describe('AI-generated recommendations to improve safety.'),
});
export type SafetySummaryOutput = z.infer<typeof SafetySummaryOutputSchema>;

export async function getSafetySummary(input: SafetySummaryInput): Promise<SafetySummaryOutput> {
  return safetyComplianceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'safetyCompliancePrompt',
  input: { schema: SafetySummaryInputSchema },
  output: { schema: SafetySummaryOutputSchema },
  prompt: `You are a plant safety officer AI. Based on a set of mock safety logs for a cement plant, provide a concise summary and recommendations for the given timeframe: {{{timeframe}}}.

Example: For a weekly report, you might say "One minor incident reported in the preheater section, related to improper use of PPE. Overall compliance remains at 98%. Recommendation: Schedule a mandatory PPE refresher training for all staff in that section."

Generate a plausible summary and a set of actionable recommendations.`,
});

const safetyComplianceFlow = ai.defineFlow(
  {
    name: 'safetyComplianceFlow',
    inputSchema: SafetySummaryInputSchema,
    outputSchema: SafetySummaryOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
