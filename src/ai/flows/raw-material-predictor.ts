'use server';

/**
 * @fileOverview An AI model for predicting raw material variability and recommending process adjustments.
 *
 * - predictRawMaterial - A function that handles the prediction and adjustment recommendation.
 * - RawMaterialInput - The input type for the predictRawMaterial function.
 * - RawMaterialPrediction - The return type for the predictRawMaterial function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const RawMaterialInputSchema = z.object({
  limestoneMoisture: z.number().describe('Current moisture content of limestone from quarry sensors (%).'),
  claySilicaContent: z.number().describe('Current silica (SiO2) content in clay (%).'),
  ironOreContent: z.number().describe('Current iron ore (Fe2O3) addition rate (%).'),
  currentGrindingRate: z.number().describe('Current raw mill grinding rate in tons per hour (t/h).'),
  currentKilnFeedRate: z.number().describe('Current kiln feed rate in tons per hour (t/h).'),
});
export type RawMaterialInput = z.infer<typeof RawMaterialInputSchema>;

const RawMaterialPredictionOutputSchema = z.object({
    predictedMoisture: z.number().describe('The predicted overall moisture of the raw mix (%).'),
    predictedComposition: z.object({
        limeSaturation: z.number().describe('Predicted Lime Saturation Factor (LSF) of the raw mix.'),
        silicaModulus: z.number().describe('Predicted Silica Modulus (SM) of the raw mix.'),
        aluminaModulus: z.number().describe('Predicted Alumina Modulus (AM) of the raw mix.'),
    }),
    recommendedGrindingRate: z.number().describe('Recommended adjustment to the raw mill grinding rate (t/h).'),
    recommendedKilnFeedRate: z.number().describe('Recommended adjustment to the kiln feed rate (t/h).'),
    reasoning: z.string().describe('A detailed explanation for the predictions and recommended adjustments to maintain process stability and product quality.'),
});
export type RawMaterialPrediction = z.infer<typeof RawMaterialPredictionOutputSchema>;


export async function predictRawMaterial(input: RawMaterialInput): Promise<RawMaterialPrediction> {
  return predictRawMaterialFlow(input);
}

const prompt = ai.definePrompt({
  name: 'rawMaterialPredictorPrompt',
  input: { schema: RawMaterialInputSchema },
  output: { schema: RawMaterialPredictionOutputSchema },
  prompt: `You are an AI expert in cement manufacturing, specializing in raw material processing and kiln feed chemistry. Your task is to predict the variability in raw material properties based on limited sensor data and recommend dynamic process adjustments.

**Assumptions for Calculation (use these fixed values):**
- Bauxite Alumina (Al2O3) content: 45%
- Clay Alumina (Al2O3) content: 15%
- Clay Iron (Fe2O3) content: 5%
- Limestone Calcium Oxide (CaO) content: 90%

**Target Raw Mix Chemistry:**
- Lime Saturation Factor (LSF): 98
- Silica Modulus (SM): 2.4
- Alumina Modulus (AM): 1.8

**Current Process & Material Data:**
- Limestone Moisture: {{{limestoneMoisture}}}%
- Clay Silica (SiO2) Content: {{{claySilicaContent}}}%
- Iron Ore (Fe2O3) Addition: {{{ironOreContent}}}%
- Current Grinding Rate: {{{currentGrindingRate}}} t/h
- Current Kiln Feed Rate: {{{currentKilnFeedRate}}} t/h

**Your Goal:**
1.  **Predict Variability:** Based on the incoming material data, predict the final raw mix 'predictedMoisture' and key chemical parameters ('predictedComposition': LSF, SM, AM).
2.  **Recommend Adjustments:** Based on your predictions and the target chemistry, recommend a new 'recommendedGrindingRate' and 'recommendedKilnFeedRate'. The goal is to counteract the input variability to maintain a stable kiln feed.
3.  **Provide Reasoning:** Explain your predictions and recommendations in the 'reasoning' field. Detail how the adjustments will help maintain process stability and ensure consistent clinker quality. For example, "The incoming limestone shows higher moisture, so I've predicted an overall moisture increase. To compensate, I recommend slightly reducing the kiln feed rate to ensure proper drying and prevent kiln instability."

Analyze the inputs and provide the predictions and recommended adjustments in the specified output format.`,
});

const predictRawMaterialFlow = ai.defineFlow(
  {
    name: 'predictRawMaterialFlow',
    inputSchema: RawMaterialInputSchema,
    outputSchema: RawMaterialPredictionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
