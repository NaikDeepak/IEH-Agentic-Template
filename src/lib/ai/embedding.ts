import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

import { EMBEDDING_DIMENSION, EMBEDDING_MODEL } from "./constants";

// Server-only: Lazy initialization to avoid crashes on client-side imports
let aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
    const apiKey = process.env['GEMINI_API_KEY'];

    if (!apiKey) {
        throw new Error(
            "GEMINI_API_KEY is required. Set GEMINI_API_KEY in Cloud Run secrets."
        );
    }

    aiInstance ??= new GoogleGenAI({ apiKey });
    return aiInstance;
}

/**
 * Generates a vector embedding for the given text using gemini-embedding-001.
 */
// Re-export for backward compatibility if needed, though direct import from constants is preferred
export { EMBEDDING_DIMENSION } from "./constants";

// Zod schema for a single embedding object
const ContentEmbeddingSchema = z.object({
    values: z.array(z.number()).length(EMBEDDING_DIMENSION)
});

// Zod schema for the overall Gemini response
// Handles both 'embeddings' (plural) and 'embedding' (singular) fields
const GeminiEmbeddingResponseSchema = z.object({
    embeddings: z.array(ContentEmbeddingSchema).optional(),
    embedding: ContentEmbeddingSchema.optional()
});

export async function generateEmbedding(text: string): Promise<number[]> {
    if (!text.trim()) return [];

    try {
        const client = getAI();
        const response = await client.models.embedContent({
            model: EMBEDDING_MODEL,
            contents: [
                {
                    parts: [{ text }],
                },
            ],
            config: {
                outputDimensionality: EMBEDDING_DIMENSION
            }
        });

        // Parse and validate the response structure using Zod
        const parsed = GeminiEmbeddingResponseSchema.parse(response);

        // Check for singular 'embedding' first (standard for embedContent)
        if (parsed.embedding) {
            return parsed.embedding.values;
        }

        // Check for plural 'embeddings' (legacy or batch fallback)
        if (parsed.embeddings && parsed.embeddings.length > 0) {
            const firstEmbedding = parsed.embeddings[0];
            if (firstEmbedding) {
                return firstEmbedding.values;
            }
        }

        throw new Error("Invalid embedding response structure: missing embedding data");
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error("Zod Validation Error in generateEmbedding:", error.issues);
        } else {
            console.error("Failed to generate embedding:", error);
        }
        throw error;
    }
}
