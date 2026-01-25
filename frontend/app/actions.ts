"use server";
import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenAI } from "@google/genai";

export async function getRecommendation(params: any) {
    const { jobDescription, occupation, state, area } = params;
    const pineConeResults = await queryPineCone(jobDescription);
    const geminiResults = await queryGemini(jobDescription, pineConeResults);
    
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

    console.log("Pinecone Results:", JSON.stringify(results, null, 2));

    return {
        success: true,
        data: results
    };
}

export async function queryGemini(jobDescription: string, pineconeResults: any) {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("Missing GEMINI_API_KEY in environment variables");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `You are a strict filter for Pinecone similarity-search results.

INPUTS:
1) USER_JD: a plain-text job description the user provided.
2) PINECONE_RESULTS: JSON shaped like:
{
  "result": {
    "hits": [
      { "_id": "...", "_score": 0.0, "fields": { "value": "...", "title": "...", "description": "..." } },
      ...
    ]
  }
}

TASK:
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

OUTPUT REQUIREMENTS (NO EXCEPTIONS):
- Output ONLY valid JSON. No preamble, no markdown, no extra keys, no explanations.
- Output MUST be the same shape as Pinecone results, but filtered:
{
  "result": {
    "hits": [ <filtered hit objects exactly as provided> ]
  }
}
- If no hits match, return {"result":{"hits":[]}} exactly.

Now process the inputs below.

USER_JD:
<<<
${jobDescription}
>>>

PINECONE_RESULTS:
<<<
${JSON.stringify(pineconeResults, null, 2)}
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