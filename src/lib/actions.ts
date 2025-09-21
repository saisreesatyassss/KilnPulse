"use server";

import { generateAlertExplanation, AlertExplanationInput } from "@/ai/flows/alert-explanation";
import { aiOperatorAssistant, AIOperatorAssistantInput } from "@/ai/flows/ai-operator-assistant";
import { optimizeFuelMix, FuelMixInput } from "@/ai/flows/fuel-optimizer";
import { predictRawMaterial, RawMaterialInput } from "@/ai/flows/raw-material-predictor";

export async function getAlertExplanationAction(input: AlertExplanationInput) {
  return await generateAlertExplanation(input);
}

export async function getAIAssistantResponseAction(input: AIOperatorAssistantInput) {
    return await aiOperatorAssistant(input);
}

export async function optimizeFuelMixAction(input: FuelMixInput) {
    return await optimizeFuelMix(input);
}

export async function predictRawMaterialAction(input: RawMaterialInput) {
    return await predictRawMaterial(input);
}
