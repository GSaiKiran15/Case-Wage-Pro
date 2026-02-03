"use server";
import { GoogleGenAI } from "@google/genai";

interface OptionalConstraints {
    location?: string;
    isRemote?: boolean;
    pay?: number;
    state?: string;
    area?: string;
    maxSeniority?: "junior" | "mid" | "senior" | "unchanged";
    formatHint?: "mirror" | "compact" | "expanded";
    mustKeepPhrases?: string[];
    mustNotAdd?: string[];
    keywordsToEmphasize?: string[];
    keywordsToDeemphasize?: string[];
}

export async function optimizeJobDescription(
    currentJD: string,
    targetRole: string,
    constraints?: OptionalConstraints
) {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("Missing GEMINI_API_KEY in environment variables");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Build constraints object with available data
    const finalConstraints: OptionalConstraints = {
        maxSeniority: "unchanged",
        formatHint: "mirror",
        ...constraints,
    };

    const prompt = `You are a job-description rewriter with strict truthfulness constraints.

GOAL:
Given a CURRENT_JD (what the job truly is today) and a TARGET_ROLE (what the user wants),
produce a NEW_JD that stays faithful to CURRENT_JD but is tilted toward TARGET_ROLE by:
- emphasizing overlapping responsibilities,
- reordering bullets to highlight TARGET_ROLE-relevant work,
- adjusting wording to match TARGET_ROLE language,
- adding ONLY minor adjacent tasks that are already implied by CURRENT_JD.
Do NOT invent new core duties, new teams, new products, or new seniority/authority.

YOU MUST FIRST "LEARN" BOTH ROLES:
- Infer the role families, typical responsibilities, and skills for CURRENT_ROLE and TARGET_ROLE.
- Use this learned understanding ONLY to reframe and re-emphasize what already exists in CURRENT_JD.
- If TARGET_ROLE requires responsibilities not supported by CURRENT_JD, do NOT add them.
  Instead, softly reposition existing items, or add a small "Nice to have" that is clearly adjacent.

STRICT CONSTRAINTS:
1) Preserve truth: NEW_JD must remain compatible with CURRENT_JD.
   - No false leadership claims (no "lead/own strategy/architect org-wide" unless CURRENT_JD supports it).
   - No false experience requirements (don't increase years/degree).
2) Keep the same seniority band as CURRENT_JD unless the input explicitly allows change.
3) Keep the same broad domain unless CURRENT_JD already covers the target domain.
4) Maintain a similar format and section headers as CURRENT_JD (mirror structure).
5) Tech stack:
   - Keep existing tech in CURRENT_JD.
   - You may add a tech keyword ONLY if CURRENT_JD strongly implies it (e.g., "REST APIs" implies HTTP/JSON).
6) Content shifts allowed (ONLY these):
   - reorder responsibilities
   - rewrite bullet wording
   - adjust job title slightly (e.g., "Software Engineer" → "Full-Stack Software Engineer") ONLY if supported
   - add up to 3 "Nice to have" bullets that are adjacent/implied, not new core duties
7) Output must be ONLY the NEW_JD text. No analysis, no commentary, no markdown.
8) NEVER INCLUDE PAY OR ANNUAL PAY NEVER!

INPUTS:
- CURRENT_JD: the original job description text (verbatim)
- TARGET_ROLE: the role the user wants (title + 1–2 lines describing desired focus)
- OPTIONAL_CONSTRAINTS: JSON (may be empty) with:
  {
    "must_keep_phrases": [ ... ],     // exact phrases that must appear in NEW_JD
    "must_not_add": [ ... ],          // forbidden duties/claims (e.g., "people management", "security clearance")
    "max_seniority": "junior|mid|senior|unchanged",
    "format_hint": "mirror|compact|expanded",
    "keywords_to_emphasize": [ ... ], // only if already supported by CURRENT_JD
    "keywords_to_deemphasize": [ ... ],
    "location": "${finalConstraints.location || 'not specified'}",
    "is_remote": ${finalConstraints.isRemote || false},
    "annual_pay": "${finalConstraints.pay || 'not specified'}"
  }

NOW PRODUCE NEW_JD.

CURRENT_JD:
<<<
${currentJD}
>>>

TARGET_ROLE:
<<<
${targetRole}
>>>

OPTIONAL_CONSTRAINTS:
<<<
${JSON.stringify(finalConstraints, null, 2)}
>>>
`;

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ text: prompt }],
    });

    console.log("Gemini JD Optimization Response:\n", response.text);

    return {
        success: true,
        optimizedJD: response.text,
        targetRole: targetRole,
    };
}