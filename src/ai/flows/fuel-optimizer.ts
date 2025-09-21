'use server';

/**
 * @fileOverview An AI agent for optimizing alternative fuel mixes in a kiln.
 *
 * - optimizeFuelMix - A function that handles the fuel mix optimization process.
 * - FuelMixInput - The input type for the optimizeFuelMix function.
 * - FuelMixOutput - The return type for the optimizeFuelMix function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const FuelMixSchema = z.object({
    coal: z.number().describe('Percentage of Coal in the mix.'),
    petcoke: z.number().describe('Percentage of Petroleum Coke (Petcoke) in the mix.'),
    biomass: z.number().describe('Percentage of Biomass in the mix.'),
});
export type FuelMix = z.infer<typeof FuelMixSchema>;

const ConstraintsSchema = z.object({
    maxCost: z.number().describe('Maximum acceptable cost per ton of the fuel mix.'),
    minCalorificValue: z.number().describe('Minimum required calorific value in kcal/kg.'),
    maxAshContent: z.number().describe('Maximum acceptable percentage of ash content.'),
});
export type Constraints = z.infer<typeof ConstraintsSchema>;


const FuelMixInputSchema = z.object({
  currentMix: FuelMixSchema,
  constraints: ConstraintsSchema,
});
export type FuelMixInput = z.infer<typeof FuelMixInputSchema>;

const FuelMixOutputSchema = z.object({
  recommendedMix: FuelMixSchema,
  thermalSubstitutionRate: z.number().describe('The achievable thermal substitution rate (TSR) as a percentage.'),
  co2Emissions: z.number().describe('The estimated CO2 emissions in tons of CO2 per terajoule (tCO2/TJ).'),
  costSavings: z.number().describe('The estimated cost savings in USD per ton compared to the original mix.'),
  reasoning: z.string().describe('A detailed explanation of why this mix is optimal based on the provided constraints and goals.'),
});
export type FuelMixOutput = z.infer<typeof FuelMixOutputSchema>;

export async function optimizeFuelMix(input: FuelMixInput): Promise<FuelMixOutput> {
  return optimizeFuelMixFlow(input);
}

const prompt = ai.definePrompt({
  name: 'fuelMixOptimizerPrompt',
  input: { schema: FuelMixInputSchema },
  output: { schema: FuelMixOutputSchema },
  prompt: `You are an AI expert in cement kiln process engineering and alternative fuel management. Your task is to optimize a fuel mix to maximize thermal substitution and sustainability while adhering to specific operational constraints.

You will be given the current fuel mix percentages and a set of constraints. You need to simulate various blends and recommend the best combination.

**Fuel Properties (use these for your calculations):**
- **Coal:**
  - Calorific Value: 6500 kcal/kg
  - Ash Content: 12%
  - Cost: $55/ton
  - CO2 Emission Factor: 95 tCO2/TJ
- **Petcoke:**
  - Calorific Value: 8000 kcal/kg
  - Ash Content: 5%
  - Cost: $70/ton
  - CO2 Emission Factor: 101 tCO2/TJ
- **Biomass (e.g., sawdust, agricultural waste):**
  - Calorific Value: 3500 kcal/kg
  - Ash Content: 8%
  - Cost: $30/ton
  - CO2 Emission Factor: 5 tCO2/TJ (considered carbon neutral, but has a small process emission factor)

**Current State & Constraints:**
- Current Coal Mix: {{{currentMix.coal}}}%
- Current Petcoke Mix: {{{currentMix.petcoke}}}%
- Current Biomass Mix: {{{currentMix.biomass}}}%
- Maximum Cost: {{{constraints.maxCost}}}/ton
- Minimum Calorific Value: {{{constraints.minCalorificValue}}} kcal/kg
- Maximum Ash Content: {{{constraints.maxAshContent}}}%

**Your Goal:**
1.  Determine a new, optimal fuel mix (coal, petcoke, biomass) that meets all constraints.
2.  The primary optimization goal is to **maximize the percentage of biomass** (for thermal substitution and sustainability), then to minimize cost.
3.  The total percentage of the new mix must sum to 100%.
4.  Calculate the resulting 'thermalSubstitutionRate' (which is the percentage of biomass in the recommended mix), 'co2Emissions', and 'costSavings' for the recommended mix. Cost savings should be calculated against the cost of the *original* mix.
5.  Provide clear 'reasoning' for your recommendation, explaining how it balances the constraints and achieves the goals. Explain the trade-offs made. For example, "Increased biomass to 25% to boost sustainability, which was possible while staying under the max cost by slightly reducing the expensive petcoke portion. The overall calorific value was maintained above the minimum threshold."

Analyze the inputs and provide the optimal fuel mix recommendation in the specified output format.`,
});

const optimizeFuelMixFlow = ai.defineFlow(
  {
    name: 'optimizeFuelMixFlow',
    inputSchema: FuelMixInputSchema,
    outputSchema: FuelMixOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
