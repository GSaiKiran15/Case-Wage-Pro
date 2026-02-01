"use server";
import { GoogleGenAI } from "@google/genai";

export async function queryGeminiJD(jobDescription: string, pay: string, city: string, jobName: string) {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("Missing GEMINI_API_KEY in environment variables");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `You are a U.S. H-1B compliance analyst. Determine the MOST DEFENSIBLE DOL/USCIS prevailing wage level (1–4) for the job described. Be conservative: do NOT choose a higher level unless clearly supported by job requirements and duties. Pay and location affect wage AMOUNT, but wage LEVEL must be justified by duties, complexity, autonomy, and requirements.

INPUTS:
- Job Description (JD): ${jobDescription}
- Pay rate: ${pay}   (e.g., "$40/hour" or "$120,000/year"; if unknown say "unknown")
- Work location: ${city} (city, state, country; if fully remote, where the employee will physically work most days)
- Role type (if known): ${jobName}(IC/lead/architect/manager or "unknown")

TASK (do in this order):
1) Extract from the JD:
   - job title
   - required education (minimum)
   - required years of experience (minimum; if not stated, say "not specified")
   - autonomy/supervision cues (keywords/phrases)
   - leadership/mentoring expectations (yes/no + evidence)
   - duty complexity cues (architecture vs implementation, ambiguity, decision-making)
   - impact scope (task/feature/product/org) with evidence
2) Based ONLY on the JD-derived signals (not pay), determine the defensible wage level or range (e.g., 1–2, 2–3).
3) Use pay + location ONLY as a sanity check:
   - if pay is below typical prevailing wage for your recommended level(s), flag "compensation risk"
   - do NOT change level upward solely because pay is high
4) Provide an RFE risk rating (Low/Medium/High) and list the exact JD gaps causing risk.

OUTPUT (STRICT FORMAT):
A) Extracted Signals (with direct JD evidence snippets, max 15 words each):
- Title:
- Education required:
- Experience required:
- Autonomy/supervision evidence:
- Leadership/mentoring evidence:
- Complexity/decision-making evidence:
- Impact scope evidence:

B) Wage Level Assessment:
- Defensible level(s): Level X or Level X–Y
- Why these level(s) fit (bullets)

C) Risk Analysis:
- RFE Risk: Low / Medium / High
- Risk factors (bullets)
- JD improvements to better support the recommended level (bullets)

D) Pay/Location Check (do not adjust level upward from pay):
- Pay adequacy flags (if any)
- Location assumptions (if any)

IMPORTANT OUTPUT REQUIREMENT:
Return ONLY a single JSON object with exactly these keys:
- "defensible_wage_level": string (allowed values: "1", "2", "3", "4")
- "confidence": string (allowed values: "low", "medium", "high")
Do not include any other keys. Do not include explanations. Do not include markdown.
`

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ text: prompt }],
    });

    console.log("Gemini Response:\n", response.text);

    return {
        success: true,
        filteredResults: response.text
    };
}