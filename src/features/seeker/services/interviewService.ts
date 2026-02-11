import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
const API_KEY = (import.meta.env['VITE_GEMINI_API_KEY'] as string) || "";
const genAI = new GoogleGenAI({ apiKey: API_KEY });

// Schema types as string constants since they are not exported by the SDK
const SchemaType = {
    STRING: "STRING",
    NUMBER: "NUMBER",
    INTEGER: "INTEGER",
    BOOLEAN: "BOOLEAN",
    ARRAY: "ARRAY",
    OBJECT: "OBJECT"
};

export interface InterviewQuestion {
    id: number;
    question: string;
    type: 'behavioral' | 'technical' | 'situational';
    difficulty: 'easy' | 'medium' | 'hard';
}

export interface EvaluationResult {
    score: number;
    strengths: string[];
    weaknesses: string[];
    suggestion: string;
    betterAnswer: string;
}

const QUESTIONS_SCHEMA = {
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

const EVALUATION_SCHEMA = {
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

export const generateQuestions = async (
    role: string,
    resumeContext?: string
): Promise<InterviewQuestion[]> => {
    try {
        const prompt = `
            Generate 5 interview questions for a ${role} position.
            ${resumeContext ? `Based on this resume context: ${resumeContext.substring(0, 5000)}...` : ''}

            Include a mix of behavioral, technical, and situational questions.
            Vary the difficulty.
        `;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const result = await genAI.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                responseMimeType: "application/json",
                responseSchema: QUESTIONS_SCHEMA,
            }
        }) as any; // eslint-disable-line @typescript-eslint/no-explicit-any

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const responseText = result.text() as string;
        if (!responseText) throw new Error("No response from AI");

        const data = JSON.parse(responseText) as { questions: InterviewQuestion[] };
        return data.questions;
    } catch (error) {
        console.error("Error generating questions:", error);
        throw error;
    }
};

export const evaluateAnswer = async (
    question: string,
    answer: string,
    role: string
): Promise<EvaluationResult> => {
    try {
        const prompt = `
            You are an expert interviewer for a ${role} position.

            Question: "${question}"
            Candidate Answer: "${answer}"

            Evaluate the answer. Provide a score (0-100), list strengths and weaknesses,
            give a specific suggestion for improvement, and provide a better version of the answer.
        `;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const result = await genAI.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                responseMimeType: "application/json",
                responseSchema: EVALUATION_SCHEMA,
            }
        }) as any; // eslint-disable-line @typescript-eslint/no-explicit-any

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const responseText = result.text() as string;
        if (!responseText) throw new Error("No response from AI");

        return JSON.parse(responseText) as EvaluationResult;
    } catch (error) {
        console.error("Error evaluating answer:", error);
        throw error;
    }
};
