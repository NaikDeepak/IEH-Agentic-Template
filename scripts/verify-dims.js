import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY });

async function testEmbedding() {
    try {
        console.log('Testing gemini-embedding-001 with outputDimensionality: 768...');
        const res = await ai.models.embedContent({
            model: 'models/gemini-embedding-001',
            contents: [{ parts: [{ text: "Hello world" }] }],
            outputDimensionality: 768
        });

        const values = res.embedding?.values;
        if (values) {
            console.log(`Dimension: ${values.length}`);
        } else {
            console.log('No values found:', JSON.stringify(res, null, 2));
        }

    } catch (err) {
        console.error('Error:', err);
    }
}

testEmbedding();
