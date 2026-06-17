import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client Lazily/Safely so it doesn't crash if key is loaded later
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY is not set in environment variables. Running in mock fallback mode.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. Health & Config endpoint
app.get("/api/config", (req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY;
  res.json({
    status: "ok",
    hasApiKey: hasKey,
    environment: process.env.NODE_ENV || "development"
  });
});

// Helper for Mock Responses in case API key is missing
function generateMockResponse(endpoint: string, payload: any): any {
  console.log(`[MOCK RESPONSE] Key missing. Serving mock data for: ${endpoint}`);
  if (endpoint === "chat") {
    return {
      text: "Hello! I am Sarah, your AI Career Success Coach. (Note: Since GEMINI_API_KEY is not set in your Secrets panel, I am operating in offline simulated mode). Let's work on your plan! What is your primary career target right now?"
    };
  }
  if (endpoint === "generate-plan") {
    return {
      title: `${payload.targetGoal || 'Career Advancement'} Blueprint`,
      category: "Transition Strategy",
      description: "A fast-track milestone roadmap to target key growth vectors.",
      skills: ["Strategic Communication", "Technical Portfolio Execution", "Analytical Problem-Solving"],
      milestones: [
        {
          id: "m-1",
          title: "Gap Audit & Profile Optimization",
          duration: "1-2 Weeks",
          checklist: [
            "Audit your personal portfolio files against current market job postings.",
            "Schedule a target discovery checkpoint to scope modern industry frameworks.",
            "Refine LinkedIn headline and profile summary focus points."
          ],
          inspiration: "A solid audit is fifty percent of the execution strategy. Know your path clearly!"
        },
        {
          id: "m-2",
          title: "Portfolio Development & Practice",
          duration: "2-4 Weeks",
          checklist: [
            "Build 2 high-impact functional case studies detailing direct business metrics.",
            "Practice live storytelling articulating challenge, action, and final resolution metrics."
          ],
          inspiration: "Your projects are your credentials. Speak in numbers and concrete results."
        }
      ]
    };
  }
  if (endpoint === "analyze-resume") {
    return {
      overallScore: 68,
      strengths: [
        "Strong structural clarity",
        "Clear professional experience timeline"
      ],
      criticalGaps: [
        "Lacks measurable business metrics in descriptions",
        "Needs focus on modern industry tech-stacks"
      ],
      keywordGaps: ["KPIs", "Cloud Deployments", "Cross-functional Collaboration", "System Architecture"],
      actionableRevisions: [
        {
          originalText: "Managed software applications and helped team members with tasks.",
          suggestedText: "Spearheaded modular developer workspaces that optimized container cold start rates by 35% with Cross-functional developers.",
          reasoning: "Swapping passive tasks for proactive actions with metrics makes a profound visual feedback difference."
        },
        {
          originalText: "Responsible for writing and keeping clean system documents.",
          suggestedText: "Authored 12+ technical design logs (TDLs) detailing target cloud migrations, shortening product onboarding from 12 days to 3 days.",
          reasoning: "Articulates real leadership and quantifiable onboarding efficiency."
        }
      ]
    };
  }
  if (endpoint === "interview") {
    return {
      evaluation: "Your answer shows strong logical structure, though it could benefit from more quantitative metrics.",
      score: 7,
      proTips: [
        "Incorporate a percentage or efficiency ratio into your final success metrics.",
        "Acknowledge how your peers helped coordinate and refine the final build to show teamwork."
      ],
      nextQuestion: "Can you walk me through a complex technical challenge where you faced a blocking team dependency, and how you navigated it to meet the milestone?"
    };
  }
  return { error: "Action not supported in simulated mode." };
}

// 2. Sarah AI Career Coach Chat Route
app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid messages array." });
  }

  // If key is missing, return mock response gracefully
  if (!process.env.GEMINI_API_KEY) {
    return res.json(generateMockResponse("chat", null));
  }

  try {
    const ai = getGenAI();
    
    // Convert format for gemini contents
    // Sarah is the Coach next to the man in the photo: warm, attentive, encouraging, and progress-focused.
    const systemInstruction = 
      "You are Coach Sarah, a world-class professional career & success coach (modeled as the friendly, articulate woman in blue next to her coachee from our office mentoring scene). " +
      "Your attitude is supportive, encouraging, sharp, and results-oriented. You convey a high feeling of progress, optimism, and concrete planning. " +
      "Help the user establish short-term milestones, design resumes, practice mock interviews, and refine their professional storytelling. " +
      "Always suggest 1 or 2 small, actionable bullet tasks they can check off right away on their momentum tracker. Keep your responses concise (under 250 words) and nicely formatted in simple Markdown.";

    // Take the last few messages for efficiency
    const chatContents = messages.map(msg => ({
      role: msg.role === "assistant" ? "model" as const : "user" as const,
      parts: [{ text: msg.content }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: chatContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ text: response.text || "I was unable to formulate a response. Let me try again." });
  } catch (err: any) {
    console.error("Gemini Chat API Error:", err);
    res.status(500).json({ error: err.message || "Failed to contact Gemini coaching engine." });
  }
});

// 3. Goal Plan Builder (Structured Schema Output)
app.post("/api/generate-plan", async (req, res) => {
  const { targetGoal, timeFrame, details } = req.body;
  if (!targetGoal) {
    return res.status(400).json({ error: "targetGoal is required." });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.json(generateMockResponse("generate-plan", { targetGoal }));
  }

  try {
    const ai = getGenAI();
    const prompt = `Generate a comprehensive professional plan titled: "${targetGoal}" to be achieved within "${timeFrame || '4 weeks'}". Additional details provided by the coachee: "${details || ''}". Provide a clear breakdown of milestones, required skills, and specific checklist tasks.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a professional strategist. Design a rigorous, hyper-focused checklist milestones roadmap that represents achievable career progress. Your output must strictly match the JSON schema.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: { type: Type.STRING },
            description: { type: Type.STRING },
            skills: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            milestones: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  checklist: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  inspiration: { type: Type.STRING }
                },
                required: ["id", "title", "duration", "checklist", "inspiration"]
              }
            }
          },
          required: ["title", "category", "description", "skills", "milestones"]
        }
      }
    });

    const parsedData = JSON.parse(response.text?.trim() || "{}");
    res.json(parsedData);
  } catch (err: any) {
    console.error("Gemini Plan Generation Error:", err);
    res.status(500).json({ error: err.message || "Failed to generate structured plan." });
  }
});

// 4. Resume critique endpoint
app.post("/api/analyze-resume", async (req, res) => {
  const { resumeText, targetRole } = req.body;
  if (!resumeText) {
    return res.status(400).json({ error: "resumeText is required." });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.json(generateMockResponse("analyze-resume", null));
  }

  try {
    const ai = getGenAI();
    const prompt = `Critique this resume for a target role of: "${targetRole || 'Modern Generalist'}"\n\n=== RESUME ===\n${resumeText}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an executive resume writer and recruiter. Evaluate the resume objectively. Highlight strengths, find critical metric-driven gaps, note missing industry keywords, and provide 2 highly specific examples of 'Before' and 'After' sentence revisions.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER, description: "A score from 0 to 100." },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            criticalGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
            keywordGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
            actionableRevisions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  originalText: { type: Type.STRING, description: "Unimpressive or metricless bullet" },
                  suggestedText: { type: Type.STRING, description: "Highly compelling bullet with metrics and strong active verbs" },
                  reasoning: { type: Type.STRING }
                },
                required: ["originalText", "suggestedText", "reasoning"]
              }
            }
          },
          required: ["overallScore", "strengths", "criticalGaps", "keywordGaps", "actionableRevisions"]
        }
      }
    });

    const parsedData = JSON.parse(response.text?.trim() || "{}");
    res.json(parsedData);
  } catch (err: any) {
    console.error("Gemini Resume Critique Error:", err);
    res.status(500).json({ error: err.message || "Failed to analyze resume." });
  }
});

// 5. Mock Interview endpoint
app.post("/api/interview", async (req, res) => {
  const { role, company, answerText, currentQuestion } = req.body;
  if (!role) {
    return res.status(400).json({ error: "role is required." });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.json(generateMockResponse("interview", null));
  }

  try {
    const ai = getGenAI();

    let systemContext = `You are Sarah, an expert technical and cultural interviewer at ${company || 'your target company'}. ` +
      `You are conducting a live, realistic mock interview for a coachee seeking a ${role} role. `;

    let prompt = "";
    if (!currentQuestion) {
      // Warm up question
      prompt = `Start the interview! Welcome the coachee warmly as Sarah (your progress coach), introduce the target company, and ask a strong opening question tailored for a ${role} role. At least keep it focused to test actual competencies.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemContext + "Generate a single warm introduction and the first interview question. Return it in JSON format.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              nextQuestion: { type: Type.STRING, description: "The warm onboarding and first question" }
            },
            required: ["nextQuestion"]
          }
        }
      });
      const parsedData = JSON.parse(response.text?.trim() || "{}");
      return res.json({
        evaluation: "Ready when you are! I am eager to hear your thoughts.",
        score: 10,
        proTips: ["Structure your responses using the STAR method: Situation, Task, Action, Result.", "Be concise and focus on your individual contributions in a team context."],
        nextQuestion: parsedData.nextQuestion
      });
    } else {
      // Evaluate actual answer
      prompt = `Analyze the candidate's answer below to your question: "${currentQuestion}"\nCandidate's response: "${answerText || ''}"`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemContext + "Provide an encouraging yet hyper-specific evaluation, a score out of 10 for the answered part, 2 clear actionable tips (proTips) to raise their level, and the next strategic interview question. Return it strictly in JSON.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              evaluation: { type: Type.STRING, description: "Your mentoring coach critique about their answer style, STAR mechanics, and content." },
              score: { type: Type.INTEGER, description: "Critical score out of 10" },
              proTips: { type: Type.ARRAY, items: { type: Type.STRING } },
              nextQuestion: { type: Type.STRING, description: "The next dynamic interview question in order to move the scenario forward." }
            },
            required: ["evaluation", "score", "proTips", "nextQuestion"]
          }
        }
      });

      const parsedData = JSON.parse(response.text?.trim() || "{}");
      res.json(parsedData);
    }
  } catch (err: any) {
    console.error("Gemini Mock Interview Error:", err);
    res.status(500).json({ error: err.message || "Failed to process interview session." });
  }
});

// ----------------------------------------------------
// VITE OR STATIC SERVER MIDDLEWARE
// ----------------------------------------------------
async function setupBuildOrVite() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite development middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving production static assets...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

setupBuildOrVite().catch((error) => {
  console.error("Error setting up application server:", error);
});
