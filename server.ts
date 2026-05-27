import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

// Load firebase-applet-config.json into process.env if missing
const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
if (fs.existsSync(firebaseConfigPath)) {
  try {
    const config = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf-8"));
    const mapping = {
      apiKey: "VITE_FIREBASE_API_KEY",
      authDomain: "VITE_FIREBASE_AUTH_DOMAIN",
      projectId: "VITE_FIREBASE_PROJECT_ID",
      storageBucket: "VITE_FIREBASE_STORAGE_BUCKET",
      messagingSenderId: "VITE_FIREBASE_MESSAGING_SENDER_ID",
      appId: "VITE_FIREBASE_APP_ID",
      firestoreDatabaseId: "VITE_FIREBASE_DATABASE_ID",
    };
    Object.entries(mapping).forEach(([configKey, envKey]) => {
      if (!process.env[envKey] && config[configKey]) {
        process.env[envKey] = config[configKey];
      }
    });
  } catch (err) {
    console.error("Failed to load firebase-applet-config.json:", err);
  }
}

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY!,
  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/generate-quiz", async (req, res) => {
    try {
      const { subject, level, topic } = req.body;
      
      const prompt = `Gere um mini questionário inteligente (3 perguntas de múltipla escolha) em Português para validar se um estudante tem nível ${level} (1 a 5) na matéria ${subject} sobre o tópico: ${topic}. 
      Retorne APENAS um JSON no formato: { "questions": [{ "question": "", "options": ["", "", "", ""], "correctIndex": 0 }] }`;

      const interaction = await ai.interactions.create({
        model: "gemini-3.5-flash",
        input: prompt
      });

      const text = interaction.output_text || "";
      const cleanedJson = text.replace(/```json|```/g, "").trim();
      res.json(JSON.parse(cleanedJson));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to generate quiz" });
    }
  });

  // Vite middleware for development
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
