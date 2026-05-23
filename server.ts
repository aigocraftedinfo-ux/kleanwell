import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Initialize GoogleGenAI SDK safely
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
} else {
  console.warn("WARNING: GEMINI_API_KEY not found in environment variables. AI features will run in simulation mode.");
}

app.use(express.json());

// API endpoints FIRST
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", aiEnabled: !!ai });
});

// AI home diagnostic consult endpoint
app.post("/api/consult", async (req, res) => {
  const { prompt, bedrooms, bathrooms } = req.body;

  if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
    return res.status(400).json({ error: "Please describe your household situations or cleaning needs." });
  }

  // If Gemini API is not configured, fall back to a high-quality local analysis mock
  if (!ai) {
    console.log("No API key. Running fallback local rules engine.");
    const isHeavy = prompt.toLowerCase().includes("pet") || 
                    prompt.toLowerCase().includes("dog") || 
                    prompt.toLowerCase().includes("cat") || 
                    prompt.toLowerCase().includes("dirty") || 
                    prompt.toLowerCase().includes("month") || 
                    prompt.toLowerCase().includes("deep");
    
    const isMove = prompt.toLowerCase().includes("move") || 
                   prompt.toLowerCase().includes("tenant") || 
                   prompt.toLowerCase().includes("shift") || 
                   prompt.toLowerCase().includes("rent");

    const containsStain = prompt.toLowerCase().includes("stain") || 
                         prompt.toLowerCase().includes("sofa") || 
                         prompt.toLowerCase().includes("upholstery") || 
                         prompt.toLowerCase().includes("carpet");

    let recommendedServiceId = "regular-cleaning";
    let explanation = "Based on your description, a standard upkeep will preserve cleanliness and provide fresh mopping. We'll use our signature non-toxic chemicals.";
    let suggestedAddonIds: string[] = ["windows"];
    let suggestedFrequency = "bi-weekly";

    if (isMove) {
      recommendedServiceId = "move-in-out";
      explanation = "Since you are relocating or handling a rental handover, we highly recommend our Tenant Move-In/Out Reset package to guarantee security deposit returns. We clean deeply in high cracks, interior cabinets, and baseboards.";
      suggestedAddonIds = ["oven", "cabinets"];
      suggestedFrequency = "one-time";
    } else if (isHeavy) {
      recommendedServiceId = "deep-cleaning";
      explanation = "For homes with pets, allergies, or those that haven't received deep care within 3 months, our Premium Eco-Deep Cleaning is essential. It includes descaling, chimney cleaning, and dense sanitization.";
      suggestedAddonIds = ["fridge", "sanitization"];
      suggestedFrequency = "weekly";
    } else if (containsStain) {
      recommendedServiceId = "upholstery-revive";
      explanation = "Because you explicitly highlighted fabric allergens, pet dander, or upholstery concerns, our Sofa & Carpet Fabric Infusion is the ideal specialist service.";
      suggestedAddonIds = ["sanitization"];
      suggestedFrequency = "monthly";
    }

    return res.json({
      recommendedServiceId,
      explanation: `${explanation} (Note: Running in offline consultation mode)`,
      suggestedAddonIds,
      suggestedFrequency,
      whySafeForAsthma: "Our in-house bio-cleaning liquids are 100% plant-based, organic, and biodegradable. They contain no chlorine, formaldehyde, or volatile organic compounds (VOCs), making them completely safe for children, pets, and asthma sufferers."
    });
  }

  try {
    const geminiPrompt = `
      You are the Master Concierge and Cleaning Strategist at 'Kleanwell Care', a premier, elite home care agency in Bengaluru, India.
      Our core USP is that we are the *manufacturer* of our own 100% biodegradable, green, chemical-free, plant-based cleaning agents and tissue products.
      This provides absolute non-toxic safety for children, babies with sensitive skin, pets, and asthma sufferers while unlocking premium post-cleaning aromatherapy freshness.

      Analyze this premium customer's household description below and advise them on the perfect plan.
      
      CUSTOMER CARE DATA:
      - Household Details & Context: "${prompt}"
      - Selected Bedrooms: ${bedrooms || 2}
      - Selected Bathrooms: ${bathrooms || 2}

      Select the single best recommendedServiceId from this list based on their details:
      1. "deep-cleaning" (for dirty homes, first-time customers, seasonal, pets, kids, asthma, allergies, or heavy calcium)
      2. "regular-cleaning" (for simple upkeep, light dusting, basic mopping)
      3. "move-in-out" (for shifting, buying, empty properties, tenant handovers)
      4. "upholstery-revive" (primarily for sofas, carpets, fabric chairs, and dust mites removal)

      Return a professional JSON recommendation adhering to the requested schema. Ensure the tone is extremely polite, reassuring, luxury, and clear. Direct recommendations explaining which specific add-ons are brilliant.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: geminiPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedServiceId: {
              type: Type.STRING,
              description: "Must be exactly deep-cleaning, regular-cleaning, move-in-out, or upholstery-revive",
            },
            explanation: {
              type: Type.STRING,
              description: "High-end polite explanation of why this service matches their situation and why it fits Bengaluru lifestyles.",
            },
            suggestedAddonIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of addon IDs that match, chosen from: fridge, oven, windows, balcony, cabinets, sanitization.",
            },
            suggestedFrequency: {
              type: Type.STRING,
              description: "Must be exactly: one-time, weekly, bi-weekly, or monthly",
            },
            whySafeForAsthma: {
              type: Type.STRING,
              description: "Explanation of how Kleanwell's self-manufactured biodegradable chemicals are safe for children and health-conscious families.",
            }
          },
          required: ["recommendedServiceId", "explanation", "suggestedAddonIds", "suggestedFrequency", "whySafeForAsthma"],
        },
      },
    });

    const parsedData = JSON.parse(response.text || "{}");
    return res.json(parsedData);
  } catch (error: any) {
    console.error("Gemini API call failed:", error);
    return res.status(500).json({ error: "Failed to process AI recommendation. Please try configuring standard options manually!" });
  }
});

// Vite or Static files handling
async function init() {
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
    console.log(`Kleanwell Care fullstack server running on http://0.0.0.0:${PORT}`);
  });
}

init();
