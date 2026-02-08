import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("No API_KEY found in environment variables.");
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

async function checkEmbedding() {
    try {
        const model = "models/gemini-embedding-001";
        console.log(`Testing embedding with model: ${model}`);

        const getValues = (res) => {
            if (res.embedding?.values) return res.embedding.values;
            if (res.embeddings?.[0]?.values) return res.embeddings[0].values;
            return null;
        };

        // Test without outputDimensionality first
        console.log("Variant 1: Default dimensions");
        const result1 = await ai.models.embedContent({
            model: model,
            contents: [{ parts: [{ text: "Hello world" }] }],
        });

        const v1 = getValues(result1);
        if (v1) {
            console.log(`Dimension 1: ${v1.length}`);
        } else {
            console.log("No embedding returned in result 1");
        }

        // Test with outputDimensionality
        console.log("\nVariant 2: outputDimensionality = 768");
        try {
            const result2 = await ai.models.embedContent({
                model: model,
                contents: [{ parts: [{ text: "Hello world" }] }],
                config: { outputDimensionality: 768 }
            });
            const v2 = getValues(result2);
            if (v2) {
                console.log(`Dimension 2: ${v2.length}`);
            } else {
                console.log("No embedding returned in result 2");
                // Log if it failed silently or returned different structure
                if (!v2) console.log(JSON.stringify(result2, null, 2));
            }
        } catch (e) {
            console.log("Variant 2 failed:", e.message);
        }

    } catch (error) {
        console.error("Error generating embedding:", error);
    }
}

checkEmbedding();
