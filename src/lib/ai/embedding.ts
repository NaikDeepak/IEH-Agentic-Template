import { GoogleGenAI } from "@google/genai";

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
 * Generates a vector embedding for the given text using gemini-embedding-exp-03-07 or text-embedding-004.
 * We use 'text-embedding-004' as the stable standard for now.
 */
export const EMBEDDING_DIMENSION = 1536;

export async function generateEmbedding(text: string): Promise<number[]> {
    if (!text.trim()) return [];

    try {
        const client = getAI();
        const response = await client.models.embedContent({
            model: "text-embedding-004",
            contents: [
                {
                    parts: [{ text }],
                },
            ],
            config: {
                outputDimensionality: 1536
            }
        });

        const validate = (values: unknown): number[] | null => {
            if (!Array.isArray(values) || values.length !== EMBEDDING_DIMENSION) return null;
            const first = values[0] as number | undefined;
            const last = values[EMBEDDING_DIMENSION - 1] as number | undefined;
            if (first === undefined || last === undefined || !Number.isFinite(first) || !Number.isFinite(last)) return null;
            return values as number[];
        };

        // The SDK defines embeddings as an array
        if (response.embeddings?.[0]) {
            const v = validate(response.embeddings[0].values);
            if (v) return v;
        }

        // Add a fallthrough for potential singular embedding in future/other versions if needed, 
        // but handle it via unknown cast to avoid type errors
        const responseAny = response as unknown as { embedding?: { values: number[] } };
        if (responseAny.embedding) {
            const v = validate(responseAny.embedding.values);
            if (v) return v;
        }

        throw new Error("Invalid embedding response from Gemini API");
    } catch (error) {
        console.error("Failed to generate embedding:", error);
        throw error;
    }
}
