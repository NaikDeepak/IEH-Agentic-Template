import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY });

async function testVariant(name, params) {
    try {
        console.log(`Testing ${name}...`);
        const res = await ai.models.embedContent({
            model: 'models/gemini-embedding-001',
            contents: [{ parts: [{ text: "Hello world" }] }],
            ...params
        });

        const values = res.embedding?.values || res.embeddings?.[0]?.values;
        if (values) {
            console.log(`  -> Dimension: ${values.length}`);
        } else {
            console.log('  -> No values found');
        }
    } catch (err) {
        console.log(`  -> Error: ${err.message}`);
    }
}

async function run() {
    await testVariant('Top-level outputDimensionality', { outputDimensionality: 768 });
    await testVariant('Nested config outputDimensionality', { config: { outputDimensionality: 768 } });
    await testVariant('Nested config output_dimensionality', { config: { output_dimensionality: 768 } });
    await testVariant('Top-level output_dimensionality', { output_dimensionality: 768 });
}

run();
