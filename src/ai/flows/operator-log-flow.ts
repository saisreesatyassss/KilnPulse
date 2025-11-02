'use server';

/**
 * @fileOverview An AI agent for analyzing operator log entries.
 *
 * - analyzeLogEntry - A function that analyzes a log entry and extracts key info.
 * - OperatorLogInput - The input type for the analyzeLogEntry function.
 * - OperatorLogOutput - The return type for the analyzeLogEntry function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const OperatorLogInputSchema = z.object({
  logEntry: z.string().describe('The text content of the operator\'s log entry.'),
});
export type OperatorLogInput = z.infer<typeof OperatorLogInputSchema>;

const OperatorLogOutputSchema = z.object({
  sentiment: z.enum(['positive', 'neutral', 'negative']).describe('The overall sentiment of the log entry.'),
  keywords: z.array(z.string()).describe('A list of important keywords extracted from the log.'),
  summary: z.string().describe('A one-sentence summary of the log entry.'),
});
export type OperatorLogOutput = z.infer<typeof OperatorLogOutputSchema>;

export async function analyzeLogEntry(input: OperatorLogInput): Promise<OperatorLogOutput> {
  return operatorLogFlow(input);
}

const operatorLogFlow = async (input: OperatorLogInput): Promise<OperatorLogOutput> => {
    // Return static data for demo purposes
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    return {
        sentiment: 'neutral',
        keywords: ['shift handover', 'kiln temperature', 'gearbox vibration', 'monitoring'],
        summary: 'Shift handover was completed with stable kiln temperature, but a slight increase in gearbox vibration was noted for monitoring.'
    };
}
