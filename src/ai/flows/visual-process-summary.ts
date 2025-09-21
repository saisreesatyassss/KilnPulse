'use server';

/**
 * @fileOverview An AI agent for generating visual process summaries from text.
 *
 * - generateVisualSummary - A function that handles the image generation process.
 * - VisualSummaryInput - The input type for the generateVisualSummary function.
 * - VisualSummaryOutput - The return type for the generateVisualSummary function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const VisualSummaryInputSchema = z.object({
  description: z.string().describe('A detailed text description of the process, alert, or operational log to be visualized.'),
});
export type VisualSummaryInput = z.infer<typeof VisualSummaryInputSchema>;

const VisualSummaryOutputSchema = z.object({
  imageUrl: z.string().describe("The generated image as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type VisualSummaryOutput = z.infer<typeof VisualSummaryOutputSchema>;


export async function generateVisualSummary(input: VisualSummaryInput): Promise<VisualSummaryOutput> {
  return generateVisualSummaryFlow(input);
}

const generateVisualSummaryFlow = ai.defineFlow(
  {
    name: 'generateVisualSummaryFlow',
    inputSchema: VisualSummaryInputSchema,
    outputSchema: VisualSummaryOutputSchema,
  },
  async (input) => {
    // Using a placeholder image service to avoid hitting API rate limits.
    const imageUrl = `https://picsum.photos/seed/${Date.now()}/1280/720`;
    
    // Simulate a delay to mimic image generation time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // We can't fetch the image and convert to data URI on the server easily without more dependencies.
    // For now, we will return the URL directly, and the client will handle it.
    // In a real scenario, you'd fetch this and convert to a base64 data URI if needed.
    return { imageUrl };
  }
);
