import { GoogleGenAI } from '@google/genai';
import { z } from "zod";
import { config } from '../config/index.js';
import { CONSTANTS } from '../config/constants.js';

const ai = new GoogleGenAI({ apiKey: config.apiKey });

// Zod Schema for Analyze Query Response
const QueryAnalysisSchema = z.object({
    semanticQuery: z.string(),
    filters: z.object({
        location: z.string().nullable().optional(),
        work_mode: z.string().nullable().optional(),
        min_salary: z.coerce.number().nullable().optional(),
        job_type: z.string().nullable().optional()
    }).optional().default({})
});

/**
 * Generate embedding for a given text using gemini-embedding-001/text-embedding-004
 * @param {string} text 
 * @returns {Promise<number[]>}
 */
export const generateEmbedding = async (text) => {
    try {
        const { MODEL_EMBEDDING } = CONSTANTS.AI;

        // Use the unified client entry point for the new @google/genai SDK
        const response = await ai.models.embedContent({
            model: MODEL_EMBEDDING,
            contents: [{ parts: [{ text }] }],
            outputDimensionality: CONSTANTS.AI.EMBEDDING_DIMENSIONS
        });

        // Simple Zod check for values (runtime validation)
        const EmbeddingValuesSchema = z.array(z.number());

        if (response.embedding?.values) {
            let values = EmbeddingValuesSchema.parse(response.embedding.values);
            // Matryoshka embedding slicing - text-embedding-004 supports taking the first N dimensions
            if (values.length > CONSTANTS.AI.EMBEDDING_DIMENSIONS) {
                console.warn(`[Gemini] Slicing embedding from ${values.length} to ${CONSTANTS.AI.EMBEDDING_DIMENSIONS}`);
                values = values.slice(0, CONSTANTS.AI.EMBEDDING_DIMENSIONS);
            }
            console.log(`[Gemini] Generated embedding with dimension: ${values.length}`);
            return values;
        }
        if (response.embeddings?.[0]?.values) {
            let values = EmbeddingValuesSchema.parse(response.embeddings[0].values);
            // Matryoshka embedding slicing
            if (values.length > CONSTANTS.AI.EMBEDDING_DIMENSIONS) {
                console.warn(`[Gemini] Slicing embedding from ${values.length} to ${CONSTANTS.AI.EMBEDDING_DIMENSIONS}`);
                values = values.slice(0, CONSTANTS.AI.EMBEDDING_DIMENSIONS);
            }
            console.log(`[Gemini] Generated embedding with dimension: ${values.length}`);
            return values;
        }

        console.error("Gemini Embedding Response:", JSON.stringify(response, null, 2));
        throw new Error("Invalid embedding response from Gemini API");
    } catch (error) {
        console.error("Embedding generation failed:", error);
        // Log the full error object if it has a response property (common in Google APIs)
        if (error.response) {
            console.error("Error Response:", JSON.stringify(error.response, null, 2));
        }
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

        const rawResult = JSON.parse(responseText);

        // Zod Validation
        const result = QueryAnalysisSchema.parse(rawResult);

        return result;

    } catch (error) {
        if (error instanceof z.ZodError) {
            console.warn(`Query analysis validation failed for "${originalQuery}":`, error.issues);
        } else {
            console.warn(`Query analysis failed for "${originalQuery}". Using defaults. Error: ${error.message}`);
        }
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
