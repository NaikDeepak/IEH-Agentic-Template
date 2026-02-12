import { db } from "../../../lib/firebase";
import { doc, setDoc, serverTimestamp, collection, query, limit, getDocs } from "firebase/firestore";
import type { ResumeAnalysisResult } from "../types";
import { callAIProxy } from "../../../lib/ai/proxy";
import { parseDocx, preparePdf } from "./documentService";

interface ResumeAnalysisResponse {
    score: number;
    sections: ResumeAnalysisResult['sections'];
    keywords: ResumeAnalysisResult['keywords'];
    suggestions: string[];
    parsed_data: ResumeAnalysisResult['parsed_data'];
}

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

        // 3. Generate Content via Proxy
        const analysisData = await callAIProxy<ResumeAnalysisResponse>('/api/ai/analyze-resume', {
            promptParts,
            systemPrompt
        });

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
        const resumeRef = doc(collection(db, `users/${user_id}/resumes`));
        const finalResult = { ...analysisResult, id: resumeRef.id };
        await setDoc(resumeRef, finalResult);

        // 6. Sync to Seeker Profile
        try {
            const { ProfileService } = await import("./profileService");
            await ProfileService.syncFromResume(user_id, finalResult);
        } catch (syncError) {
            console.error("Failed to sync profile from resume:", syncError);
            // Don't fail the whole analysis if sync fails
        }

        return finalResult;

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
        const q = query(resumesRef, limit(1));
        const snapshot = await getDocs(q);

        if (snapshot.empty) return null;
        const firstDoc = snapshot.docs[0];
        if (!firstDoc) return null;
        const data = firstDoc.data();
        return { id: firstDoc.id, ...data } as ResumeAnalysisResult;
    } catch (error) {
        console.error("Error fetching latest resume:", error);
        return null;
    }
};
