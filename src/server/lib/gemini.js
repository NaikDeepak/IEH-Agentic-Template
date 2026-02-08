import { GoogleGenAI } from '@google/genai';
import { config } from '../config/index.js';
import { CONSTANTS } from '../config/constants.js';

const ai = new GoogleGenAI({ apiKey: config.apiKey });

/**
 * Generate embedding for a given text using gemini-embedding-001/text-embedding-004
 * @param {string} text 
 * @returns {Promise<number[]>}
 */
export const generateEmbedding = async (text) => {
    try {
        const { MODEL_EMBEDDING, EMBEDDING_DIMENSIONS, API_VERSION } = CONSTANTS.AI;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/${API_VERSION}/models/${MODEL_EMBEDDING}:embedContent?key=${config.apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: { parts: [{ text }] },
                    outputDimensionality: EMBEDDING_DIMENSIONS
                })
            }
        );

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Embedding API failed: ${response.status} ${errText}`);
        }

        const data = await response.json();

        if (data?.embedding?.values) {
            return data.embedding.values;
        }

        throw new Error("Invalid embedding response from Gemini API");
    } catch (error) {
        console.error("Embedding generation failed:", error);
        throw error;
    }
};

/**
 * Analyze search query to extract structured filters and semantic intent
 * @param {string} originalQuery 
 * @param {string} context - "finding a job" or "finding a candidate"
 * @returns {Promise<{semanticQuery: string, filters: object}>}
 */
export const analyzeQuery = async (originalQuery, context) => {
    try {
        const target = context === "finding a job" ? "job" : "candidate";

        const prompt = `You are an expert IT recruiter in India. Analyze this search query for a ${target} search.
        
        Output a JSON object with:
        1. "semanticQuery": A detailed semantic description of the ideal ${target} (skills, tools, alternative titles) for vector search. Keep it under 100 words.
        2. "filters": Extract structured constraints:
           - "location": string (City/Country) or null
           - "work_mode": "remote" | "hybrid" | "onsite" | null (infer from "wfh", "office" etc)
           - "min_salary": number (annual in INR) or null (e.g. "15L" -> 1500000)
           - "job_type": "full_time" | "part_time" | "contract" | "freelance" | "internship" | null
        
        Query: "${originalQuery}"
        
        Return ONLY valid JSON.`;

        const response = await ai.models.generateContent({
            model: CONSTANTS.AI.MODEL_FAST,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });

        let responseText = typeof response.text === 'function' ? response.text() : response.text;

        if (!responseText) {
            throw new Error("Empty response from LLM");
        }

        responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

        const result = JSON.parse(responseText);
        return result;

    } catch (error) {
        console.warn(`Query analysis failed for "${originalQuery}". Using defaults. Error: ${error.message}`);
        return {
            semanticQuery: originalQuery,
            filters: {}
        };
    }
};

/**
 * Expand query for candidates
 */
export const expandQuery = async (query, context) => {
    try {
        const target = context === "finding a job" ? "job" : "candidate";
        const prompt = `You are an expert IT recruiter in India. Expand this search query into a detailed semantic description of the ideal ${target}. Include related skills, tools, and alternative titles. Keep it under 100 words. Query: ${query}`;

        const response = await ai.models.generateContent({
            model: CONSTANTS.AI.MODEL_FAST,
            contents: prompt,
        });

        const expandedText = typeof response.text === 'function' ? response.text() : response.text;
        return expandedText || query;
    } catch (e) {
        console.warn("Query expansion failed", e);
        return query;
    }
};
