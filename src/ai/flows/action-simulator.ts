'use server';

/**
 * @fileOverview An AI agent for simulating the impact of operational changes.
 *
 * - simulateActionImpact - A function that handles the simulation process.
 * - ActionSimulatorInput - The input type for the simulateActionImpact function.
 * - ActionSimulatorOutput - The return type for the simulateActionImpact function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ActionSimulatorInputSchema = z.object({
  action: z.string().describe('The proposed operational action to simulate (e.g., "Reduce kiln temp by 3%").'),
  currentMetrics: z.object({
    temperature: z.number().describe('Current kiln temperature in Celsius.'),
    oxygenLevel: z.number().describe('Current oxygen level in the kiln (%).'),
    energyConsumption: z.number().describe('Current energy consumption in kWh.'),
  }),
});
export type ActionSimulatorInput = z.infer<typeof ActionSimulatorInputSchema>;

const ActionSimulatorOutputSchema = z.object({
  projectedEffects: z.object({
    energyChange: z.number().describe('The projected percentage change in energy consumption.'),
    qualityImpact: z.string().describe('A qualitative assessment of the impact on clinker quality (e.g., "Minimal", "Improved", "Risk of lower strength").'),
    co2Change: z.number().describe('The projected percentage change in CO2 emissions.'),
    costChange: z.number().describe('The projected percentage change in operational cost.'),
  }),
  reasoning: z.string().describe('A narrative from the AI explaining why it projects these outcomes, detailing the cause-and-effect relationships.'),
});
export type ActionSimulatorOutput = z.infer<typeof ActionSimulatorOutputSchema>;

export async function simulateActionImpact(input: ActionSimulatorInput): Promise<ActionSimulatorOutput> {
  return actionSimulatorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'actionSimulatorPrompt',
  input: { schema: ActionSimulatorInputSchema },
  output: { schema: ActionSimulatorOutputSchema },
  prompt: `You are an AI expert in cement kiln process optimization. Your task is to simulate the impact of a proposed operational change.

**Proposed Action:** {{{action}}}

**Current Kiln State:**
- Temperature: {{{currentMetrics.temperature}}}°C
- Oxygen Level: {{{currentMetrics.oxygenLevel}}}%
- Energy Consumption: {{{currentMetrics.energyConsumption}}} kWh

**Instructions:**
1.  Analyze the proposed action in the context of the current kiln state.
2.  Project the likely effects of this action on the following key performance indicators (KPIs):
    - **Energy Consumption:** Estimate the percentage change (e.g., -5 for a 5% decrease, 10 for a 10% increase).
    - **Clinker Quality:** Provide a qualitative assessment of the impact (e.g., "Minimal", "Improved", "Risk of lower strength").
    - **CO2 Emissions:** Estimate the percentage change.
    - **Operational Cost:** Estimate the percentage change.
3.  Provide a clear 'reasoning' narrative. Explain the cause-and-effect relationships that lead to your projections. For example, "Reducing the kiln temperature by 3% will lower thermal energy demand, directly causing an estimated 5% decrease in energy consumption and a corresponding drop in CO2 emissions. While this offers cost savings, the lower temperature slightly increases the risk of incomplete clinker formation, posing a minimal risk to final product quality."

Provide the simulation results in the specified JSON output format.`,
});

const actionSimulatorFlow = ai.defineFlow(
  {
    name: 'actionSimulatorFlow',
    inputSchema: ActionSimulatorInputSchema,
    outputSchema: ActionSimulatorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
