import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error('No API_KEY or GEMINI_API_KEY found.');
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

async function testModel() {
    console.log('\n--- Testing "models/gemini-embedding-001" ---');
    try {
        const res = await ai.models.embedContent({
            model: 'models/gemini-embedding-001',
            contents: [{ parts: [{ text: "Hello world" }] }]
        });
        console.log('SUCCESS: models/gemini-embedding-001 worked!');
        if (res.embedding) console.log('Embedding length:', res.embedding.values.length);
    } catch (e) {
        console.error('FAILED "models/gemini-embedding-001":', e.message);
    }
}

testModel();
