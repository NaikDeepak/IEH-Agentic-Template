import { GoogleGenAI } from '@google/genai';
import { config } from '../../config/index.js';
import { CONSTANTS } from '../../config/constants.js';
import { generateEmbedding } from '../../lib/gemini.js';

const ai = new GoogleGenAI({ apiKey: config.apiKey });

export const generateJD = async (role, skills, location, type, workMode) => {
    const prompt = `Generate a professional job description for a ${role}.
${location ? `Location: ${location}` : ''}
${type ? `Job Type: ${type}` : ''}
${workMode ? `Work Mode: ${workMode}` : ''}
${skills ? `Skills to include: ${skills}` : 'Please suggest 5-8 relevant modern skills for this role.'}

Also generate 3-5 sharp, relevant screening questions for applicants (mix of technical and behavioral).

Format the response as a JSON object:
{
  "jd": "The full job description markdown text",
  "suggestedSkills": ["skill1", "skill2", ...],
  "screeningQuestions": [{"question": "string", "hint": "string"}]
}`;

    const response = await ai.models.generateContent({
        model: CONSTANTS.AI.MODEL_FAST,
        contents: prompt,
    });

    let text = '';
    if (typeof response.text === 'function') {
        text = response.text();
    } else if (typeof response.text === 'string') {
        text = response.text;
    } else {
        text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }

    if (!text) {
        throw new Error("Empty response from AI");
    }
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        // Fallback to plain text if JSON extraction fails
        return { jd: text, suggestedSkills: [], screeningQuestions: [] };
    }

    try {
        return JSON.parse(jsonMatch[0]);
    } catch (e) {
        return { jd: text, suggestedSkills: [], screeningQuestions: [] };
    }
};

export const generateJobAssist = async (jd) => {
    const prompt = `You are a top-tier Tech Recruiter Consultant reviewing a client's DRAFT Job Description.
    
    Provide 3 CRITICAL & ACTIONABLE tips for the RECRUITER to improve this job post.
        - 🛑 CRITICAL RULE: DO NOT give advice for a candidate's resume.
        - 🛑 CRITICAL RULE: DO NOT say "quantify achievements". This is a JOB DESCRIPTION, not a RESUME. The role hasn't happened yet.
        - FOCUS ON:
            - **Selling the Vision:** Does the intro exciting? 
            - **Clarity:** Is the "Responsibilities" section vague? (e.g. "Work on code" -> "Own the payment service")
            - **Engineer Appeal:** Does it mention interesting tech challenges (scale, complexity)?
        - Example of a GOOD tip: "The 'About Us' section is boring. Mention the specific scale challenges (e.g. 1M DAU) to hook senior engineers."

Format the response as a JSON object with the following structure:
{
  "suggestions": ["string"]
}

Job Description Draft:
${jd}`;

    const response = await ai.models.generateContent({
        model: CONSTANTS.AI.MODEL_FAST,
        contents: prompt,
    });

    let text = '';
    if (typeof response.text === 'function') {
        text = response.text();
    } else if (typeof response.text === 'string') {
        text = response.text;
    } else {
        text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }

    if (!text) {
        throw new Error("Empty response from AI");
    }
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
