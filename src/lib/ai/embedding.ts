import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

import { CONSTANTS } from "../../server/config/constants.js";

// Define a minimal type for the parts of CONSTANTS we use to satisfy strict linting
interface AIConstants {
    AI: {
        EMBEDDING_DIMENSIONS: number;
        MODEL_EMBEDDING: string;
    }
}
// Cast to unknown first if CONSTANTS is not typed, then to our interface
const Constants = CONSTANTS as unknown as AIConstants;

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
export const EMBEDDING_DIMENSION = Constants.AI.EMBEDDING_DIMENSIONS;

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
            model: Constants.AI.MODEL_EMBEDDING,
            contents: [
                {
                    parts: [{ text }],
                },
            ],
            config: {
                outputDimensionality: Constants.AI.EMBEDDING_DIMENSIONS
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
