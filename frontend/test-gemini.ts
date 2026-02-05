/**
 * Test script for queryGemini function
 * Run with: npx ts-node test-gemini.ts
 */

import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Mock Pinecone results (you can replace this with real data)
const mockPineconeResults = {
    success: true,
    data: {
        result: {
            hits: [
                {
                    _id: "15-1252.00",
                    _score: 0.85,
                    fields: {
                        value: "15-1252.00",
                        title: "Software Developers",
                        description: "Research, design, and develop computer and network software or specialized utility programs. Analyze user needs and develop software solutions, applying principles and techniques of computer science, engineering, and mathematical analysis."
                    }
                },
                {
                    _id: "15-1256.00",
                    _score: 0.78,
                    fields: {
                        value: "15-1256.00",
                        title: "Software Developers and Software Quality Assurance Analysts and Testers",
                        description: "Develop and execute software tests to identify software problems and their causes."
                    }
                }
            ]
        }
    }
};

// Sample job description
const sampleJobDescription = `
We are seeking a Senior Full Stack Developer to join our team. 
Responsibilities include:
- Design and develop scalable web applications using React and Node.js
- Collaborate with product managers and designers
- Write clean, maintainable code
- Mentor junior developers
- Participate in code reviews

Requirements:
- 5+ years of experience in software development
- Strong knowledge of JavaScript, TypeScript, React, Node.js
- Experience with cloud platforms (AWS/Azure)
- Bachelor's degree in Computer Science or related field
`;

// Test parameters
const testParams = {
    jobDescription: sampleJobDescription.trim(),
    occupation: "Full Stack Developer",
    state: "California",
    area: "San Francisco County",
    pay: "$150,000/year"
};

// Copied queryGemini function (without "use server" directive)
async function queryGemini(
    jobDescription: string, 
    pineconeResults: any, 
    occupation: string, 
    state: string, 
    area: string,
    pay: string = "unknown"
) {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("Missing GEMINI_API_KEY in environment variables");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `You are a strict filter for Pinecone similarity-search results AND a U.S. H-1B prevailing wage level classifier.

INPUTS:
1) USER_JD: plain-text job description.
2) PINECONE_RESULTS: JSON shaped like:
{
  "result": {
    "hits": [
      { "_id": "...", "_score": 0.0, "fields": { "value": "...", "title": "...", "description": "..." } },
      ...
    ]
  }
}
3) PAY (optional): string (e.g., "$40/hour" or "$120,000/year" or "unknown")
4) WORK_LOCATION (optional): string (e.g., "Denver, CO, US" or "unknown")
5) ROLE_TYPE (optional): string (e.g., "IC", "lead", "manager", "unknown")

TASK 1 — FILTER (STRICT):
Return ONLY the subset of hits that are truly eligible/compatible with USER_JD.

STRICT RULES:
- Keep a hit ONLY if its "fields.title" AND "fields.description" clearly align with USER_JD's role/responsibilities/skills.
- If it is adjacent but not the same role family, DROP it (e.g., QA/tester, data scientist, UI designer when USER_JD is software/web dev—unless USER_JD explicitly asks for those roles).
- If you are uncertain, DROP it. Do not guess.
- Do not rewrite, summarize, or change any kept job's content.
- You MUST preserve these three fields exactly for every kept hit: fields.value, fields.title, fields.description (verbatim).
- Preserve each kept hit's original "_id" and "_score" as well (verbatim).
- Preserve original order among kept hits (same order as in input).
- Do not rename keys, do not change number formats, do not add or remove any fields inside a kept hit object.

TASK 2 — WAGE LEVEL (STRICT, JD-ONLY):
Determine the MOST DEFENSIBLE DOL/USCIS prevailing wage level (1–4) based ONLY on USER_JD signals:
- duties complexity, autonomy, supervision, decision-making, ambiguity, leadership, and required experience/education.
- Be conservative: do NOT choose a higher level unless clearly supported.
- PAY and WORK_LOCATION must NOT affect the level choice (optional sanity check only).

OUTPUT REQUIREMENTS (NO EXCEPTIONS):
- Output ONLY valid JSON. No markdown. No explanations.
- Output MUST be exactly this shape and keys (no extras):
{
  "result": { "hits": [ <filtered hit objects exactly as provided> ] },
  "defensible_wage_level": "1" | "2" | "3" | "4",
  "confidence": "low" | "medium" | "high"
}
- If no hits match, return hits as [].

Now process the inputs below.

USER_JD:
<<<
${jobDescription}
>>>

PINECONE_RESULTS:
<<<
${JSON.stringify(pineconeResults, null, 2)}
>>>

PAY (optional):
<<<
${pay}
>>>

WORK_LOCATION (optional):
<<<
${area}, ${state}
>>>

ROLE_TYPE (optional):
<<<
${occupation}
>>>
`;

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ text: prompt }],
    });

    console.log("\n=== GEMINI RESPONSE ===\n");
    console.log(response.text);
    console.log("\n======================\n");

    return {
        success: true,
        filteredResults: response.text ?? ""
    };
}

// Run the test
async function runTest() {
    console.log("🧪 Testing queryGemini function...\n");
    console.log("Job Description:", testParams.jobDescription.substring(0, 100) + "...\n");
    
    try {
        const result = await queryGemini(
            testParams.jobDescription,
            mockPineconeResults,
            testParams.occupation,
            testParams.state,
            testParams.area,
            testParams.pay
        );
        
        console.log("✅ Test completed successfully!");
        console.log("\nParsed Result:");
        try {
            const parsed = JSON.parse(result.filteredResults);
            console.log(JSON.stringify(parsed, null, 2));
        } catch (e) {
            console.log("⚠️  Could not parse as JSON, raw response shown above");
        }
    } catch (error) {
        console.error("❌ Test failed:", error);
    }
}

runTest();
