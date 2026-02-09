import { GoogleGenAI } from '@google/genai';
import { config } from '../../config/index.js';
import { CONSTANTS } from '../../config/constants.js';
import { generateEmbedding } from '../../lib/gemini.js';

const ai = new GoogleGenAI({ apiKey: config.apiKey });

export const generateJD = async (role, skills, experience) => {
    const prompt = `Generate a professional job description for a ${role}.
${skills ? `Skills to include: ${skills}` : 'Please suggest 5-8 relevant modern skills for this role.'}
${experience ? `Experience required: ${experience}` : 'Assume relevant experience is needed.'}

Format the response as a JSON object:
{
  "jd": "The full job description markdown text",
  "suggestedSkills": ["skill1", "skill2", ...]
}`;

    const response = await ai.models.generateContent({
        model: CONSTANTS.AI.MODEL_FAST,
        contents: prompt,
    });

    const text = response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        // Fallback to plain text if JSON extraction fails
        return { jd: text, suggestedSkills: [] };
    }

    try {
        return JSON.parse(jsonMatch[0]);
    } catch (e) {
        return { jd: text, suggestedSkills: [] };
    }
};

export const generateJobAssist = async (jd) => {
    const prompt = `Analyze the following job description and provide:
1. 3-5 relevant screening questions for candidates.
2. 3 optimization suggestions for the job description to attract better talent.

Format the response as a JSON object with the following structure:
{
  "questions": [{"question": "string", "hint": "string"}],
  "suggestions": ["string"]
}

Job Description:
${jd}`;

    const response = await ai.models.generateContent({
        model: CONSTANTS.AI.MODEL_FAST,
        contents: prompt,
    });

    const text = response.text();
    // Extract JSON from potential markdown blocks
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error("Failed to parse AI response for job assistance");
    }
    return JSON.parse(jsonMatch[0]);
};

export const getEmbedding = async (text) => {
    return await generateEmbedding(text);
};
