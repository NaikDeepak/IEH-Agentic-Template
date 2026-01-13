import { GoogleGenAI } from "@google/genai";

// Server-only: must be provided via runtime secret (never expose via VITE_* env vars)
const apiKey =
    typeof process !== 'undefined' && process.env?.GEMINI_API_KEY
        ? process.env.GEMINI_API_KEY
        : undefined;

if (!apiKey) {
    throw new Error(
        "GEMINI_API_KEY is required. Set GEMINI_API_KEY in Cloud Run secrets."
    );
}

const ai = new GoogleGenAI({ apiKey });

/**
 * Generates a vector embedding for the given text using gemini-embedding-exp-03-07 or text-embedding-004.
 * We use 'text-embedding-004' as the stable standard for now.
 */
export const EMBEDDING_DIMENSION = 768;

export async function generateEmbedding(text: string): Promise<number[]> {
    if (!text.trim()) return [];

    try {
        // Note: In the new @google/genai SDK, we access models via ai.models
        // We strictly use the model name 'text-embedding-004' for cost/performance balance
        const response = await ai.models.embedContent({
            model: "text-embedding-004",
            contents: [
                {
                    parts: [{ text }],
                },
            ],
        });

        if (!response || !response.embeddings || !response.embeddings[0] || !response.embeddings[0].values) {
            throw new Error("Invalid embedding response from Gemini API");
        }

        return response.embeddings[0].values;
    } catch (error) {
        console.error("Failed to generate embedding:", error);
        // Return empty array or throw depending on strictness. For MVP, we throw to catch issues early.
        throw error;
    }
}
