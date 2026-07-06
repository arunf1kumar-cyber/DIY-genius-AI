import fs from "fs";
import path from "path";

// If running in Vercel, use /tmp/db.json which is writable.
// Otherwise, use the standard local db.json.
const isVercel = process.env.VERCEL === "1" || !!process.env.VERCEL;
const BASE_DB_FILE = path.join(process.cwd(), "db.json");
const DB_FILE = isVercel ? "/tmp/db.json" : BASE_DB_FILE;

// Copy seed/existing db.json to /tmp/db.json on cold start to preserve pre-existing credentials/projects
if (isVercel && !fs.existsSync(DB_FILE)) {
  try {
    if (fs.existsSync(BASE_DB_FILE)) {
      fs.copyFileSync(BASE_DB_FILE, DB_FILE);
    } else {
      fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], projects: [] }, null, 2), "utf-8");
    }
  } catch (err) {
    console.error("Failed to copy/initialize database in /tmp on Vercel:", err);
  }
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: string;
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
  currentStep: number; // 0-indexed step pointer
  completed: boolean;
  createdAt: string;
  chatHistory: { role: "user" | "model"; parts: { text: string }[] }[];
  uploadedImages: { url: string; analyzedAt: string; feedback: string }[];
}

interface Database {
  users: User[];
  projects: Project[];
}

function initDb(): Database {
  if (!fs.existsSync(DB_FILE)) {
    const defaultDb: Database = { users: [], projects: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), "utf-8");
    return defaultDb;
  }
  try {
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database file, resetting:", err);
    const defaultDb: Database = { users: [], projects: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), "utf-8");
    return defaultDb;
  }
}

export function getDb(): Database {
  return initDb();
}

export function saveDb(db: Database) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
}
