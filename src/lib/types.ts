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
