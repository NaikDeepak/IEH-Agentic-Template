import { GoogleGenAI } from "@google/genai";
import { db } from "../../../lib/firebase";
import { doc, setDoc, serverTimestamp, collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import type { ResumeAnalysisResult } from "../types";
import { parseDocx, preparePdf } from "./documentService";

// Initialize Gemini
// Note: In a production environment, this should be proxied through a backend/Cloud Function to protect the API key.
const API_KEY = (import.meta.env.VITE_GEMINI_API_KEY as string) || "";
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

interface AIAnalysisResponse {
    score: number;
    sections: {
        contact: boolean;
        summary: boolean;
        experience: boolean;
        education: boolean;
        skills: boolean;
    };
    keywords: {
        found: string[];
        missing: string[];
    };
    suggestions: string[];
    parsed_data: {
        name?: string;
        email?: string;
        phone?: string;
        links?: string[];
        experience?: {
            company: string;
            role: string;
            duration: string;
            description: string[];
        }[];
        education?: {
            institution: string;
            degree: string;
            year: string;
        }[];
    };
}

const RESUME_SCHEMA = {
    type: SchemaType.OBJECT,
    properties: {
        score: { type: SchemaType.NUMBER, description: "Overall ATS score from 0-100" },
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
        suggestions: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: "List of actionable improvements"
        },
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

export const analyzeResume = async (
    user_id: string,
    content: File | string,
    inputType: 'file' | 'text' | 'linkedin'
): Promise<ResumeAnalysisResult> => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const promptParts: any[] = [];
        let rawText = "";

        // 1. Prepare Content
        if (inputType === 'text' && typeof content === 'string') {
            rawText = content;
            promptParts.push({ text: `Analyze this resume text:\n${content}` });
        } else if (content instanceof File) {
            if (content.type === 'application/pdf') {
                const { base64, mimeType } = await preparePdf(content);
                promptParts.push({
                    inlineData: {
                        data: base64,
                        mimeType: mimeType
                    }
                });
                promptParts.push({ text: "Analyze this resume PDF." });
            } else if (content.name.endsWith('.docx')) {
                rawText = await parseDocx(content);
                promptParts.push({ text: `Analyze this resume text extracted from DOCX:\n${rawText}` });
            } else {
                throw new Error("Unsupported file type");
            }
        }

        // 2. System Prompt
        const systemPrompt = `
        You are an expert ATS (Applicant Tracking System) and Resume Coach.
        Analyze the provided resume and return a structured JSON response.

        Evaluate:
        1. ATS Score (0-100): Based on formatting, keyword density, measurable results, and clarity.
        2. Section Completeness: Check for Contact, Summary, Experience, Education, Skills.
        3. Keywords: Identify strong industry keywords present and critical missing ones (assume general tech/industry standards based on the content).
        4. Suggestions: 3-5 actionable tips to improve the resume.
        5. Parsed Data: Extract structured data (Name, Contact, Experience, Education).

        Be strict but constructive.
        `;

        // 3. Generate Content
        // Using the v1beta GoogleGenAI SDK format
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const result = await genAI.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [{ role: "user", parts: promptParts }],
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
                responseSchema: RESUME_SCHEMA,
            }
        }) as any; // eslint-disable-line @typescript-eslint/no-explicit-any

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const responseText = result.text() as string;
        if (!responseText) throw new Error("No response from AI");

        const analysisData = JSON.parse(responseText) as AIAnalysisResponse;

        // 4. Construct Result Object
        const analysisResult: ResumeAnalysisResult = {
            user_id,
            raw_text: rawText, // Store raw text if available/extracted
            score: analysisData.score,
            sections: analysisData.sections,
            keywords: analysisData.keywords,
            suggestions: analysisData.suggestions,
            parsed_data: analysisData.parsed_data,
            analyzed_at: serverTimestamp(),
            // Add metadata
            filename: content instanceof File ? content.name : undefined
        };

        // 5. Persist to Firestore
        // Use a new document ID or a fixed 'current' if we only want one active resume.
        // For now, let's create a new entry in the subcollection.
        const resumeRef = doc(collection(db, `users/${user_id}/resumes`));
        await setDoc(resumeRef, {
            ...analysisResult,
            id: resumeRef.id
        });

        return { ...analysisResult, id: resumeRef.id };

    } catch (error: unknown) {
        console.error("Resume Analysis Error:", error instanceof Error ? error.message : String(error));
        throw error;
    }
};

/**
 * Fetches the most recent resume analysis for a user.
 */
export const getLatestResume = async (userId: string): Promise<ResumeAnalysisResult | null> => {
    try {
        const resumesRef = collection(db, `users/${userId}/resumes`);
        const q = query(resumesRef, orderBy("analyzed_at", "desc"), limit(1));
        const snapshot = await getDocs(q);

        if (snapshot.empty) return null;
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as ResumeAnalysisResult;
    } catch (error) {
        console.error("Error fetching latest resume:", error);
        return null;
    }
};
