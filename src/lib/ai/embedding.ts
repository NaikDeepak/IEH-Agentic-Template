// Server-only: Lazy initialization to avoid crashes on client-side imports
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let ai: any | null = null;

async function getAI() {
    const apiKey = process.env?.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error(
            "GEMINI_API_KEY is required. Set GEMINI_API_KEY in Cloud Run secrets."
        );
    }

    if (!ai) {
        const { GoogleGenAI } = await import("@google/genai");
        ai = new GoogleGenAI({ apiKey });
    }
    return ai;
}

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response: any = await (await getAI()).models.embedContent({
            model: "text-embedding-004",
            contents: [
                {
                    parts: [{ text }],
                },
            ],
        });

        const validate = (values: unknown) => {
            if (!Array.isArray(values) || values.length !== EMBEDDING_DIMENSION) return null;
            if (!Number.isFinite(values[0] as number) || !Number.isFinite(values[EMBEDDING_DIMENSION - 1] as number)) return null;
            return values as number[];
        };

        // Check for 'embedding' (singular) - often used in newer SDK versions/single requests
        if (response?.embedding?.values) {
            const v = validate(response.embedding.values);
            if (v) return v;
        }

        // Check for 'embeddings' (plural) - used in batch requests or older SDK versions
        if (response?.embeddings?.[0]?.values) {
            const v = validate(response.embeddings[0].values);
            if (v) return v;
        }

        throw new Error("Invalid embedding response from Gemini API");
    } catch (error) {
        console.error("Failed to generate embedding:", error);
        // Return empty array or throw depending on strictness. For MVP, we throw to catch issues early.
        throw error;
    }
}
