import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { resolveUser, AuthRequest } from "./src/middleware/auth.ts";
import {
  getUserProfiles,
  upsertUserProfile,
  deleteUserProfile,
  getUserSchedule,
  upsertUserSchedule,
  getUserLogs,
  upsertUserLog,
} from "./src/db/profiles.ts";

dotenv.config();

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase limit for base64 file uploads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.static(path.join(process.cwd(), "public")));

  // --- Profile Management Routes (Cloud SQL) ---
  app.get("/api/profiles", resolveUser, async (req: AuthRequest, res) => {
    try {
      const userUid = req.userUid || 'default-user';
      const userProfiles = await getUserProfiles(userUid);
      res.json({ profiles: userProfiles });
    } catch (error: any) {
      console.error("Error fetching profiles:", error);
      res.status(500).json({ error: error.message || "Failed to fetch profiles" });
    }
  });

  app.post("/api/profiles", resolveUser, async (req: AuthRequest, res) => {
    try {
      const userUid = req.userUid || 'default-user';
      const profile = req.body;
      if (!profile || !profile.profileId || !profile.name) {
        return res.status(400).json({ error: "Missing profileId or name" });
      }
      await upsertUserProfile(userUid, profile);
      res.json({ success: true, profile });
    } catch (error: any) {
      console.error("Error saving profile:", error);
      res.status(500).json({ error: error.message || "Failed to save profile" });
    }
  });

  app.delete("/api/profiles/:profileId", resolveUser, async (req: AuthRequest, res) => {
    try {
      const userUid = req.userUid || 'default-user';
      const { profileId } = req.params;
      await deleteUserProfile(userUid, profileId);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting profile:", error);
      res.status(500).json({ error: error.message || "Failed to delete profile" });
    }
  });

  // --- Individual Custom Schedule Routes (Cloud SQL) ---
  app.get("/api/schedule", resolveUser, async (req: AuthRequest, res) => {
    try {
      const userUid = req.userUid || 'default-user';
      const profileId = (req.query.profileId as string) || 'default';
      const schedule = await getUserSchedule(userUid, profileId);
      res.json({ schedule });
    } catch (error: any) {
      console.error("Error fetching schedule:", error);
      res.status(500).json({ error: error.message || "Failed to fetch schedule" });
    }
  });

  app.post("/api/schedule", resolveUser, async (req: AuthRequest, res) => {
    try {
      const userUid = req.userUid || 'default-user';
      const { profileId, schedule } = req.body;
      if (!schedule || !Array.isArray(schedule)) {
        return res.status(400).json({ error: "Schedule array is required" });
      }
      await upsertUserSchedule(userUid, profileId || 'default', schedule);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error saving schedule:", error);
      res.status(500).json({ error: error.message || "Failed to save schedule" });
    }
  });

  // --- Logs & Tracking Routes (Cloud SQL) ---
  app.get("/api/logs", resolveUser, async (req: AuthRequest, res) => {
    try {
      const userUid = req.userUid || 'default-user';
      const profileId = (req.query.profileId as string) || 'default';
      const rows = await getUserLogs(userUid, profileId);
      res.json({ logs: rows });
    } catch (error: any) {
      console.error("Error fetching logs:", error);
      res.status(500).json({ error: error.message || "Failed to fetch logs" });
    }
  });

  app.post("/api/logs", resolveUser, async (req: AuthRequest, res) => {
    try {
      const userUid = req.userUid || 'default-user';
      const { profileId, date, historyJson, subjectiveJson, hydration } = req.body;
      if (!date) {
        return res.status(400).json({ error: "Date is required" });
      }
      await upsertUserLog(userUid, profileId || 'default', date, historyJson, subjectiveJson, hydration);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error saving log:", error);
      res.status(500).json({ error: error.message || "Failed to save log" });
    }
  });

  // --- Export Routes (ZIP for ChatGPT & Codebase) ---
  app.get("/api/export/codebase", (req, res) => {
    const zipPath = path.join(process.cwd(), "public", "vitality-codebase.zip");
    if (fs.existsSync(zipPath)) {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Content-Disposition", 'attachment; filename="vitality-codebase.zip"');
      res.setHeader("Content-Type", "application/zip");
      return res.sendFile(zipPath);
    }
    res.status(404).json({ error: "Codebase archive not found" });
  });

  app.get("/api/export/chatgpt-packet", (req, res) => {
    const packetPath = path.join(process.cwd(), "public", "vitality-chatgpt-packet.zip");
    if (fs.existsSync(packetPath)) {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Content-Disposition", 'attachment; filename="vitality-chatgpt-packet.zip"');
      res.setHeader("Content-Type", "application/zip");
      return res.sendFile(packetPath);
    }
    res.status(404).json({ error: "ChatGPT packet archive not found" });
  });

  // --- AI Document Analysis ---
  app.post("/api/analyze-health", async (req, res) => {
    try {
      const { fileName, fileType, fileData, fileContext } = req.body;
      
      if (!fileData) {
        return res.status(400).json({ error: "No file data provided." });
      }

      // Extract base64 part
      const base64Data = fileData.split(',')[1] || fileData;

      const prompt = `
        You are a highly capable health analysis assistant. The user has uploaded a health document (blood test, DNA data, etc.).
        File name: ${fileName || 'Unknown'}
        Additional context from user: ${fileContext || 'None'}
        
        Analyze this document to provide insights specifically related to vitamin supplementation and dietary habits.
        Identify any deficiencies, surpluses, or specific markers that suggest adding or stopping certain vitamins.
        Be objective and clear. Make sure to provide actionable recommendations.
        Always include a disclaimer that you are an AI and they should consult their healthcare provider.
      `;

      let response;
      let retries = 6;
      let delay = 2000;
      
      while (retries > 0) {
        try {
          response = await ai.models.generateContent({
            model: "gemini-3.1-pro-preview",
            contents: {
              parts: [
                {
                  inlineData: {
                    mimeType: fileType || "application/pdf",
                    data: base64Data
                  }
                },
                {
                  text: prompt
                }
              ]
            },
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  summary: {
                    type: Type.STRING,
                    description: "A high-level summary of the analysis findings."
                  },
                  recommendations: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        action: { type: Type.STRING, description: "e.g., 'Add', 'Stop', 'Monitor', 'Maintain'" },
                        supplement: { type: Type.STRING, description: "The name of the vitamin or supplement" },
                        reason: { type: Type.STRING, description: "Why this action is recommended based on the data" }
                      }
                    },
                    description: "Specific recommendations for vitamins and supplements."
                  },
                  keyMarkers: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        markerName: { type: Type.STRING },
                        status: { type: Type.STRING, description: "e.g., 'Low', 'Optimal', 'High'" },
                        value: { type: Type.STRING }
                      }
                    },
                    description: "Key biomarker levels identified in the document."
                  },
                  disclaimer: {
                    type: Type.STRING,
                    description: "Medical disclaimer"
                  }
                },
                required: ["summary", "recommendations", "keyMarkers", "disclaimer"]
              }
            }
          });
          break; // success
        } catch (error: any) {
          console.error(`Gemini API error (retries left: ${retries - 1}):`, error.message);
          retries--;
          if (retries === 0) throw error;
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // exponential backoff
        }
      }

      if (!response) {
        throw new Error("Failed to get response from Gemini after retries");
      }

      const resultText = response.text;
      if (!resultText) {
         throw new Error("No response text from Gemini");
      }
      
      const parsedResult = JSON.parse(resultText);
      res.json(parsedResult);
    } catch (error: any) {
      console.error("Error analyzing health data:", error);
      res.status(500).json({ error: error.message || "Failed to analyze document." });
    }
  });

  // --- AI Supplement Advisor (Personalized) ---
  app.post("/api/evaluate-supplement", async (req, res) => {
    try {
      const { supplementName, currentSchedule, personalProfile } = req.body;
      
      const profileContext = personalProfile ? `
        INDIVIDUAL'S PERSONAL PROFILE:
        - Name: ${personalProfile.name || 'User'}
        - Age: ${personalProfile.age || 'Not specified'}, Gender: ${personalProfile.gender || 'Not specified'}
        - Weight: ${personalProfile.weight || 'Not specified'}, Height: ${personalProfile.height || 'Not specified'}
        - Diet: ${personalProfile.dietaryPreference || 'Standard'}
        - Health & Longevity Goals: ${(personalProfile.healthGoals || []).join(', ') || 'General health'}
        - Health Conditions / Allergies / Genetic Sensitivities: ${(personalProfile.healthConditions || []).join(', ') || 'None stated'}
        - Sleep / Routine: Wake ${personalProfile.wakeTime || '07:00'}, Sleep ${personalProfile.bedTime || '23:00'}
        - Notes: ${personalProfile.notes || 'None'}
      ` : 'No personal profile provided.';

      const prompt = `
        The user wants to add a new supplement/vitamin: "${supplementName}".
        Analyze if this is a good idea to add to their current daily protocol and specifically tailor your analysis to their personal health profile.
        
        ${profileContext}
        
        Current schedule: ${JSON.stringify(currentSchedule)}
        
        Is it safe and beneficial for this specific individual? Are there any negative interactions with what they are already taking or their stated conditions/allergies/sensitivities?
        If it's recommended, what is the best block to take it in? The blocks are: "waking", "breakfast", "lunch", "dinner", "bedtime", or custom blocks.
        Consider absorption (fat soluble vs water soluble) and potential energy/sleep effects (e.g. don't put stimulants at bedtime).
        
        Return JSON matching this schema:
        {
          "isRecommended": boolean,
          "reason": "String explaining the why, interactions, or benefits tailored to this individual",
          "suggestedBlockId": "string - e.g. 'waking', 'breakfast', 'lunch', 'dinner', 'bedtime' (or null if not recommended)",
          "dosage": "Suggested safe dosage string, e.g. '500mg' (or null)",
          "notes": "Any additional warnings like 'Take with food' or allergy precautions",
          "benefits": "Short explanation of what it will do to change this person's body for the better",
          "pairings": "What to recommend to pair with it to make it work better",
          "foodSources": "Other suggestions of what to take or what to eat for food"
        }
      `;

      let response;
      let retries = 6;
      let delay = 2000;
      
      while (retries > 0) {
        try {
          response = await ai.models.generateContent({
            model: "gemini-3.1-pro-preview",
            contents: { parts: [{ text: prompt }] },
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  isRecommended: { type: Type.BOOLEAN },
                  reason: { type: Type.STRING },
                  suggestedBlockId: { type: Type.STRING, nullable: true },
                  dosage: { type: Type.STRING, nullable: true },
                  notes: { type: Type.STRING },
                  benefits: { type: Type.STRING },
                  pairings: { type: Type.STRING },
                  foodSources: { type: Type.STRING }
                },
                required: ["isRecommended", "reason", "notes", "benefits", "pairings", "foodSources"]
              }
            }
          });
          break; // success
        } catch (error: any) {
          console.error(`Gemini API error (retries left: ${retries - 1}):`, error.message);
          retries--;
          if (retries === 0) throw error;
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
        }
      }

      if (!response) {
        throw new Error("Failed to get response from Gemini after retries");
      }

      const resultText = response.text;
      if (!resultText) {
         throw new Error("No response text from Gemini");
      }
      
      res.json(JSON.parse(resultText));
    } catch (error: any) {
      console.error("Error evaluating supplement:", error);
      res.status(500).json({ error: error.message || "Failed to evaluate supplement." });
    }
  });

  // --- AI Stack Evaluator (Personalized) ---
  app.post("/api/evaluate-stack", async (req, res) => {
    try {
      const { schedule, personalProfile } = req.body;
      
      const profileContext = personalProfile ? `
        INDIVIDUAL'S BIOLOGICAL & PERSONAL PROFILE:
        - Individual Name: ${personalProfile.name || 'User'}
        - Age: ${personalProfile.age || 'Not specified'}, Biological Sex / Gender: ${personalProfile.gender || 'Not specified'}
        - Weight: ${personalProfile.weight || 'Not specified'}, Height: ${personalProfile.height || 'Not specified'}
        - Dietary Pattern: ${personalProfile.dietaryPreference || 'Standard'}
        - Key Health & Longevity Goals: ${(personalProfile.healthGoals || []).join(', ') || 'Overall vitality'}
        - Health Conditions, Sensitivities & Genetics (e.g. MTHFR, Histamine, Caffeine, Stomach): ${(personalProfile.healthConditions || []).join(', ') || 'None specified'}
        - Sleep & Circadian Schedule: Wake up around ${personalProfile.wakeTime || '07:00'}, Sleep around ${personalProfile.bedTime || '23:00'}
        - Personal Health Context / Biohacker Notes: ${personalProfile.notes || 'None'}
      ` : 'No individual profile specified.';

      const prompt = `
        You are a top-tier functional medicine physician, clinical nutritionist, and longevity biochemist.
        Evaluate the provided daily supplement stack and schedule specifically tailored to this individual's personal information and biology.
        
        ${profileContext}

        Schedule Data: ${JSON.stringify(schedule)}
        
        Perform a comprehensive, clinical audit analyzing:
        1. Redundancies (overlapping compounds or exceeding safe upper intake levels for their age/weight/sex).
        2. Dangerous interactions, contraindications with their stated conditions/allergies/genetics (e.g., unmethylated folic acid with MTHFR, high-histamine precursors if histamine intolerant, heavy stimulants if sensitive, stomach irritants on empty stomach).
        3. Missing synergistic co-factors aligned with their specific stated goals (e.g., ATP/mitochondria, sleep, gut, methylation).
        4. Recommend top-tier, clinically backed, third-party tested brands (e.g., Thorne, Pure Encapsulations, Quicksilver Scientific, Life Extension, Seeking Health) for the major supplements in their stack, explaining WHY those brands are superior based on purity, bioavailability, and third-party testing.
        5. SPACING AND TIMING: Be extremely deliberate with what to take together and what time to take everything, calibrated to their wake/bed hours and digestion. Do NOT just stack everything into "Breakfast", "Lunch", and "Dinner" if it's smarter to space some of it out. Create new timing blocks (e.g., "Upon Waking", "Mid-Morning", "Pre-Workout", "Afternoon", "Bedtime") if it optimizes absorption and avoids competition.
        
        Return a highly optimized "recommendedSchedule" that completely reorganizes their supplements into the smartest possible timing blocks, including suggested exact "mealTime" (e.g., "10:30", 24-hour format) and "prepTimeMinutes" for each block. Keep all the original properties of the supplements, just move them to the optimal blocks.
      `;

      let response;
      let retries = 6;
      let delay = 2000;
      
      while (retries > 0) {
        try {
          response = await ai.models.generateContent({
            model: "gemini-3.1-pro-preview",
            contents: { parts: [{ text: prompt }] },
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  overallScore: { type: Type.INTEGER, description: "Score out of 100 for the stack's quality, synergy, and alignment with the individual's profile" },
                  overallAssessment: { type: Type.STRING, description: "A detailed paragraph evaluating the stack specifically in the context of this individual's health profile" },
                  warnings: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "Any timing issues, interactions, contraindications, or missing elements"
                  },
                  brandRecommendations: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        supplementName: { type: Type.STRING },
                        brands: { type: Type.ARRAY, items: { type: Type.STRING } },
                        reasoning: { type: Type.STRING }
                      },
                      required: ["supplementName", "brands", "reasoning"]
                    }
                  },
                  recommendedSchedule: {
                    type: Type.ARRAY,
                    description: "The reorganized schedule blocks with optimized timing.",
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        title: { type: Type.STRING },
                        iconName: { type: Type.STRING },
                        timeOfDay: { type: Type.STRING },
                        instructions: { type: Type.STRING },
                        mealSuggestion: { type: Type.STRING },
                        fastingNote: { type: Type.STRING },
                        mealTime: { type: Type.STRING, description: "Time to eat/take, e.g. 08:30" },
                        prepTimeMinutes: { type: Type.INTEGER },
                        items: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              id: { type: Type.STRING },
                              name: { type: Type.STRING },
                              dosage: { type: Type.STRING },
                              notes: { type: Type.STRING },
                              isCrucial: { type: Type.BOOLEAN },
                              benefits: { type: Type.STRING },
                              pairings: { type: Type.STRING },
                              foodSources: { type: Type.STRING }
                            },
                            required: ["id", "name", "dosage"]
                          }
                        }
                      },
                      required: ["id", "title", "iconName", "timeOfDay", "items"]
                    }
                  }
                },
                required: ["overallScore", "overallAssessment", "warnings", "brandRecommendations", "recommendedSchedule"]
              }
            }
          });
          break;
        } catch (error: any) {
          console.error(`Gemini API error (retries left: ${retries - 1}):`, error.message);
          retries--;
          if (retries === 0) throw error;
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
        }
      }

      if (!response) {
        throw new Error("Failed to get response from Gemini after retries");
      }

      const resultText = response.text;
      if (!resultText) {
         throw new Error("No response text from Gemini");
      }
      
      res.json(JSON.parse(resultText));
    } catch (error: any) {
      console.error("Error evaluating stack:", error);
      res.status(500).json({ error: error.message || "Failed to evaluate stack." });
    }
  });

  app.post("/api/generate-weekly-report", async (req, res) => {
    try {
      const { vitaminData, subjectiveData, personalProfile } = req.body;
      
      const profileContext = personalProfile ? `Individual: ${personalProfile.name}, Goals: ${(personalProfile.healthGoals || []).join(', ')}` : '';

      const prompt = `
        You are an expert AI health and habit analyst.
        Analyze the user's past 7 days of vitamin adherence and subjective wellness logs (mood, energy, sleep on a 1-5 scale).
        ${profileContext}
        
        Vitamin Adherence Data: ${JSON.stringify(vitaminData)}
        Subjective Wellness Data: ${JSON.stringify(subjectiveData)}
        
        Provide a concise, highly actionable "Weekly Insight Report". 
        Find meaningful correlations between their supplement habits and their subjective wellness scores.
        Highlight what they are doing well and areas for improvement.
      `;

      let response;
      let retries = 6;
      let delay = 2000;
      
      while (retries > 0) {
        try {
          response = await ai.models.generateContent({
            model: "gemini-3.1-pro-preview",
            contents: {
              parts: [{ text: prompt }]
            },
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  summary: {
                    type: Type.STRING,
                    description: "A 2-3 sentence overview of the past week's performance and correlations."
                  },
                  highlights: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "1-3 bullet points of what went well (e.g., 'High energy correlated with taking B-Complex')."
                  },
                  improvements: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "1-2 areas to focus on for next week."
                  },
                  actionableAdvice: {
                    type: Type.STRING,
                    description: "One clear, actionable piece of advice for the user based on the data."
                  }
                },
                required: ["summary", "highlights", "improvements", "actionableAdvice"]
              }
            }
          });
          break; // success
        } catch (error: any) {
          console.error(`Gemini API error (retries left: ${retries - 1}):`, error.message);
          retries--;
          if (retries === 0) throw error;
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
        }
      }

      if (!response) {
        throw new Error("Failed to get response from Gemini after retries");
      }

      const resultText = response.text;
      if (!resultText) {
         throw new Error("No response text from Gemini");
      }
      
      res.json(JSON.parse(resultText));
    } catch (error: any) {
      console.error("Error generating report:", error);
      res.status(500).json({ error: error.message || "Failed to generate report." });
    }
  });

  // --- Health Chat Bot with Search Grounding & Stack Context ---
  app.post("/api/health-chat", async (req, res) => {
    try {
      const { messages, currentSchedule, personalProfile } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "Messages array is required." });
      }

      const profileContext = personalProfile ? `
INDIVIDUAL'S BIOLOGICAL & HEALTH PROFILE:
- Name: ${personalProfile.name || 'User'}
- Age: ${personalProfile.age ?? 'Not specified'}, Biological Sex: ${personalProfile.gender || 'Not specified'}
- Dietary Pattern: ${personalProfile.dietaryPreference || 'Standard'}
- Health & Longevity Goals: ${(personalProfile.healthGoals || []).join(', ') || 'Overall wellness'}
- Known Conditions, Sensitivities & Genetics: ${(personalProfile.healthConditions || []).join(', ') || 'None specified'}
- Daily Sleep/Wake Schedule: Wake around ${personalProfile.wakeTime || '07:00'}, Sleep around ${personalProfile.bedTime || '22:30'}
- Personal Notes: ${personalProfile.notes || 'None'}
` : 'No individual profile specified.';

      const scheduleContext = currentSchedule && Array.isArray(currentSchedule) && currentSchedule.length > 0
        ? `\nCURRENT VITAMIN STACK & SCHEDULE:\n${JSON.stringify(currentSchedule, null, 2)}`
        : '\nCURRENT VITAMIN STACK: Empty / No supplements scheduled yet.';

      const systemInstruction = `
You are Vitality AI, an elite functional medicine clinical nutritionist, medical pharmacologist, and longevity consultant.
You specialize in giving clear, scientifically sound, actionable advice on:
1. BEST WAYS TO TAKE VITAMINS:
   - Bioavailability, stomach conditions, and optimal co-factors (e.g., fat-soluble vitamins A, D3, E, K2 require dietary lipids; Zinc, Iron, and acidic supplements need food buffers to prevent nausea; water-soluble B & C; amino acids like Creatine/Amino acids can be taken on empty stomach).
   - Circadian timing (e.g., energizing compounds like B-complex, CoQ10, Cordyceps in the morning; calming neurotransmitter modulators like Magnesium Glycinate, L-Theanine, Apigenin, and Ashwagandha in the evening).
2. WHAT NOT TO TAKE TOGETHER (DANGEROUS & COMPETING INTERACTIONS):
   - Competing mineral absorption (e.g., Calcium competes directly with Iron, Magnesium, and Zinc for the DMT-1 transporter - keep them spaced 2-4 hours apart).
   - Zinc and Copper balance (high doses of Zinc deplete Copper - don't take simultaneously in high doses).
   - Fat-soluble vs. binding agents (e.g., activated charcoal, bentonite clay, cholestyramine, or high psyllium fiber binding to vitamins).
   - Stimulants vs. calming agents.
   - Specific contraindications with medical conditions, genetics (like MTHFR C677T/A1298C needing methylfolate/methylcobalamin instead of synthetic folic acid; slow COMT needing cautious methyl donors; histamine intolerance needing DAO and avoiding histamine liberators).
3. PERSONALIZATION:
${profileContext}
${scheduleContext}

GUIDELINES:
- Directly answer the user's questions about what to take together and what NOT to take together.
- When the user asks about their stack, reference their actual scheduled vitamins and timing blocks.
- Format responses cleanly with bold headings, concise bullet points, and practical "When to take" / "Do not take with" rules.
- Ground advice in clinical evidence and current scientific research.
- Always include helpful, reassuring guidance with dignity.
`;

      const contents = messages.map(m => ({
        role: m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      let response;
      let retries = 5;
      let delay = 1500;

      while (retries > 0) {
        try {
          response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents,
            config: {
              systemInstruction,
              tools: [{ googleSearch: {} }],
            }
          });
          break;
        } catch (error: any) {
          console.error(`Gemini Chat API error (retries left: ${retries - 1}):`, error.message);
          retries--;
          if (retries === 0) throw error;
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
        }
      }

      if (!response) {
        throw new Error("Failed to get response from Gemini Chat after retries");
      }

      const text = response.text || '';
      const sources: Array<{ title: string; uri: string }> = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks && Array.isArray(chunks)) {
        for (const chunk of chunks) {
          if (chunk.web?.uri) {
            sources.push({
              title: chunk.web.title || new URL(chunk.web.uri).hostname,
              uri: chunk.web.uri,
            });
          }
        }
      }

      res.json({ text, sources });
    } catch (error: any) {
      console.error("Error in health chat:", error);
      res.status(500).json({ error: error.message || "Failed to process chat message." });
    }
  });

  // Vite middleware for development (HMR disabled per AI Studio environment constraints)
  if (process.env.NODE_ENV !== "production") {
    process.env.DISABLE_HMR = "true";
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
