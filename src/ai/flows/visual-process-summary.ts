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
    const { media } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: `You are an expert at creating process diagrams for industrial settings.
        Based on the following text description, generate a clear, customized visual diagram or infographic.
        The diagram should be easy to understand and visually represent the key elements, flows, and statuses mentioned.
        Use a clean, modern style with clear labels and icons appropriate for an industrial context.

        Description:
        ${input.description}`,
    });

    if (!media?.url) {
      throw new Error('Image generation failed.');
    }
    
    return { imageUrl: media.url };
  }
);
