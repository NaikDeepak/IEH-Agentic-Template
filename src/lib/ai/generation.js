
import { GoogleGenAI, Type } from "@google/genai";

// Shared Constants for AI Models (can be overridden via params)
const DEFAULT_MODELS = {
    FAST: 'gemini-2.0-flash',
    EMBEDDING: 'models/gemini-embedding-001',
    EMBEDDING_DIMENSIONS: 768,
};

// ── Response Schemas ──────────────────────────────────────────────────────────
// These schemas enforce structured JSON output from the Gemini API.

const RESUME_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        score: { type: Type.NUMBER },
        sections: {
            type: Type.OBJECT,
            properties: {
                contact: { type: Type.BOOLEAN },
                summary: { type: Type.BOOLEAN },
                experience: { type: Type.BOOLEAN },
                education: { type: Type.BOOLEAN },
                skills: { type: Type.BOOLEAN },
            },
            required: ["contact", "summary", "experience", "education", "skills"]
        },
        keywords: {
            type: Type.OBJECT,
            properties: {
                found: { type: Type.ARRAY, items: { type: Type.STRING } },
                missing: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["found", "missing"]
        },
        suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
        parsed_data: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                email: { type: Type.STRING },
                phone: { type: Type.STRING },
                links: { type: Type.ARRAY, items: { type: Type.STRING } },
                experience: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            company: { type: Type.STRING },
                            role: { type: Type.STRING },
                            duration: { type: Type.STRING },
                            description: { type: Type.ARRAY, items: { type: Type.STRING } }
                        }
                    }
                },
                education: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            institution: { type: Type.STRING },
                            degree: { type: Type.STRING },
                            year: { type: Type.STRING }
                        }
                    }
                }
            }
        }
    },
    required: ["score", "sections", "keywords", "suggestions", "parsed_data"]
};

const QUESTIONS_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        questions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.INTEGER },
                    question: { type: Type.STRING },
                    type: { type: Type.STRING, enum: ['behavioral', 'technical', 'situational'] },
                    difficulty: { type: Type.STRING, enum: ['easy', 'medium', 'hard'] }
                },
                required: ["id", "question", "type", "difficulty"]
            }
        }
    },
    required: ["questions"]
};

const EVALUATION_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        score: { type: Type.INTEGER },
        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
        weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
        suggestion: { type: Type.STRING },
        betterAnswer: { type: Type.STRING }
    },
    required: ["score", "strengths", "weaknesses", "suggestion", "betterAnswer"]
};

const ASSESSMENT_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        questions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    text: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctOptionIndex: { type: Type.INTEGER }
                },
                required: ["id", "text", "options", "correctOptionIndex"]
            }
        }
    },
    required: ["questions"]
};

const OUTREACH_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        subject: { type: Type.STRING },
        body: { type: Type.STRING },
        tone: { type: Type.STRING }
    },
    required: ["subject", "body", "tone"]
};

const SKILL_GAP_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        target_role: { type: Type.STRING },
        missing_skills: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    importance: { type: Type.STRING, enum: ["high", "medium", "low"] },
                    description: { type: Type.STRING }
                },
                required: ["name", "importance", "description"]
            }
        },
        resources: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    url: { type: Type.STRING },
                    type: { type: Type.STRING, enum: ["course", "article", "video"] },
                    skill_name: { type: Type.STRING }
                },
                required: ["title", "url", "type"]
            }
        }
    },
    required: ["target_role", "missing_skills", "resources"]
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
 * @param {object} params.job - basic job details (role, skills, experience, location, type, workMode)
 * @param {object} params.companyContext - company context for branding (name, tagline, bio, techStack)
 * @param {string} apiKey
 * @returns {Promise<object>} { jd: string, suggestedSkills: string[], screeningQuestions: object[] }
 */
export const generateJD = async ({ job, companyContext }, apiKey) => {
    const ai = getClient(apiKey);
    const { role, skills, experience, location, type, workMode } = job;
    const { name: companyName, tagline, mission, techStack } = companyContext || {};

    const prompt = `
        As an expert IT recruiter, generate a professional, high-conversion job description and key skills for a ${role}.
        
        CRITICAL RULES:
        1. NO PLACEHOLDERS: NEVER use text like "[Company Name]", "[Insert mission]", or "[About Us]".
        2. USE DATA PROVIDED: If COMPANY CONTEXT is provided, use it EXCLUSIVELY to talk about the company.
        3. IF NO DATA: If a specific company field is missing, infer a professional description based on the ROLE and INDUSTRY, but NEVER leave a bracketed placeholder.

        ${companyName ? `COMPANY CONTEXT:
        - Name: ${companyName}
        - Tagline: ${tagline || 'Not provided'}
        - About/Mission: ${mission || 'Not provided'}
        - Tech Stack: ${Array.isArray(techStack) ? techStack.join(', ') : techStack || 'Not provided'}
        
        Instructions: Strictly use the Name, Tagline, and Mission above to write the "About ${companyName}" section. Do NOT ask the user to fill it in.
        ` : ''}

        JOB DETAILS:
        Position: ${role}
        Location: ${location || 'not specified'}.
        Job Type: ${type || 'not specified'}.
        Work Mode: ${workMode || 'not specified'}.
        Experience level: ${experience || 'not specified'}.
        ${skills ? `Required core skills: ${skills}.` : 'Suggest 5-8 relevant modern skills for this role.'}

        STRUCTURE:
        Generate a JSON response with these keys:
        - "jd": Markdown text. Sections: "About ${companyName || 'Us'}", "The Role", "Responsibilities", "Requirements".
        - "suggestedSkills": String array of technical skills.
        - "screeningQuestions": Array of {question, hint} objects.
    `;

    try {
        const response = await ai.models.generateContent({
            model: DEFAULT_MODELS.FAST,
            systemInstruction: "You are a senior technical recruiter. You always provide complete, ready-to-publish job descriptions. You NEVER use bracketed placeholders or ask the user to insert their own content. You weave provided company details into a compelling narrative.",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                temperature: 0.6
            }
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

/**
 * Analyze Resume using Gemini Multimodal capabilities
 * @param {Array} promptParts - Parts including text or inlineData (base64 PDFs)
 * @param {string} systemPrompt - System instructions
 * @param {string} apiKey 
 * @returns {Promise<object>} Parsed analysis result
 */
export const analyzeResume = async (promptParts, systemPrompt, apiKey) => {
    const ai = getClient(apiKey);

    try {
        const response = await ai.models.generateContent({
            model: DEFAULT_MODELS.FAST,
            systemInstruction: systemPrompt,
            contents: [{ role: 'user', parts: promptParts }],
            config: {
                responseMimeType: "application/json",
                responseSchema: RESUME_SCHEMA,
                temperature: 0.2
            }
        });

        const text = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) throw new Error("Empty response from AI");

        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Error analyzing resume:", error);
        throw new Error("Failed to analyze resume: " + error.message);
    }
};

/**
 * Generate Interview Questions
 * @param {string} prompt 
 * @param {string} apiKey 
 * @returns {Promise<object>} { questions: Array }
 */
export const generateInterviewQuestions = async (prompt, apiKey) => {
    const ai = getClient(apiKey);
    try {
        const response = await ai.models.generateContent({
            model: DEFAULT_MODELS.FAST,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: QUESTIONS_SCHEMA
            }
        });
        const text = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Error generating interview questions:", error);
        throw new Error("Failed to generate questions: " + error.message);
    }
};

/**
 * Evaluate Interview Answer
 * @param {string} prompt 
 * @param {string} apiKey 
 * @returns {Promise<object>} EvaluationResult
 */
export const evaluateInterviewAnswer = async (prompt, apiKey) => {
    const ai = getClient(apiKey);
    try {
        const response = await ai.models.generateContent({
            model: DEFAULT_MODELS.FAST,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: EVALUATION_SCHEMA
            }
        });
        const text = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Error evaluating answer:", error);
        throw new Error("Failed to evaluate answer: " + error.message);
    }
};

/**
 * Generate Skill Assessment MCQs
 * @param {string} skill 
 * @param {string} systemPrompt 
 * @param {string} apiKey 
 * @returns {Promise<object>} { questions: Array }
 */
export const generateSkillAssessment = async (skill, systemPrompt, apiKey) => {
    const ai = getClient(apiKey);
    try {
        const response = await ai.models.generateContent({
            model: DEFAULT_MODELS.FAST,
            systemInstruction: systemPrompt,
            contents: `Generate assessment for skill: ${skill}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: ASSESSMENT_SCHEMA
            }
        });
        const text = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Error generating assessment:", error);
        throw new Error("Failed to generate assessment: " + error.message);
    }
};

/**
 * Generate Personalized Outreach Message
 * @param {string} prompt 
 * @param {string} apiKey 
 * @returns {Promise<object>} { subject, body }
 */
export const generateOutreachMessage = async (prompt, apiKey) => {
    const ai = getClient(apiKey);
    try {
        const response = await ai.models.generateContent({
            model: DEFAULT_MODELS.FAST,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: OUTREACH_SCHEMA
            }
        });
        const text = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Error generating outreach:", error);
        throw new Error("Failed to generate outreach: " + error.message);
    }
};

/**
 * Identify Skill Gaps and Resources
 * @param {string} prompt 
 * @param {string} apiKey 
 * @returns {Promise<object>} { missing_skills, resources }
 */
export const analyzeSkillGap = async (prompt, apiKey) => {
    const ai = getClient(apiKey);
    try {
        const response = await ai.models.generateContent({
            model: DEFAULT_MODELS.FAST,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: SKILL_GAP_SCHEMA
            }
        });
        const text = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Error analyzing skill gap:", error);
        throw new Error("Failed to analyze skill gap: " + error.message);
    }
};
