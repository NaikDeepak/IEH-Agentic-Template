import { db } from "../../../lib/firebase";
import { doc, setDoc, collection, query, orderBy, limit, getDocs, Timestamp } from "firebase/firestore";
import type { ResumeAnalysisResult } from "../types";
import { callAIProxy } from "../../../lib/ai/proxy";
import { parseDocx, preparePdf } from "./documentService";
import { ProfileService } from "./profileService";
import * as Sentry from "@sentry/react";
import { ResumeMapper } from "./resumeMapper";

/**
 * Robust helper to extract a nested object property safely.
 */
function getNestedValue<T>(data: Record<string, unknown>, parentKey: string, childKey: string, fallback: T): T {
    const parent = data[parentKey];
    if (parent && typeof parent === "object") {
        const val = (parent as Record<string, unknown>)[childKey];
        if (val !== undefined && val !== null) {
            if (Array.isArray(fallback) && Array.isArray(val)) return val as unknown as T;
            if (typeof fallback === typeof val) return val as unknown as T;
        }
    }
    return fallback;
}

// Helper Type for GenAI Parts
type PromptPart = { text: string } | { inlineData: { data: string; mimeType: string } };

export const analyzeResume = async (
    user_id: string,
    content: File | string,
    inputType: 'file' | 'text' | 'linkedin'
): Promise<ResumeAnalysisResult> => {
    return Sentry.startSpan({ name: "analyzeResume", op: "ai.process" }, async (span) => {
        try {
            const promptParts: PromptPart[] = [];
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

            span.setAttribute("input_type", inputType);
            span.setAttribute("file_size", content instanceof File ? content.size : content.length);

            // 2. System Prompt
            const systemPrompt = `
            You are an expert ATS (Applicant Tracking System) and Resume Coach.
            Analyze the provided resume and return a structured JSON response.

            EVALUATION CRITERIA:
            1. ATS Score (0-100): An integer score based on formatting, keyword density, measurable results, and clarity.
            2. Section Completeness: Check for the presence of Contact, Summary, Experience, Education, and Skills.
            3. Keywords: Identify strong industry keywords present and critical missing ones.
            4. Suggestions: 3-5 actionable tips to improve the resume.
            5. Parsed Data: Extract structured data including Name, Contact Info, Experience (Company, Role, Duration, Description), and Education.

            SKILL EXTRACTION RULES (strictly enforced):
            - Only extract skills the candidate explicitly claims as their own (Skills section, summary, or "proficient in / experienced with" statements).
            - Do NOT include skills mentioned only in job requirement bullets, company descriptions, or project context where the candidate is describing their employer's stack rather than their personal expertise.
            - Do NOT include soft skills like "communication", "teamwork", or "leadership" unless the candidate has listed them explicitly.
            - Deduplicate and normalise (e.g. "ReactJS" → "React", "node" → "Node.js").
            - Return a maximum of 25 skills ordered by relevance.

            Be strict but constructive. Return ONLY a valid JSON object.
            `;

            // 3. Generate Content via Proxy
            // We use unknown here because we validate/map it immediately after
            const rawResponse = await callAIProxy('/api/ai/analyze-resume', {
                promptParts,
                systemPrompt
            });

            // 4. Map to Domain Model (SRP: delegated to Mapper)
            const filename = content instanceof File ? content.name : (typeof content === 'string' ? "Text Input" : "Unknown");
            const analysisResult = ResumeMapper.mapToDomain(user_id, rawText, filename, rawResponse);

            // 5. Persist to Firestore
            const resumeRef = doc(collection(db, `users/${user_id}/resumes`));
            const finalResult = { ...analysisResult, id: resumeRef.id };

            await setDoc(resumeRef, finalResult);

            // 6. Sync to Seeker Profile
            await ProfileService.syncFromResume(user_id, finalResult);

            return finalResult;

        } catch (error) {
            console.error("Resume Analysis Error:", error);
            Sentry.captureException(error);
            throw error;
        }
    });
};

/**
 * Fetches the most recent resume analysis for a user.
 */
export const getLatestResume = async (userId: string): Promise<ResumeAnalysisResult | null> => {
    try {
        const resumesRef = collection(db, `users/${userId}/resumes`);
        const q = query(resumesRef, orderBy('analyzed_at', 'desc'), limit(10));
        let snapshot = await getDocs(q);

        // Fallback: If ordered query returns nothing, try unordered (might be missing analyzed_at)
        if (snapshot.empty) {
            snapshot = await getDocs(query(resumesRef, limit(10)));
        }

        if (snapshot.empty) return null;

        // Find the first valid doc (skip those with broken [object Object] timestamps from previous bug)
        const validDoc = snapshot.docs.find(doc => {
            const d = doc.data() as Record<string, unknown>;
            // A valid Firestore timestamp object has a toDate method
            const analyzedAt = d['analyzed_at'] as Timestamp | undefined;
            return analyzedAt && typeof analyzedAt === 'object' && typeof (analyzedAt as { toDate: () => unknown }).toDate === 'function';
        });

        if (!validDoc) return null;

        const data = validDoc.data() as Record<string, unknown>;

        // On-the-fly normalization for existing data
        const rawScore = data['score'] as number | string | undefined;
        let score = typeof rawScore === 'number' ? rawScore : (Number(rawScore) || 0);
        if (score > 0 && score <= 1) score = Math.round(score * 100);
        else score = Math.round(score);

        return {
            id: validDoc.id,
            user_id: userId,
            ...data,
            score,
            sections: {
                contact: getNestedValue<boolean>(data, 'sections', 'contact', false),
                summary: getNestedValue<boolean>(data, 'sections', 'summary', false),
                experience: getNestedValue<boolean>(data, 'sections', 'experience', false),
                education: getNestedValue<boolean>(data, 'sections', 'education', false),
                skills: getNestedValue<boolean>(data, 'sections', 'skills', false),
            },
            keywords: {
                found: getNestedValue<string[]>(data, 'keywords', 'found', []),
                missing: getNestedValue<string[]>(data, 'keywords', 'missing', []),
            },
            parsed_data: {
                experience: getNestedValue<NonNullable<ResumeAnalysisResult['parsed_data']>['experience']>(data, 'parsed_data', 'experience', []),
                education: getNestedValue<NonNullable<ResumeAnalysisResult['parsed_data']>['education']>(data, 'parsed_data', 'education', []),
            },
            suggestions: Array.isArray(data['suggestions']) ? data['suggestions'] : []
        } as unknown as ResumeAnalysisResult;
    } catch (error) {
        console.error("Error fetching latest resume:", error);
        return null;
    }
};
