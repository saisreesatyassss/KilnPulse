// src/ai/flows/alert-explanation.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating explanations for rule-based alerts, including a confidence score.
 *
 * - generateAlertExplanation - A function that generates an explanation for a triggered alert.
 * - AlertExplanationInput - The input type for the generateAlertExplanation function.
 * - AlertExplanationOutput - The return type for the generateAlertExplanation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AlertExplanationInputSchema = z.object({
  metric: z.string().describe('The name of the metric that triggered the alert.'),
  threshold: z.number().describe('The threshold that was exceeded.'),
  currentValue: z.number().describe('The current value of the metric.'),
  timestamp: z.string().describe('The timestamp when the alert was triggered.'),
  ruleDescription: z.string().describe('The description of the rule that triggered the alert.'),
});
export type AlertExplanationInput = z.infer<typeof AlertExplanationInputSchema>;

const AlertExplanationOutputSchema = z.object({
  explanation: z.string().describe('The explanation for the alert, including the reason and potential causes.'),
  confidenceScore: z.number().describe('A score between 0 and 1 indicating the confidence in the explanation.'),
});
export type AlertExplanationOutput = z.infer<typeof AlertExplanationOutputSchema>;

export async function generateAlertExplanation(input: AlertExplanationInput): Promise<AlertExplanationOutput> {
  return alertExplanationFlow(input);
}

const alertExplanationPrompt = ai.definePrompt({
  name: 'alertExplanationPrompt',
  input: {schema: AlertExplanationInputSchema},
  output: {schema: AlertExplanationOutputSchema},
  prompt: `You are an AI assistant that explains rule-based alerts in an industrial kiln.

  A rule-based alert has been triggered with the following information:

  Metric: {{{metric}}}
  Threshold: {{{threshold}}}
  Current Value: {{{currentValue}}}
  Timestamp: {{{timestamp}}}
  Rule Description: {{{ruleDescription}}}

  Generate an explanation for why this alert was triggered, including potential causes and a confidence score (0-1) for the explanation's accuracy.
  The confidence score should reflect the certainty of the explanation based on the information provided.
  `,
});

const alertExplanationFlow = ai.defineFlow(
  {
    name: 'alertExplanationFlow',
    inputSchema: AlertExplanationInputSchema,
    outputSchema: AlertExplanationOutputSchema,
  },
  async input => {
    const {output} = await alertExplanationPrompt(input);
    return output!;
  }
);
