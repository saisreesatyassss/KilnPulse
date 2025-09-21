export type DataPoint = {
  time: string;
  value: number;
};

export type KilnData = {
  temperature: DataPoint[];
  oxygen: DataPoint[];
  energy: DataPoint[];
};

export type Alert = {
  id: string;
  metric: 'Temperature' | 'Oxygen' | 'Energy';
  threshold: number;
  currentValue: number;
  timestamp: string;
  ruleDescription: string;
  explanation: string;
  confidenceScore: number;
};

export type Message = {
    id: string;
    role: "user" | "assistant";
    content: string | AIOperatorAssistantResponse;
}

export type AIOperatorAssistantResponse = {
    summary: string;
    anomalyExplanation: string;
    correctiveActions: string;
    reasoning: string;
}

export type FuelMix = {
    coal: number;
    petcoke: number;
    biomass: number;
};

export type Constraints = {
    maxCost: number;
    minCalorificValue: number;
    maxAshContent: number;
};

export type OptimizationResult = {
    recommendedMix: FuelMix;
    thermalSubstitutionRate: number;
    co2Emissions: number;
    costSavings: number;
    reasoning: string;
};


export type RawMaterialInput = {
  limestoneMoisture: number;
  claySilicaContent: number;
  ironOreContent: number;
  currentGrindingRate: number;
  currentKilnFeedRate: number;
};

export type RawMaterialPrediction = {
  predictedMoisture: number;
  predictedComposition: {
    limeSaturation: number;
    silicaModulus: number;
    aluminaModulus: number;
  };
  recommendedGrindingRate: number;
  recommendedKilnFeedRate: number;
  reasoning: string;
};
