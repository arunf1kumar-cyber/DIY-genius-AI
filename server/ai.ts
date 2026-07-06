import { GoogleGenAI, Type } from "@google/genai";

let aiClient: any = null;

export function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is missing. Please configure it in your AI Studio Secrets panel."
    );
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Wrapper with exponential backoff retries for transient model availability errors (like 503)
async function generateWithRetry(params: any, maxAttempts = 5, initialDelayMs = 1500) {
  const ai = getAI();
  let delay = initialDelayMs;

  // Candidate models to rotate through under high-demand or rate-limited conditions
  const modelsToTry = [
    params.model || "gemini-3.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest"
  ];

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Rotate to the next candidate model on subsequent attempts
    const modelIndex = (attempt - 1) % modelsToTry.length;
    params.model = modelsToTry[modelIndex];

    try {
      console.log(`[Gemini API] Attempt ${attempt}/${maxAttempts} using model: ${params.model}`);
      const response = await ai.models.generateContent(params);
      return response;
    } catch (err: any) {
      const errStr = String(err?.message || err);
      const isTransient =
        errStr.includes("503") ||
        errStr.includes("UNAVAILABLE") ||
        errStr.includes("high demand") ||
        errStr.includes("rate limit") ||
        errStr.includes("429") ||
        errStr.includes("overloaded");

      if (isTransient && attempt < maxAttempts) {
        console.warn(
          `[Gemini API] Transient error on model '${params.model}' (attempt ${attempt}/${maxAttempts}): ${errStr}. Retrying in ${delay}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2.0; // Exponential backoff factor
      } else {
        console.error(`[Gemini API] Failed after ${attempt} attempts on model '${params.model}':`, err);
        throw err;
      }
    }
  }
  throw new Error("Maximum retry attempts reached for Gemini API");
}

// Generates a fully populated, structured DIY project blueprint
export async function generateDIYProject(
  title: string,
  category: string,
  experience: string,
  budgetStr: string,
  toolsStr: string
) {
  const ai = getAI();

  const prompt = `
    You are an expert project mentor and maker. Create a detailed, complete DIY project based on:
    Project Title: "${title}"
    Category: "${category}"
    Experience level of user: "${experience}"
    Budget constraints: "${budgetStr}"
    Available tools: "${toolsStr}"

    Provide a fully loaded BOM (Bill of Materials), a complete list of structured steps (minimum 5 steps, up to 10), safety warnings, and detailed circuit design (overview, explicit pin-to-pin connections, and mistakes to avoid).
    Be realistic, educational, encouraging, and highly specific. Keep estimated prices realistic in USD.
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      category: { type: Type.STRING },
      description: { type: Type.STRING },
      difficulty: { type: Type.STRING, description: "beginner, intermediate, or advanced" },
      budget: {
        type: Type.OBJECT,
        properties: {
          estimatedTotal: { type: Type.NUMBER },
          lowBudget: { type: Type.NUMBER },
          standard: { type: Type.NUMBER },
          premium: { type: Type.NUMBER },
          upgradeOptions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ["estimatedTotal", "lowBudget", "standard", "premium", "upgradeOptions"],
      },
      components: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            quantity: { type: Type.INTEGER },
            description: { type: Type.STRING },
            specifications: { type: Type.STRING },
            purpose: { type: Type.STRING },
            estimatedPrice: { type: Type.NUMBER },
            alternative: { type: Type.STRING },
            availability: { type: Type.STRING },
          },
          required: [
            "name",
            "quantity",
            "description",
            "specifications",
            "purpose",
            "estimatedPrice",
            "alternative",
            "availability",
          ],
        },
      },
      safetyInstructions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            criticality: { type: Type.STRING, description: "low, medium, or high" },
          },
          required: ["title", "description", "criticality"],
        },
      },
      circuitDetails: {
        type: Type.OBJECT,
        properties: {
          overview: { type: Type.STRING },
          connections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                from: { type: Type.STRING },
                to: { type: Type.STRING },
                description: { type: Type.STRING },
                pinLabel: { type: Type.STRING },
              },
              required: ["from", "to", "description"],
            },
          },
          wiringMistakes: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          currentFlowExplanation: { type: Type.STRING },
        },
        required: ["overview", "connections", "wiringMistakes", "currentFlowExplanation"],
      },
      steps: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            stepNumber: { type: Type.INTEGER },
            objective: { type: Type.STRING },
            explanation: { type: Type.STRING },
            components: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            tools: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            expectedResult: { type: Type.STRING },
            commonMistakes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            tips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            estimatedTime: { type: Type.STRING },
            difficulty: { type: Type.STRING },
          },
          required: [
            "stepNumber",
            "objective",
            "explanation",
            "components",
            "tools",
            "expectedResult",
            "commonMistakes",
            "tips",
            "estimatedTime",
            "difficulty",
          ],
        },
      },
    },
    required: [
      "title",
      "category",
      "description",
      "difficulty",
      "budget",
      "components",
      "safetyInstructions",
      "circuitDetails",
      "steps",
    ],
  };

  const response = await generateWithRetry({
    model: "gemini-3.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
      temperature: 0.2,
    },
  });

  const parsed = JSON.parse(response.text.trim());
  return parsed;
}

// Conduct context-aware chats with the project mentor
export async function chatWithMentor(
  projectTitle: string,
  currentStepObj: any,
  chatHistory: { role: "user" | "model"; parts: { text: string }[] }[],
  userMessage: string
) {
  const ai = getAI();

  // Construct a robust system context instruction
  const systemInstruction = `
    You are an encouraging and highly skilled technical mentor for a DIY maker project called "${projectTitle}".
    The user is currently at Step ${currentStepObj?.stepNumber || 1}: "${
    currentStepObj?.objective || "Planning"
  }".
    Current Step Details:
    - Objective: ${currentStepObj?.objective}
    - Explanation: ${currentStepObj?.explanation}
    - Expected Result: ${currentStepObj?.expectedResult}

    Your goals:
    1. Answer the user's questions in simple, friendly, beginner-friendly but technically precise terms.
    2. Guide them specifically on their current step. Do not jump ahead unless they are ready.
    3. If they describe an error or problem, act as a Troubleshooting Assistant. Ask targeted diagnostic questions (e.g., "What does the multimeter read?", "Is the LED polarity correct?", "Did you hear any sound?").
    4. Highlight safety instructions whenever high voltage, lithium batteries, soldering, or tools are mentioned.
    5. At the end of your response, if you feel they have completed the current step based on their description, politely suggest they can click the 'Mark Step Complete' button to progress.
    6. Do not use complex markdown formatting other than paragraphs, short lists, and bold words. Keep the response compact and highly legible.
  `;

  // We convert the chatHistory to the proper contents array for generateContent
  // The SDK contents format expects objects like { role: 'user'|'model', parts: [{ text: '...' }] }
  const contents = [...chatHistory, { role: "user", parts: [{ text: userMessage }] }];

  const response = await generateWithRetry({
    model: "gemini-3.5-flash",
    contents: contents,
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.7,
    },
  });

  return response.text;
}

// Multimodal image analyzer for circuit and project photos
export async function analyzeImageCircuit(
  base64Image: string,
  mimeType: string,
  currentStepObj: any
) {
  const ai = getAI();

  const prompt = `
    Analyze this photo uploaded by the maker working on their DIY project.
    They are currently on Step ${currentStepObj?.stepNumber || 1}: "${
    currentStepObj?.objective || "Assembly"
  }".
    Step details:
    - Objective: ${currentStepObj?.objective}
    - Expected Result: ${currentStepObj?.expectedResult}

    Task:
    1. Identify visible components (e.g., breadboards, boards like Arduino/ESP32, sensors, LEDs, resistors, capacitors, wiring, solder joints).
    2. Check the wiring/connections: Are there obvious incorrect connections, short circuits, or loose wires?
    3. Evaluate safety risks: Any risk of short circuit, exposed mains wiring, reversed battery polarity, or bad solder joints?
    4. Provide direct, highly constructive feedback. Point out exactly what looks correct and what needs attention.
    5. Conclude whether this assembly looks correct and matches the current step requirements.
    
    Structure your response with clear headings:
    - **Identified Components**: [List what is visible]
    - **Wiring & Connection Assessment**: [Explain correctness]
    - **Safety & Soldering Quality**: [Point out safety concerns/soldering feedback]
    - **Actionable Verdict**: [Tell them if they can safely proceed or how to fix the issues]
  `;

  const imagePart = {
    inlineData: {
      mimeType: mimeType || "image/jpeg",
      data: base64Image,
    },
  };

  const textPart = {
    text: prompt,
  };

  const response = await generateWithRetry({
    model: "gemini-3.5-flash",
    contents: { parts: [imagePart, textPart] },
    config: {
      temperature: 0.4,
    },
  });

  return response.text;
}
