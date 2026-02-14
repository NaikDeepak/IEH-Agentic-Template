
import { GoogleGenAI } from "@google/genai";

// Shared Constants for AI Models (can be overridden via params)
const DEFAULT_MODELS = {
    FAST: 'gemini-2.0-flash',
    EMBEDDING: 'models/gemini-embedding-001',
    EMBEDDING_DIMENSIONS: 768,
};

/**
 * Get AI Client instance
 * @param {string} apiKey 
 * @returns {GoogleGenAI}
 */
const getClient = (apiKey) => {
    if (!apiKey) {
        throw new Error("API Key is required for AI operations");
    }
    return new GoogleGenAI({ apiKey });
};

/**
 * Generate a Job Description
 * @param {object} params 
 * @param {string} params.role
 * @param {string} params.skills
 * @param {string} params.experience
 * @param {string} params.location
 * @param {string} params.type
 * @param {string} params.workMode
 * @param {string} apiKey
 * @returns {Promise<object>} { jd: string, suggestedSkills: string[], screeningQuestions: object[] }
 */
export const generateJD = async ({ role, skills, experience, location, type, workMode }, apiKey) => {
    const ai = getClient(apiKey);
    const prompt = `
        As an expert IT recruiter, generate a professional job description and a list of key skills for a ${role}.
        Location: ${location || 'not specified'}.
        Job Type: ${type || 'not specified'}.
        Work Mode: ${workMode || 'not specified'}.
        Experience level: ${experience || 'not specified'}.
        ${skills ? `Initial skills provided: ${skills}.` : 'Please suggest 5-8 relevant modern skills for this role.'}

        Also generate 3-5 sharp, relevant screening questions for applicants (mix of technical and behavioral).

        Return your response in valid JSON format:
        {
            "jd": "full job description text here (markdown supported)...",
            "suggestedSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
            "screeningQuestions": [{"question": "string", "hint": "string"}]
        }
    `;

    try {
        const response = await ai.models.generateContent({
            model: DEFAULT_MODELS.FAST,
            contents: prompt,
            config: { responseMimeType: "application/json" } // Force JSON to be safe
        });

        const text = typeof response.text === 'function' ? response.text() : response.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) throw new Error("Empty response from AI");

        // Clean up markdown block if present (even with responseMimeType, sometimes helpful)
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Error generating JD:", error);
        throw new Error("Failed to generate job description: " + error.message);
    }
};

/**
 * Generate Job Assistance (Critique)
 * @param {string} jd 
 * @param {string} apiKey 
 * @returns {Promise<object>} { suggestions: string[], questions: string[] }
 */
export const generateJobAssist = async (jd, apiKey) => {
    const ai = getClient(apiKey);
    const prompt = `
        You are a top-tier Tech Recruiter Consultant reviewing a client's DRAFT Job Description.
        
        Provide 3 CRITICAL & ACTIONABLE tips for the RECRUITER to improve this job post.
        - 🛑 CRITICAL RULE: DO NOT give advice for a candidate's resume.
        - 🛑 CRITICAL RULE: DO NOT say "quantify achievements". This is a JOB DESCRIPTION, not a RESUME. The role hasn't happened yet.
        - FOCUS ON:
            - **Selling the Vision:** Does the intro exciting? 
            - **Clarity:** Is the "Responsibilities" section vague? (e.g. "Work on code" -> "Own the payment service")
            - **Engineer Appeal:** Does it mention interesting tech challenges (scale, complexity)?

        Return your response in valid JSON format:
        {
            "suggestions": ["tip 1", "tip 2", "tip 3"]
        }
        
        Job Description Draft:
        ${jd}
    `;

    try {
        const response = await ai.models.generateContent({
            model: DEFAULT_MODELS.FAST,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });

        const text = typeof response.text === 'function' ? response.text() : response.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) throw new Error("Empty response from AI");

        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(jsonStr);
        return {
            suggestions: data.suggestions || [],
            questions: data.questions || [] // Backwards compat if needed
        };
    } catch (error) {
        console.error("Error generating job assist:", error);
        throw new Error("Failed to generate job assistance: " + error.message);
    }
};

/**
 * Expand Query using LLM
 * @param {string} originalQuery 
 * @param {string} context - 'finding a job' or 'finding a candidate'
 * @param {string} apiKey 
 * @returns {Promise<string>}
 */
export const expandQuery = async (originalQuery, context, apiKey) => {
    const ai = getClient(apiKey);
    const target = context === "finding a job" ? "job" : "candidate";
    const prompt = `You are an expert IT recruiter in India. Expand this search query into a detailed semantic description of the ideal ${target}. Include related skills, tools, and alternative titles. Keep it under 100 words. Query: ${originalQuery}`;

    try {
        const response = await ai.models.generateContent({
            model: DEFAULT_MODELS.FAST,
            contents: prompt,
        });

        const expandedText = (typeof response.text === 'function' ? response.text() : null) ||
            response.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!expandedText) {
            console.warn("LLM response empty/invalid, using original query.");
            return originalQuery;
        }

        return expandedText;
    } catch (error) {
        console.error("Error expanding query:", error);
        return originalQuery;
    }
};

/**
 * Generate Embedding
 * @param {string} text 
 * @param {string} apiKey 
 * @returns {Promise<number[]>}
 */
export const generateEmbedding = async (text, apiKey) => {
    const ai = getClient(apiKey);
    const model = DEFAULT_MODELS.EMBEDDING;

    try {
        const response = await ai.models.embedContent({
            model: model,
            contents: [{ parts: [{ text }] }],
            config: {
                outputDimensionality: DEFAULT_MODELS.EMBEDDING_DIMENSIONS
            }
        });

        let values;
        if (response.embedding?.values) {
            values = response.embedding.values;
        } else if (response.embeddings?.[0]?.values) {
            values = response.embeddings[0].values;
        } else {
            throw new Error("Invalid embedding response structure");
        }

        // Validate and ensure strict dimension
        if (values.length > DEFAULT_MODELS.EMBEDDING_DIMENSIONS) {
            console.warn(`[Gemini] Embedding dimension mismatch. Expected ${DEFAULT_MODELS.EMBEDDING_DIMENSIONS}, got ${values.length}. Slicing.`);
            return values.slice(0, DEFAULT_MODELS.EMBEDDING_DIMENSIONS);
        }

        if (values.length < DEFAULT_MODELS.EMBEDDING_DIMENSIONS) {
            throw new Error(`Invalid embedding dimension: ${values.length} (Expected: ${DEFAULT_MODELS.EMBEDDING_DIMENSIONS})`);
        }

        return values;
    } catch (error) {
        console.error(`Embedding failed with model ${model}:`, error.message);
        throw error;
    }
};
