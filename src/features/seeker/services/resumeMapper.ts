import { serverTimestamp } from "firebase/firestore";
import type { ResumeAnalysisResult } from "../types";

// Inner interfaces for Raw Data (AI Response Schema)
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

interface AIResumeResponse {
    score: number | string;
    sections?: ResumeAnalysisResult['sections'];
    keywords?: ResumeAnalysisResult['keywords'];
    suggestions: string[];
    parsed_data?: RawParsedData;
    // Fallback if AI ignores "parsed_data" wrapper
    name?: string;
    email?: string;
    summary?: string;
    education?: RawEducation[];
    experience?: RawExperience[];
    work_experience?: RawExperience[];
    skills?: string[];
}

export const ResumeMapper = {
    /**
     * Maps the raw AI response to the strict ResumeAnalysisResult domain model.
     * Handles aliases, missing fields, and data normalization.
     */
    mapToDomain(
        user_id: string,
        rawText: string,
        filename: string,
        aiResponse: unknown
    ): ResumeAnalysisResult {
        // Safe Cast
        const data = aiResponse as AIResumeResponse;

        // Normalize Data Access
        // The AI might put data inside 'parsed_data' OR at the top level
        const rawParsed = data.parsed_data ?? (data as RawParsedData);

        const sections = (data.sections ?? {}) as Partial<ResumeAnalysisResult['sections']>;
        const keywords = (data.keywords ?? {}) as Partial<ResumeAnalysisResult['keywords']>;

        // Handle Arrays with fallbacks
        const rawExperience = (rawParsed.experience ?? data.work_experience ?? rawParsed.work_experience ?? data.experience ?? []);
        const rawEducation = (rawParsed.education ?? data.education ?? rawParsed.academic_background ?? []);

        // Normalize Score (0-100)
        let score = 0;
        const rawScore = data.score;
        if (typeof rawScore === 'number') {
            score = rawScore;
        } else if (typeof rawScore === 'string') {
            score = Number(rawScore) || 0;
        }

        // If score is 0.85, treat as 85. If 85, treat as 85.
        if (score > 0 && score <= 1) {
            score = Math.round(score * 100);
        } else {
            score = Math.round(score);
        }

        return {
            user_id,
            raw_text: rawText,
            score,
            sections: {
                contact: !!sections.contact || !!rawParsed.email || !!data.email,
                summary: !!sections.summary || !!data.summary || !!rawParsed.summary,
                experience: !!sections.experience || rawExperience.length > 0,
                education: !!sections.education || rawEducation.length > 0,
                skills: !!sections.skills || !!data.skills || !!rawParsed.skills,
            },
            keywords: {
                found: Array.isArray(keywords.found) ? keywords.found : [],
                missing: Array.isArray(keywords.missing) ? keywords.missing : [],
            },
            suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
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
            filename
        };
    }
};
