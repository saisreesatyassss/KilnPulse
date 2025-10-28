'use server';

/**
 * @fileOverview An AI model for predicting equipment failure and suggesting maintenance.
 *
 * - predictMaintenance - A function that handles the prediction of equipment failure.
 * - MaintenancePredictionInput - The input type for the predictMaintenance function.
 * - MaintenancePrediction - The return type for the predictMaintenance function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { addDays, format } from 'date-fns';

const MaintenancePredictionInputSchema = z.object({
  component: z.enum(['Kiln Fan Motor', 'Main Gearbox', 'Conveyor Belt', 'Bearing Assembly']),
  vibration: z.number().describe('Current vibration amplitude in mm/s.'),
  temperature: z.number().describe('Current operating temperature in Celsius.'),
  load: z.number().describe('Current load as a percentage of capacity (0-100%).'),
});
export type MaintenancePredictionInput = z.infer<typeof MaintenancePredictionInputSchema>;

const MaintenancePredictionOutputSchema = z.object({
    component: z.string().describe("The component being analyzed."),
    prediction: z.string().describe('A concise statement about the predicted failure timeline (e.g., "Failure expected in 3-5 days").'),
    reason: z.string().describe('The key indicator that led to this prediction (e.g., "15% rise in vibration amplitude over 24 hours").'),
    predictedFailureDate: z.string().describe('The predicted date of failure in ISO 8601 format (YYYY-MM-DD).'),
});
export type MaintenancePrediction = z.infer<typeof MaintenancePredictionOutputSchema>;


export async function predictMaintenance(input: MaintenancePredictionInput): Promise<MaintenancePrediction> {
  // This is a wrapper around the Genkit flow.
  // We can add pre- and post-processing logic here if needed.
  const result = await maintenancePredictorFlow(input);
  return result;
}

// Define fixed thresholds for this example. A real application might fetch these from a database.
const thresholds = {
    'Kiln Fan Motor': { vibration: 5.0, temperature: 90, load: 95 },
    'Main Gearbox': { vibration: 6.5, temperature: 85, load: 90 },
    'Conveyor Belt': { vibration: 10.0, temperature: 60, load: 100 },
    'Bearing Assembly': { vibration: 4.5, temperature: 100, load: 100 },
};

const prompt = ai.definePrompt({
  name: 'maintenancePredictorPrompt',
  input: { schema: MaintenancePredictionInputSchema },
  output: { schema: MaintenancePredictionOutputSchema },
  prompt: `You are an AI expert in predictive maintenance for cement kiln equipment. Your task is to predict potential failures based on sensor data.

**Component:** {{{component}}}
**Current Sensor Data:**
- Vibration: {{{vibration}}} mm/s
- Temperature: {{{temperature}}} °C
- Load: {{{load}}} %

**Instructions:**
1.  Analyze the provided sensor data for the specified component.
2.  Compare the current data against these baseline failure thresholds:
    - **Kiln Fan Motor:** Vibration > 5.0 mm/s, Temp > 90°C
    - **Main Gearbox:** Vibration > 6.5 mm/s, Temp > 85°C
    - **Conveyor Belt:** Vibration > 10.0 mm/s
    - **Bearing Assembly:** Vibration > 4.5 mm/s, Temp > 100°C
3.  If any metric exceeds its threshold, predict a failure.
4.  The predicted failure timeline should be proportional to how much the threshold is exceeded. A slight exceedance might be 5-7 days out, while a major one could be 1-2 days out.
5.  Formulate a 'prediction' statement (e.g., "Failure expected within 3-5 days").
6.  Identify the primary cause and formulate a 'reason' statement (e.g., "Vibration has increased by 15% past the acceptable limit").
7.  Estimate a 'predictedFailureDate'. This should be a specific date calculated from today's date plus the number of days you estimated in the timeline. Output it in YYYY-MM-DD format.
8.  If all metrics are within normal limits, state that "No failure is predicted at this time" and provide a reason like "All metrics are within normal operating parameters." Set the predicted failure date to 30 days from now.

Provide the analysis in the specified JSON output format.`,
});

const maintenancePredictorFlow = ai.defineFlow(
  {
    name: 'maintenancePredictorFlow',
    inputSchema: MaintenancePredictionInputSchema,
    outputSchema: MaintenancePredictionOutputSchema,
  },
  async (input) => {
    // In a real flow, you might fetch historical data here to establish a trend.
    // For this example, we rely on the LLM's analysis of the single data point against fixed thresholds.
    
    const { output } = await prompt(input);

    // The LLM provides the timeline and reason, but we'll programmatically set the date for consistency.
    // This is a good example of combining LLM reasoning with deterministic code.
    const timelineDaysMatch = output!.prediction.match(/(\d+)/);
    const timelineDays = timelineDaysMatch ? parseInt(timelineDaysMatch[0], 10) : 30;

    const failureDate = addDays(new Date(), timelineDays);

    return {
        ...output!,
        predictedFailureDate: format(failureDate, 'yyyy-MM-dd'),
    };
  }
);
