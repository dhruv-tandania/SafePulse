import express from "express";
import { GoogleGenAI } from "@google/genai";

const router = express.Router();

// Heuristic fallback analyzer if Gemini API key is missing or encounters issues
function generateFallbackAssessment(situationText) {
  const text = situationText.toLowerCase();
  
  let riskLevel = "MODERATE";
  let riskScore = 55;
  const riskFactors = [];
  const immediateActions = [];
  const safetyPlan = [];

  // Keywords detection
  const isNight = text.includes("night") || text.includes("dark") || text.includes("pm") || text.includes("late") || text.includes("10:") || text.includes("11:") || text.includes("12:") || text.includes("midnight");
  const isAlone = text.includes("alone") || text.includes("solo") || text.includes("by myself");
  const isFollowed = text.includes("follow") || text.includes("following") || text.includes("behind me") || text.includes("stalk") || text.includes("creepy") || text.includes("suspicious");
  const isUnfamiliar = text.includes("unfamiliar") || text.includes("lost") || text.includes("new city") || text.includes("strange area");
  const isEnclosed = text.includes("cab") || text.includes("taxi") || text.includes("uber") || text.includes("car") || text.includes("elevator") || text.includes("room");

  if (isFollowed) {
    riskLevel = "HIGH";
    riskScore = 88;
    riskFactors.push("Active potential pursuer / suspicious individual in proximity");
    riskFactors.push("Reduced reaction window if cornered or isolated");
    immediateActions.push("Do not head home or to secluded areas; immediately cross the street toward open, well-lit businesses.");
    immediateActions.push("Enter any open store, restaurant, hotel lobby, or brightly lit public venue immediately.");
    immediateActions.push("Activate SafePulse Safety Mode countdown and prepare your live GPS location.");
    immediateActions.push("Keep emergency numbers (e.g., 911 / 112) ready on speed dial.");
    safetyPlan.push("Alert the staff or security guard at the nearest public establishment.");
    safetyPlan.push("Call a trusted family member or friend and speak loudly to signal you are in contact with someone.");
    safetyPlan.push("If actively threatened, dial emergency services immediately and do not engage in confrontation.");
  } else if (isNight && isAlone) {
    riskLevel = isUnfamiliar ? "HIGH" : "MODERATE";
    riskScore = isUnfamiliar ? 78 : 62;
    riskFactors.push("Low environmental visibility and fewer pedestrians / witnesses");
    riskFactors.push("Solo traveler vulnerability in unfamiliar or isolated surroundings");
    if (isUnfamiliar) riskFactors.push("Unfamiliar escape routes and local emergency resources");

    immediateActions.push("Stay on well-lit, main avenues with active vehicular or foot traffic.");
    immediateActions.push("Avoid wearing headphones or looking down at your screen while walking.");
    immediateActions.push("Keep your phone charged and easily accessible in your hand or outer pocket.");
    immediateActions.push("Share your live location with a trusted contact.");
    safetyPlan.push("Identify the nearest 24/7 business, transit hub, or open convenience store.");
    safetyPlan.push("Order a verified rideshare or taxi from an established, reputable service directly to a safe pickup point.");
    safetyPlan.push("Maintain a confident walking pace with situational awareness.");
  } else if (isEnclosed) {
    riskLevel = "MODERATE";
    riskScore = 65;
    riskFactors.push("Confined transit environment with limited immediate egress");
    riskFactors.push("Route deviation or driver behavior uncertainty");
    immediateActions.push("Check the map navigation on your own device to monitor current route progress.");
    immediateActions.push("Share ride details and live tracking link with a trusted contact.");
    immediateActions.push("Keep vehicle door unlock toggle within easy reach.");
    safetyPlan.push("If the vehicle deviates from the designated route, politely ask the driver to stop at a populated location.");
    safetyPlan.push("If feeling threatened, call emergency services or a trusted contact on speakerphone.");
  } else {
    riskLevel = "LOW";
    riskScore = 30;
    riskFactors.push("General situational awareness required in public spaces");
    immediateActions.push("Stay alert to your surroundings and keep your belongings secure.");
    immediateActions.push("Ensure your phone has sufficient battery and network reception.");
    safetyPlan.push("Plan your route ahead using primary well-traveled paths.");
    safetyPlan.push("Keep trusted emergency contacts updated on your general schedule.");
  }

  return {
    riskLevel,
    riskScore,
    summary: `Situation assessed as ${riskLevel} risk based on current environmental factors, isolation level, and time.`,
    riskFactors: riskFactors.length > 0 ? riskFactors : ["General vulnerability in public environment"],
    immediateActions: immediateActions.length > 0 ? immediateActions : ["Stay aware of surroundings and head toward well-lit public areas."],
    safetyPlan: safetyPlan.length > 0 ? safetyPlan : ["Plan your path along active roads and keep emergency contacts informed."],
    isFallback: true
  };
}

router.post("/", async (req, res) => {
  try {
    const { situation } = req.body;

    if (!situation || typeof situation !== "string" || situation.trim().length < 3) {
      return res.status(400).json({
        error: "Please provide a valid description of your current situation (minimum 3 characters)."
      });
    }

    const trimmedSituation = situation.trim();
    const apiKey = process.env.GEMINI_API_KEY;

    // If API key is not configured or is default placeholder, use heuristic analyzer
    if (!apiKey || apiKey === "your_gemini_api_key_here" || apiKey.trim() === "") {
      console.log("[SafePulse Backend] GEMINI_API_KEY not set. Using smart fallback assessment.");
      const fallbackResult = generateFallbackAssessment(trimmedSituation);
      return res.json({
        success: true,
        data: fallbackResult,
        source: "fallback_engine",
        disclaimer: "SafePulse AI guidance is informational and does not replace official emergency services."
      });
    }

    // Call Gemini API using @google/genai SDK
    try {
      const client = new GoogleGenAI({ apiKey });

      const prompt = `You are SafePulse, an emergency personal safety AI expert.
Analyze the user's situation and provide actionable, calm, and protective safety guidance.

CRITICAL SAFETY RULES:
1. Prioritize non-confrontational safety: moving to populated, well-lit, open public places (hotels, stores, restaurants).
2. Never suggest escalating violence or physical confrontation unless strictly necessary for immediate self-defense.
3. Advise contacting emergency services (e.g. 911 / 112) or trusted friends when risk is Moderate or High.
4. Output MUST be ONLY valid JSON adhering strictly to the schema below.

JSON SCHEMA:
{
  "riskLevel": "LOW" | "MODERATE" | "HIGH",
  "riskScore": <integer from 1 to 100>,
  "summary": "<1-2 sentence high-level assessment of the risk>",
  "riskFactors": [
    "<specific identified hazard or environmental vulnerability 1>",
    "<specific hazard 2>"
  ],
  "immediateActions": [
    "<actionable step for the next 60 seconds 1>",
    "<actionable step 2>",
    "<actionable step 3>"
  ],
  "safetyPlan": [
    "<strategic step 1>",
    "<strategic step 2>",
    "<strategic step 3>"
  ]
}

USER SITUATION:
"${trimmedSituation}"`;

      let rawOutput = "";
      const modelsToTry = ["gemini-3.6-flash", "gemini-3.5-flash-lite", "gemini-3.1-pro-preview"];

      let lastError = null;
      for (const modelName of modelsToTry) {
        try {
          const response = await client.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              responseMimeType: "application/json",
            }
          });

          rawOutput = response.text || "";
          if (rawOutput) {
            break;
          }
        } catch (mErr) {
          lastError = mErr;
          console.warn(`[SafePulse Backend] Model ${modelName} failed, trying next:`, mErr.message);
        }
      }

      if (!rawOutput && lastError) {
        throw lastError;
      }
      
      // Clean potential markdown fences
      rawOutput = rawOutput.trim();
      if (rawOutput.startsWith("```json")) {
        rawOutput = rawOutput.replace(/^```json/, "").replace(/```$/, "").trim();
      } else if (rawOutput.startsWith("```")) {
        rawOutput = rawOutput.replace(/^```/, "").replace(/```$/, "").trim();
      }

      const parsedData = JSON.parse(rawOutput);

      // Validate required fields
      if (!parsedData.riskLevel || !Array.isArray(parsedData.immediateActions)) {
        throw new Error("Invalid response format from AI model");
      }

      return res.json({
        success: true,
        data: {
          riskLevel: parsedData.riskLevel.toUpperCase(),
          riskScore: parsedData.riskScore || (parsedData.riskLevel.toUpperCase() === "HIGH" ? 85 : parsedData.riskLevel.toUpperCase() === "MODERATE" ? 55 : 25),
          summary: parsedData.summary || `Assessed as ${parsedData.riskLevel} risk.`,
          riskFactors: parsedData.riskFactors || [],
          immediateActions: parsedData.immediateActions || [],
          safetyPlan: parsedData.safetyPlan || [],
          isFallback: false
        },
        source: "gemini_ai",
        disclaimer: "SafePulse AI guidance is informational and does not replace official emergency services."
      });

    } catch (aiError) {
      console.error("[SafePulse Backend] Gemini API Error:", aiError.message);
      // Fallback seamlessly on API rate limit or key error
      const fallbackResult = generateFallbackAssessment(trimmedSituation);
      return res.json({
        success: true,
        data: fallbackResult,
        source: "fallback_engine_after_error",
        aiErrorMessage: aiError.message,
        disclaimer: "SafePulse AI guidance is informational and does not replace official emergency services."
      });
    }

  } catch (error) {
    console.error("[SafePulse Backend] Request Error:", error);
    return res.status(500).json({
      error: "An error occurred while processing your safety assessment.",
      details: error.message
    });
  }
});

export default router;
