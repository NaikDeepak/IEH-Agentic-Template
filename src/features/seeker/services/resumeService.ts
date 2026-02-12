import { db } from "../../../lib/firebase";
import { doc, setDoc, serverTimestamp, collection, query, limit, getDocs, orderBy, Timestamp } from "firebase/firestore";
import type { ResumeAnalysisResult } from "../types";
import { callAIProxy } from "../../../lib/ai/proxy";
import { parseDocx, preparePdf } from "./documentService";
import { ProfileService } from "./profileService";

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

        EVALUATION CRITERIA:
        1. ATS Score (0-100): An integer score based on formatting, keyword density, measurable results, and clarity.
        2. Section Completeness: Check for the presence of Contact, Summary, Experience, Education, and Skills.
        3. Keywords: Identify strong industry keywords present and critical missing ones.
        4. Suggestions: 3-5 actionable tips to improve the resume.
        5. Parsed Data: Extract structured data including Name, Contact Info, Experience (Company, Role, Duration, Description), and Education.

        Be strict but constructive. Return ONLY a valid JSON object.
        `;

        // 3. Generate Content via Proxy
        const analysisData = await callAIProxy<ResumeAnalysisResponse>('/api/ai/analyze-resume', {
            promptParts,
            systemPrompt
        });

        // Debug: Log the raw data received from the AI (useful for debugging schema mismatches)
        console.warn('[resumeService] AI analysis raw data:', JSON.stringify(analysisData, null, 2));

        // 4. Construct Result Object with Robust Defensive Mapping & Alias Support
        // The AI might return fields with slightly different names
        interface RawExperience {
            company?: string;
            organization?: string;
            role?: string;
            title?: string;
            job_title?: string;
            duration?: string;
            dates?: string;
            description?: string | string[];
            responsibilities?: string | string[];
        }

        interface RawEducation {
            institution?: string;
            university?: string;
            school?: string;
            degree?: string;
            qualification?: string;
            year?: string;
            dates?: string;
            start_date?: string;
            end_date?: string;
        }

        interface RawParsedData {
            name?: string;
            full_name?: string;
            email?: string;
            phone?: string;
            contact_number?: string;
            links?: string[];
            social_links?: string[];
            summary?: string;
            skills?: string[];
            experience?: RawExperience[];
            work_experience?: RawExperience[];
            education?: RawEducation[];
            academic_background?: RawEducation[];
        }


        const rawData = analysisData as unknown as (RawParsedData & { parsed_data?: RawParsedData });
        const rawParsed = rawData.parsed_data ?? rawData;
        const rawExperience = (rawParsed.experience ?? rawData.work_experience ?? rawParsed.work_experience ?? rawData.experience ?? []);
        const rawEducation = (rawParsed.education ?? rawData.education ?? rawParsed.academic_background ?? []);

        const analysisResult: ResumeAnalysisResult = {
            user_id,
            raw_text: rawText,
            // Normalize score: AI might return 0.85 or 85. We want 0-100.
            score: (() => {
                const s = typeof analysisData.score === 'number' ? analysisData.score : (Number(analysisData.score) || 0);
                if (s > 0 && s <= 1) return Math.round(s * 100);
                return Math.round(s);
            })(),
            sections: {
                contact: analysisData.sections.contact || !!rawParsed.email || !!rawData.email,
                summary: analysisData.sections.summary || !!rawData.summary || !!rawParsed.summary,
                experience: analysisData.sections.experience || rawExperience.length > 0,
                education: analysisData.sections.education || rawEducation.length > 0,
                skills: analysisData.sections.skills || !!rawData.skills || !!rawParsed.skills,
            },
            keywords: {
                found: Array.isArray(analysisData.keywords.found) ? analysisData.keywords.found : [],
                missing: Array.isArray(analysisData.keywords.missing) ? analysisData.keywords.missing : [],
            },
            suggestions: Array.isArray(analysisData.suggestions) ? analysisData.suggestions : [],
            parsed_data: {
                name: rawParsed.name ?? rawParsed.full_name ?? "",
                email: rawParsed.email ?? "",
                phone: rawParsed.phone ?? rawParsed.contact_number ?? "",
                links: Array.isArray(rawParsed.links) ? rawParsed.links : (Array.isArray(rawParsed.social_links) ? rawParsed.social_links : []),
                experience: rawExperience.map((exp) => ({
                    company: exp.company ?? exp.organization ?? "",
                    role: exp.role ?? exp.title ?? exp.job_title ?? "",
                    duration: exp.duration ?? exp.dates ?? "",
                    description: Array.isArray(exp.description) ? exp.description :
                        (Array.isArray(exp.responsibilities) ? exp.responsibilities :
                            (typeof exp.description === 'string' ? [exp.description] :
                                (typeof exp.responsibilities === 'string' ? [exp.responsibilities] : [])))
                })),
                education: rawEducation.map((edu) => ({
                    institution: edu.institution ?? edu.university ?? edu.school ?? "",
                    degree: edu.degree ?? edu.qualification ?? "",
                    year: edu.year ?? edu.dates ?? edu.start_date ?? edu.end_date ?? ""
                })),
            },
            analyzed_at: serverTimestamp(),
            filename: content instanceof File ? content.name : (typeof content === 'string' ? "Text Input" : "Unknown")
        };

        // 5. Persist to Firestore
        const resumeRef = doc(collection(db, `users/${user_id}/resumes`));
        const finalResult = { ...analysisResult, id: resumeRef.id };

        await setDoc(resumeRef, finalResult);

        // 6. Sync to Seeker Profile
        await ProfileService.syncFromResume(user_id, finalResult);

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
        const q = query(resumesRef, orderBy('analyzed_at', 'desc'), limit(10));
        let snapshot = await getDocs(q);

        // Fallback: If ordered query returns nothing, try unordered (might be missing analyzed_at)
        if (snapshot.empty) {
            snapshot = await getDocs(query(resumesRef, limit(10)));
        }

        if (snapshot.empty) return null;

        // Find the first valid doc (skip those with broken [object Object] timestamps from previous bug)
        const validDoc = snapshot.docs.find(doc => {
            const d = doc.data();
            // A valid Firestore timestamp object has a toDate method
            const analyzedAt = d['analyzed_at'] as Timestamp | undefined;
            return analyzedAt && typeof analyzedAt === 'object' && typeof (analyzedAt as { toDate: () => unknown }).toDate === 'function';
        });

        if (!validDoc) return null;

        const data = validDoc.data();

        // On-the-fly normalization for existing data
        const rawScore = data['score'] as number | string | undefined;
        let score = typeof rawScore === 'number' ? rawScore : (Number(rawScore) || 0);
        if (score > 0 && score <= 1) score = Math.round(score * 100);
        else score = Math.round(score);

        return { id: validDoc.id, ...data, score } as ResumeAnalysisResult;
    } catch (error) {
        console.error("Error fetching latest resume:", error);
        return null;
    }
};
