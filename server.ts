import express from "express";
import path from "path";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createServer as createViteServer } from "vite";
import { getDb, saveDb, User, Project } from "./server/db";
import {
  generateDIYProject,
  chatWithMentor,
  analyzeImageCircuit,
} from "./server/ai";

const JWT_SECRET = process.env.JWT_SECRET || "diy-genius-jwt-super-secret-key-1337";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware with large limits for image analysis base64 uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Auth Middleware
  function authenticateToken(req: any, res: any, next: any) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Access token required" });
    }

    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (err) {
        return res.status(403).json({ error: "Invalid or expired token" });
      }
      req.user = decoded;
      next();
    });
  }

  // --- API ROUTES ---

  // Auth: Register
  app.post("/api/auth/register", async (req: any, res: any) => {
    try {
      const { email, password, name } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const db = getDb();
      const trimmedEmail = email.trim().toLowerCase();

      if (db.users.some((u) => u.email === trimmedEmail)) {
        return res.status(400).json({ error: "User already exists with this email" });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const newUser: User = {
        id: Math.random().toString(36).substring(2, 11),
        email: trimmedEmail,
        passwordHash,
        name: name.trim(),
        createdAt: new Date().toISOString(),
      };

      db.users.push(newUser);
      saveDb(db);

      const token = jwt.sign({ id: newUser.id, email: newUser.email, name: newUser.name }, JWT_SECRET, {
        expiresIn: "7d",
      });

      res.status(201).json({
        user: { id: newUser.id, email: newUser.email, name: newUser.name },
        token,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Registration failed" });
    }
  });

  // Auth: Login
  app.post("/api/auth/login", async (req: any, res: any) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const db = getDb();
      const trimmedEmail = email.trim().toLowerCase();
      const user = db.users.find((u) => u.email === trimmedEmail);

      if (!user) {
        return res.status(400).json({ error: "Invalid email or password" });
      }

      const validPassword = await bcrypt.compare(password, user.passwordHash);
      if (!validPassword) {
        return res.status(400).json({ error: "Invalid email or password" });
      }

      const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, {
        expiresIn: "7d",
      });

      res.json({
        user: { id: user.id, email: user.email, name: user.name },
        token,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Login failed" });
    }
  });

  // Auth: Me (Verify token)
  app.get("/api/auth/me", authenticateToken, (req: any, res: any) => {
    res.json({ user: req.user });
  });

  // Projects: Get User Projects
  app.get("/api/projects", authenticateToken, (req: any, res: any) => {
    try {
      const db = getDb();
      const userProjects = db.projects.filter((p) => p.userId === req.user.id);
      res.json(userProjects);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to retrieve projects" });
    }
  });

  // Projects: Create a new project (AI Generated Blueprint)
  app.post("/api/projects", authenticateToken, async (req: any, res: any) => {
    try {
      const { title, category, experience, budget, tools } = req.body;
      if (!title || !category) {
        return res.status(400).json({ error: "Project Title and Category are required" });
      }

      // Generate fully structured steps, safety list, and BOM components using Gemini
      const blueprint = await generateDIYProject(
        title,
        category,
        experience || "beginner",
        budget || "Standard ($50 - $100)",
        tools || "Basic screwdrivers, glue, tape"
      );

      const db = getDb();
      const newProject: Project = {
        id: Math.random().toString(36).substring(2, 11),
        userId: req.user.id,
        title: blueprint.title || title,
        category: blueprint.category || category,
        description: blueprint.description || "No description provided",
        difficulty: blueprint.difficulty || "beginner",
        budget: blueprint.budget || {
          estimatedTotal: 50,
          lowBudget: 30,
          standard: 50,
          premium: 100,
          upgradeOptions: [],
        },
        components: blueprint.components || [],
        safetyInstructions: blueprint.safetyInstructions || [],
        circuitDetails: blueprint.circuitDetails || {
          overview: "No wiring information needed",
          connections: [],
          wiringMistakes: [],
          currentFlowExplanation: "",
        },
        steps: (blueprint.steps || []).map((step: any, index: number) => ({
          ...step,
          completed: false,
          verified: false,
        })),
        currentStep: 0,
        completed: false,
        createdAt: new Date().toISOString(),
        chatHistory: [
          {
            role: "model",
            parts: [
              {
                text: `Hello ${req.user.name}! I am your DIY Genius mentor. I've customized this "${title}" project guide specifically for you. Let me know if you have any questions before you begin Step 1!`,
              },
            ],
          },
        ],
        uploadedImages: [],
      };

      db.projects.push(newProject);
      saveDb(db);

      res.status(201).json(newProject);
    } catch (err: any) {
      console.error("Failed to generate project:", err);
      let errMsg = "Failed to generate DIY blueprint";
      const errStr = String(err?.message || err);
      if (
        errStr.includes("503") ||
        errStr.includes("UNAVAILABLE") ||
        errStr.includes("high demand") ||
        errStr.includes("overloaded")
      ) {
        errMsg =
          "The AI model is currently experiencing temporary high demand. Please wait a few seconds and try clicking 'Launch AI Project Mentor' or selecting the starter idea again.";
      } else {
        errMsg = err.message || errMsg;
      }
      res.status(500).json({ error: errMsg });
    }
  });

  // Projects: Get Single Project Detail
  app.get("/api/projects/:id", authenticateToken, (req: any, res: any) => {
    try {
      const db = getDb();
      const project = db.projects.find((p) => p.id === req.params.id);

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      if (project.userId !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized access to this project" });
      }

      res.json(project);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to retrieve project" });
    }
  });

  // Projects: Delete Project
  app.delete("/api/projects/:id", authenticateToken, (req: any, res: any) => {
    try {
      const db = getDb();
      const index = db.projects.findIndex((p) => p.id === req.params.id);

      if (index === -1) {
        return res.status(404).json({ error: "Project not found" });
      }
      if (db.projects[index].userId !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized access" });
      }

      db.projects.splice(index, 1);
      saveDb(db);
      res.json({ success: true, message: "Project deleted successfully" });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to delete project" });
    }
  });

  // Projects: Complete Current Step
  app.post("/api/projects/:id/step-complete", authenticateToken, (req: any, res: any) => {
    try {
      const db = getDb();
      const project = db.projects.find((p) => p.id === req.params.id);

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      if (project.userId !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized access" });
      }

      const activeStepIndex = project.currentStep;
      if (project.steps[activeStepIndex]) {
        project.steps[activeStepIndex].completed = true;
      }

      // Progress step pointer
      if (project.currentStep < project.steps.length - 1) {
        project.currentStep += 1;
        // Post a friendly notification in chat from mentor
        const nextStep = project.steps[project.currentStep];
        project.chatHistory.push({
          role: "model",
          parts: [
            {
              text: `Fantastic job completing Step ${activeStepIndex + 1}! Let's advance to **Step ${
                project.currentStep + 1
              }**: **${nextStep.objective}**. I am here to help you through it.`,
            },
          ],
        });
      } else {
        project.completed = true;
        project.chatHistory.push({
          role: "model",
          parts: [
            {
              text: `🎉 **Congratulations, ${req.user.name}!** You have successfully completed all the steps and finalized your "${project.title}" project! You can now generate your comprehensive Project Report. Great work!`,
            },
          ],
        });
      }

      saveDb(db);
      res.json(project);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to complete step" });
    }
  });

  // Projects: Chat with Project Mentor
  app.post("/api/projects/:id/chat", authenticateToken, async (req: any, res: any) => {
    try {
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message content is required" });
      }

      const db = getDb();
      const project = db.projects.find((p) => p.id === req.params.id);

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      if (project.userId !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized access" });
      }

      const activeStep = project.steps[project.currentStep] || {};

      // Send to Gemini
      const aiResponseText = await chatWithMentor(
        project.title,
        activeStep,
        project.chatHistory,
        message
      );

      // Save user and AI responses to persistent history
      project.chatHistory.push({
        role: "user",
        parts: [{ text: message }],
      });
      project.chatHistory.push({
        role: "model",
        parts: [{ text: aiResponseText }],
      });

      saveDb(db);
      res.json({ text: aiResponseText, chatHistory: project.chatHistory });
    } catch (err: any) {
      console.error("Chat error:", err);
      let errMsg = "AI Mentor is temporarily offline";
      const errStr = String(err?.message || err);
      if (
        errStr.includes("503") ||
        errStr.includes("UNAVAILABLE") ||
        errStr.includes("high demand") ||
        errStr.includes("overloaded")
      ) {
        errMsg =
          "The AI Mentor is currently experiencing high demand. Please wait a moment and try sending your question again.";
      } else {
        errMsg = err.message || errMsg;
      }
      res.status(500).json({ error: errMsg });
    }
  });

  // Projects: Analyze image for the current step
  app.post("/api/projects/:id/analyze-image", authenticateToken, async (req: any, res: any) => {
    try {
      const { base64Image, mimeType } = req.body;
      if (!base64Image) {
        return res.status(400).json({ error: "Base64 image data is required" });
      }

      const db = getDb();
      const project = db.projects.find((p) => p.id === req.params.id);

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      if (project.userId !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized access" });
      }

      const activeStep = project.steps[project.currentStep] || {};

      // Strip potential base64 mime header (e.g. "data:image/jpeg;base64,") if exists
      const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");

      // Send to Gemini image analyzer
      const feedback = await analyzeImageCircuit(cleanBase64, mimeType || "image/jpeg", activeStep);

      // Record image upload history
      project.uploadedImages.push({
        url: `data:${mimeType || "image/jpeg"};base64,${cleanBase64.substring(0, 50)}... [base64]`,
        analyzedAt: new Date().toISOString(),
        feedback: feedback,
      });

      // Update current step's verification status
      if (project.steps[project.currentStep]) {
        project.steps[project.currentStep].verified = true;
        project.steps[project.currentStep].verificationFeedback = feedback;
        project.steps[project.currentStep].imageUrl = `data:${mimeType || "image/jpeg"};base64,${cleanBase64}`;
      }

      // Add as part of mentor chat as well to make experience cohesive
      project.chatHistory.push({
        role: "user",
        parts: [{ text: "[Uploaded a project photo for verification]" }],
      });
      project.chatHistory.push({
        role: "model",
        parts: [
          {
            text: `📸 **Visual Circuit Diagnosis Complete**\n\nHere is my analysis of your wiring/assembly:\n\n${feedback}`,
          },
        ],
      });

      saveDb(db);
      res.json({ feedback, project });
    } catch (err: any) {
      console.error("Image analysis error:", err);
      let errMsg = "Failed to analyze image";
      const errStr = String(err?.message || err);
      if (
        errStr.includes("503") ||
        errStr.includes("UNAVAILABLE") ||
        errStr.includes("high demand") ||
        errStr.includes("overloaded")
      ) {
        errMsg =
          "The visual diagnostic engine is temporarily overloaded. Please wait a moment and try re-uploading/diagnosing your assembly photo.";
      } else {
        errMsg = err.message || errMsg;
      }
      res.status(500).json({ error: errMsg });
    }
  });

  // Video recommendations
  app.get("/api/projects/:id/videos", authenticateToken, async (req: any, res: any) => {
    try {
      const db = getDb();
      const project = db.projects.find((p) => p.id === req.params.id);

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      const activeStep = project.steps[project.currentStep] || { objective: "Overview" };

      // We'll return 3 highly specific custom educational recommendations suited for their exact step!
      const recommendations = [
        {
          title: `How to Wire Components for ${project.title}`,
          description: `Excellent detailed guide for understanding pins, polarities, and basic breadboarding concepts relevant to ${project.title}.`,
          duration: "12:15",
          channel: "Maker DIY Corner",
          url: "https://www.youtube.com/results?search_query=" + encodeURIComponent(`${project.title} wiring tutorial`),
        },
        {
          title: `Troubleshooting Guide: Common Mistakes in ${activeStep.objective}`,
          description: `Crucial steps for debugging connections, checking with a multimeter, and avoiding short circuits during the ${activeStep.objective} phase.`,
          duration: "8:42",
          channel: "Electronics Mentor",
          url: "https://www.youtube.com/results?search_query=" + encodeURIComponent(`${project.title} ${activeStep.objective} troubleshooting`),
        },
        {
          title: `Intro to Embedded programming and code structure`,
          description: "A solid programming introduction for setting up development environments and writing clean firmware blocks.",
          duration: "15:30",
          channel: "Core Embedded",
          url: "https://www.youtube.com/results?search_query=" + encodeURIComponent(`Arduino ESP32 Raspberry Pi programming tutorial`),
        },
      ];

      res.json(recommendations);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to load video recommendations" });
    }
  });

  // Vite middleware for development or Static Assets for Production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`DIY Genius AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical error starting server:", err);
});
