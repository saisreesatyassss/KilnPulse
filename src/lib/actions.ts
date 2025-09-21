"use server";

import { generateAlertExplanation, AlertExplanationInput } from "@/ai/flows/alert-explanation";
import { aiOperatorAssistant, AIOperatorAssistantInput } from "@/ai/flows/ai-operator-assistant";

export async function getAlertExplanationAction(input: AlertExplanationInput) {
  return await generateAlertExplanation(input);
}

export async function getAIAssistantResponseAction(input: AIOperatorAssistantInput) {
    return await aiOperatorAssistant(input);
}
