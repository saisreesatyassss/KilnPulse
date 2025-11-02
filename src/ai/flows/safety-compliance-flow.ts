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

const safetyComplianceFlow = async (input: SafetySummaryInput): Promise<SafetySummaryOutput> => {
    // Return static data based on the timeframe for demo purposes
    if (input.timeframe === 'daily') {
        return {
            summary: "No incidents reported today. All safety checks completed successfully. Near-miss logs are clear.",
            recommendations: "Continue to encourage proactive hazard reporting during shift handovers. Ensure all personnel are wearing appropriate PPE in the cooler area."
        };
    } else if (input.timeframe === 'monthly') {
        return {
            summary: "Three minor incidents were logged this month: one slip near the raw mill (no injury), and two instances of improper PPE usage in the preheater section. Overall compliance rate is 98.7%, slightly up from last month.",
            recommendations: "1. Schedule mandatory PPE refresher training for all preheater staff. 2. Inspect floor surfaces near the raw mill for potential slip hazards and add anti-slip mats if necessary."
        };
    }
    // Default to weekly
    return {
        summary: "One minor incident reported in the preheater section this week, related to improper use of PPE. Overall compliance remains high at 98%. All scheduled drills were completed successfully.",
        recommendations: "Schedule a mandatory PPE refresher training for all staff working in the preheater section within the next 14 days. Review the incident report with the safety committee."
    };
}
