'use server';

/**
 * @fileOverview An AI assistant for kiln operators, providing summaries,
 * anomaly explanations, and corrective actions.
 *
 * - aiOperatorAssistant - A function that orchestrates the AI assistant flow.
 * - AIOperatorAssistantInput - The input type for the aiOperatorAssistant function.
 * - AIOperatorAssistantOutput - The return type for the aiOperatorAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const AIOperatorAssistantInputSchema = z.object({
  query: z.string().describe('The operator query.'),
  temperature: z.number().describe('The current temperature of the kiln.'),
  oxygenLevel: z.number().describe('The current oxygen level in the kiln.'),
  energyConsumption: z.number().describe('The current energy consumption of the kiln.'),
});

export type AIOperatorAssistantInput = z.infer<typeof AIOperatorAssistantInputSchema>;

const AIOperatorAssistantOutputSchema = z.object({
  summary: z.string().describe('A summary of the current kiln KPIs.'),
  anomalyExplanation: z.string().describe('An explanation of any anomalies, highlighting critical conditions.'),
  correctiveActions: z.string().describe('A list of suggested corrective actions and operational setpoints.'),
  reasoning: z.string().describe('The reasoning behind the summary, explanation, and actions.'),
});

export type AIOperatorAssistantOutput = z.infer<typeof AIOperatorAssistantOutputSchema>;

export async function aiOperatorAssistant(input: AIOperatorAssistantInput): Promise<AIOperatorAssistantOutput> {
  return aiOperatorAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiOperatorAssistantPrompt',
  input: {schema: AIOperatorAssistantInputSchema},
  output: {schema: AIOperatorAssistantOutputSchema},
  prompt: `You are an AI assistant for kiln operators. Your goal is to simplify complex decisions and provide clear guidance.

You will receive the current kiln KPIs: temperature, oxygen level, and energy consumption.
Based on these KPIs and the operator's query, you will provide:
1.  A 'summary' of the current kiln state.
2.  An 'anomalyExplanation', highlighting any critical conditions found in the data. If there are no anomalies, state that everything is operating within normal parameters.
3.  A set of 'correctiveActions'. These should be specific, actionable steps, including suggested operational setpoints (e.g., "Adjust preheater fan speed to 85%").
4.  Clear 'reasoning' for your recommendations.

Current KPIs:
Temperature: {{{temperature}}}°C
Oxygen Level: {{{oxygenLevel}}}%
Energy Consumption: {{{energyConsumption}}} kWh

Operator Query: {{{query}}}`, 
});

const aiOperatorAssistantFlow = ai.defineFlow(
  {
    name: 'aiOperatorAssistantFlow',
    inputSchema: AIOperatorAssistantInputSchema,
    outputSchema: AIOperatorAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
