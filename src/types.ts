export interface User {
  id: string;
  email: string;
  name: string;
}

export interface BOMComponent {
  name: string;
  quantity: number;
  description: string;
  specifications: string;
  purpose: string;
  estimatedPrice: number;
  alternative: string;
  availability: string;
}

export interface SafetyRule {
  title: string;
  description: string;
  criticality: "low" | "medium" | "high";
}

export interface CircuitConnection {
  from: string;
  to: string;
  description: string;
  pinLabel?: string;
}

export interface ProjectStep {
  stepNumber: number;
  objective: string;
  explanation: string;
  components: string[];
  tools: string[];
  expectedResult: string;
  commonMistakes: string[];
  tips: string[];
  estimatedTime: string;
  difficulty: string;
  completed: boolean;
  verified: boolean;
  verificationFeedback?: string;
  imageUrl?: string;
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  category: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  budget: {
    estimatedTotal: number;
    lowBudget: number;
    standard: number;
    premium: number;
    upgradeOptions: string[];
  };
  components: BOMComponent[];
  safetyInstructions: SafetyRule[];
  circuitDetails: {
    overview: string;
    connections: CircuitConnection[];
    wiringMistakes: string[];
    currentFlowExplanation: string;
  };
  steps: ProjectStep[];
  currentStep: number;
  completed: boolean;
  createdAt: string;
  chatHistory: { role: "user" | "model"; parts: { text: string }[] }[];
  uploadedImages: { url: string; analyzedAt: string; feedback: string }[];
}

export interface VideoRecommendation {
  title: string;
  description: string;
  duration: string;
  channel: string;
  url: string;
}
