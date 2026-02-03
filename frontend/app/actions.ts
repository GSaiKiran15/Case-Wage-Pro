"use server";
import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenAI } from "@google/genai";

export async function getRecommendation(params: any) {
    const { jobDescription, occupation, state, area, pay } = params;
    const pineConeResults = await queryPineCone(jobDescription);
    const geminiResults = await queryGemini(jobDescription, pineConeResults, occupation, state, area, pay);
    
    return geminiResults;
}

export async function queryPineCone(jobDescription: string) {
    const apiKey = process.env.PINECONE_API_KEY;
    const indexName = process.env.PINECONE_INDEX;
    const indexHost = process.env.PINECONE_HOST;

    if (!apiKey || !indexName || !indexHost || !jobDescription) {
        throw new Error("Missing PINECONE_API_KEY, PINECONE_INDEX, or PINECONE_HOST");
    }

    const pc = new Pinecone({ apiKey });
    const index = pc.index(indexName, indexHost);
    const namespace = index.namespace("onet-2025")
    const results = await namespace.searchRecords({
        query: {
            topK: 5,
            inputs: { text: jobDescription }, 
        },
        fields: ['description', 'title', 'value'], 
    });

    return {
        success: true,
        data: results
    };
}

export async function queryGemini(jobDescription: string, pineconeResults: any, occupation:any, state:any, area:any, pay:number) {
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
${area}
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

    console.log("Gemini Response:\n", response.text);

    return {
        success: true,
        filteredResults: response.text
    };
}