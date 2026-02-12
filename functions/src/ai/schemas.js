import { SchemaType } from "./config.js";

export const RESUME_SCHEMA = {
    type: SchemaType.OBJECT,
    properties: {
        score: { type: SchemaType.NUMBER },
        sections: {
            type: SchemaType.OBJECT,
            properties: {
                contact: { type: SchemaType.BOOLEAN },
                summary: { type: SchemaType.BOOLEAN },
                experience: { type: SchemaType.BOOLEAN },
                education: { type: SchemaType.BOOLEAN },
                skills: { type: SchemaType.BOOLEAN },
            },
            required: ["contact", "summary", "experience", "education", "skills"]
        },
        keywords: {
            type: SchemaType.OBJECT,
            properties: {
                found: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                missing: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            },
            required: ["found", "missing"]
        },
        suggestions: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        parsed_data: {
            type: SchemaType.OBJECT,
            properties: {
                name: { type: SchemaType.STRING },
                email: { type: SchemaType.STRING },
                phone: { type: SchemaType.STRING },
                links: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                experience: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            company: { type: SchemaType.STRING },
                            role: { type: SchemaType.STRING },
                            duration: { type: SchemaType.STRING },
                            description: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
                        }
                    }
                },
                education: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            institution: { type: SchemaType.STRING },
                            degree: { type: SchemaType.STRING },
                            year: { type: SchemaType.STRING }
                        }
                    }
                }
            }
        }
    },
    required: ["score", "sections", "keywords", "suggestions", "parsed_data"]
};

export const SKILL_GAP_SCHEMA = {
    type: SchemaType.OBJECT,
    properties: {
        target_role: { type: SchemaType.STRING },
        missing_skills: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    name: { type: SchemaType.STRING },
                    importance: { type: SchemaType.STRING, enum: ["high", "medium", "low"] },
                    description: { type: SchemaType.STRING }
                },
                required: ["name", "importance", "description"]
            }
        },
        resources: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    title: { type: SchemaType.STRING },
                    url: { type: SchemaType.STRING },
                    type: { type: SchemaType.STRING, enum: ["course", "article", "video"] },
                    skill_name: { type: SchemaType.STRING }
                },
                required: ["title", "url", "type"]
            }
        }
    },
    required: ["target_role", "missing_skills", "resources"]
};

export const QUESTIONS_SCHEMA = {
    type: SchemaType.OBJECT,
    properties: {
        questions: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    id: { type: SchemaType.INTEGER },
                    question: { type: SchemaType.STRING },
                    type: { type: SchemaType.STRING, enum: ['behavioral', 'technical', 'situational'] },
                    difficulty: { type: SchemaType.STRING, enum: ['easy', 'medium', 'hard'] }
                },
                required: ["id", "question", "type", "difficulty"]
            }
        }
    },
    required: ["questions"]
};

export const EVALUATION_SCHEMA = {
    type: SchemaType.OBJECT,
    properties: {
        score: { type: SchemaType.INTEGER },
        strengths: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        weaknesses: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        suggestion: { type: SchemaType.STRING },
        betterAnswer: { type: SchemaType.STRING }
    },
    required: ["score", "strengths", "weaknesses", "suggestion", "betterAnswer"]
};

export const ASSESSMENT_SCHEMA = {
    type: SchemaType.OBJECT,
    properties: {
        questions: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    id: { type: SchemaType.STRING },
                    text: { type: SchemaType.STRING },
                    options: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                    correctOptionIndex: { type: SchemaType.INTEGER }
                },
                required: ["id", "text", "options", "correctOptionIndex"]
            }
        }
    },
    required: ["questions"]
};

export const OUTREACH_SCHEMA = {
    type: SchemaType.OBJECT,
    properties: {
        subject: { type: SchemaType.STRING },
        body: { type: SchemaType.STRING },
        tone: { type: SchemaType.STRING }
    },
    required: ["subject", "body", "tone"]
};
