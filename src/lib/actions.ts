"use server";

import { generateAlertExplanation, AlertExplanationInput } from "@/ai/flows/alert-explanation";
import { aiOperatorAssistant, AIOperatorAssistantInput } from "@/ai/flows/ai-operator-assistant";
import { optimizeFuelMix, FuelMixInput } from "@/ai/flows/fuel-optimizer";
import { predictRawMaterial, RawMaterialInput } from "@/ai/flows/raw-material-predictor";
import { generateVisualSummary, VisualSummaryInput } from "@/ai/flows/visual-process-summary";
import { predictMaintenance, MaintenancePredictionInput } from "@/ai/flows/maintenance-predictor";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { collection, getFirestore } from "firebase/firestore";
import { initializeFirebase } from "@/firebase";
import { MaintenanceTask } from "./types";

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

export async function generateVisualSummaryAction(input: VisualSummaryInput) {
    return await generateVisualSummary(input);
}

export async function predictMaintenanceAction(input: MaintenancePredictionInput) {
    return await predictMaintenance(input);
}

export async function scheduleMaintenanceAction(task: Omit<MaintenanceTask, 'id' | 'scheduledAt' | 'status'>) {
    const { firestore } = initializeFirebase();
    const tasksCollection = collection(firestore, 'maintenanceTasks');
    
    const newTask: Omit<MaintenanceTask, 'id'> = {
        ...task,
        scheduledAt: new Date().toISOString(),
        status: 'Scheduled',
    };

    try {
        addDocumentNonBlocking(tasksCollection, newTask);
        return { success: true, message: "Maintenance task scheduled successfully." };
    } catch (error) {
        console.error("Error scheduling maintenance task:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, message: `Failed to schedule maintenance task: ${errorMessage}` };
    }
}
