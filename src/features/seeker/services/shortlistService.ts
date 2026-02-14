import {
    collection,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    Timestamp,
    doc,
    getDoc,
    addDoc
} from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { EMBEDDING_DIMENSION } from "../../../lib/ai/embedding";
import { JobService } from "../../jobs/services/jobService";
import { callAIProxy } from "../../../lib/ai/proxy";

import type { JobPosting } from "../../jobs/types";
import type { ResumeAnalysisResult, ShortlistedJob, SeekerProfile } from "../types";

const SHORTLIST_COLLECTION = "shortlist";
const RESUMES_SUBCOLLECTION = "resumes";

export interface ShortlistResult {
    jobs: (JobPosting & { matchScore: number; matchReason: string })[];
    isColdStart: boolean;
    lastUpdated: Date | null;
    error?: string;
}

interface EmbeddingResponse {
    embedding?: number[];
}

async function fetchEmbedding(text: string): Promise<number[]> {
    const data = await callAIProxy<EmbeddingResponse>("/api/ai/embedding", { text });
    const embedding = data.embedding;

    if (!Array.isArray(embedding) || embedding.length !== EMBEDDING_DIMENSION || typeof embedding[0] !== "number") {
        console.error(`Invalid embedding received.`);
        throw new Error(`Embedding service returned invalid vector.`);
    }

    return embedding;
}


// Helper: Cosine Similarity
function cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) return 0;
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;
    for (let i = 0; i < vecA.length; i++) {
        const a = vecA[i];
        const b = vecB[i];
        if (a !== undefined && b !== undefined) {
            dotProduct += a * b;
            magnitudeA += a * a;
            magnitudeB += b * b;
        }
    }
    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);
    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    return dotProduct / (magnitudeA * magnitudeB);
}

export const ShortlistService = {
    /**
     * Gets the daily shortlist for a user.
     * Caches the result in Firestore for 24 hours.
     */
    async getDailyShortlist(userId: string): Promise<ShortlistResult> {
        try {
            // 1. Check for cached/existing shortlist for today
            const shortlistRef = collection(db, `users/${userId}/${SHORTLIST_COLLECTION}`);

            // Define "today" as the last 24 hours for simplicity, or strictly calendar day.
            // Using 24h window:
            const oneDayAgo = new Date();
            oneDayAgo.setHours(oneDayAgo.getHours() - 24);

            const q = query(
                shortlistRef,
                where("recommended_at", ">=", Timestamp.fromDate(oneDayAgo)),
                orderBy("recommended_at", "desc"),
                limit(20) // Fetch more to allow for deduplication
            );

            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                // We have recent recommendations.
                const allShortlisted = snapshot.docs.map(doc => doc.data() as ShortlistedJob);

                // Deduplicate by job_id (taking the most recent one due to orderBy desc)
                const uniqueJobIds = new Set<string>();
                const shortlistedJobs: ShortlistedJob[] = [];

                for (const sj of allShortlisted) {
                    if (!uniqueJobIds.has(sj.job_id)) {
                        uniqueJobIds.add(sj.job_id);
                        shortlistedJobs.push(sj);
                        if (shortlistedJobs.length >= 5) break; // Keep only top 5 unique
                    }
                }

                // Hydrate them with Job details.
                const hydratedJobs = [];
                for (const sj of shortlistedJobs) {
                    try {
                        const job = await JobService.getJobById(sj.job_id);
                        if (job?.status === 'active') {
                            hydratedJobs.push({
                                ...job,
                                matchScore: sj.score,
                                matchReason: sj.reason
                            });
                        }
                    } catch (jobError) {
                        console.warn(`Could not hydrate shortlisted job ${sj.job_id}:`, jobError);
                    }
                }

                // If we have at least 1 valid job, return it. If jobs expired, we might need to regenerate.
                if (hydratedJobs.length > 0) {
                    const firstShortlisted = shortlistedJobs[0];
                    return {
                        jobs: hydratedJobs,
                        isColdStart: false,
                        lastUpdated: (firstShortlisted && firstShortlisted.recommended_at instanceof Timestamp)
                            ? firstShortlisted.recommended_at.toDate()
                            : new Date()
                    };
                }
            }

            // 2. No fresh shortlist found. Generate new one.
            return await this.generateShortlist(userId);

        } catch (error) {
            console.error("Error fetching daily shortlist:", error);
            // Fallback to cold start on error to be safe
            return {
                jobs: [],
                isColdStart: true,
                lastUpdated: null,
                error: error instanceof Error ? error.message : "Unknown error"
            };
        }
    },

    /**
     * Generates a new shortlist by matching user profile/resume against active jobs.
     */
    async generateShortlist(userId: string): Promise<ShortlistResult> {
        // 1. Get User's Latest Context (Profile or Resume)
        const profileRef = doc(db, "seeker_profiles", userId);
        const profileSnap = await getDoc(profileRef);
        const profileData = profileSnap.exists() ? profileSnap.data() as SeekerProfile : null;

        let summary = "";
        let resumeData: ResumeAnalysisResult | null = null;

        if (profileData && profileData.preferences.roles.length > 0) {
            // Priority 1: Use Profile Data
            const skills = profileData.skills.join(", ");
            const roles = profileData.preferences.roles.join(", ");
            const bio = profileData.bio ?? "";
            summary = `
                Profile for matching:
                Target Roles: ${roles}
                Key Skills: ${skills}
                Background: ${bio}
            `.trim();
        } else {
            // Priority 2: Fallback to Latest Resume
            const resumesRef = collection(db, `users/${userId}/${RESUMES_SUBCOLLECTION}`);
            const resumeQuery = query(resumesRef, orderBy("analyzed_at", "desc"), limit(1));
            const resumeSnap = await getDocs(resumeQuery);

            if (resumeSnap.empty) {
                return { jobs: [], isColdStart: true, lastUpdated: null };
            }

            const firstResumeDoc = resumeSnap.docs[0];
            if (!firstResumeDoc) {
                return { jobs: [], isColdStart: true, lastUpdated: null };
            }

            resumeData = firstResumeDoc.data() as ResumeAnalysisResult;
            const skills = resumeData.keywords.found.join(", ");
            const roles = resumeData.parsed_data.experience?.map(e => e.role).join(" ") ?? "";
            summary = `
                Resume Summary for matching:
                Skills: ${skills}
                Experience Roles: ${roles}
                Suggestions: ${resumeData.suggestions.join(" ")}
            `.trim();
        }

        // 3. Generate User Embedding
        const userEmbedding = await fetchEmbedding(summary);

        // 4. Fetch Active Jobs (Candidate Pool)
        const jobsRef = collection(db, "jobs");
        const jobsQuery = query(
            jobsRef,
            where("status", "==", "active"),
            orderBy("created_at", "desc"),
            limit(50)
        );
        const jobsSnap = await getDocs(jobsQuery);
        const candidates = jobsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as JobPosting));

        // 5. Score Candidates
        const scoredJobs = candidates
            .filter(job => job.embedding && job.embedding.length > 0)
            .map(job => {
                const embedding = job.embedding ?? [];
                const score = cosineSimilarity(userEmbedding, embedding);
                const matchContext = profileData ?? resumeData;
                if (!matchContext) throw new Error("No user context for matching");

                return {
                    ...job,
                    matchScore: score,
                    matchReason: this.generateMatchReason(score, job, matchContext)
                };
            })
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 5); // Top 5

        // ... rest of the function for saving to Firestore remains similar but updated for context
        const batchPromises = scoredJobs.map(job => {
            return addDoc(collection(db, `users/${userId}/${SHORTLIST_COLLECTION}`), {
                user_id: userId,
                job_id: job.id,
                score: job.matchScore,
                reason: job.matchReason,
                recommended_at: serverTimestamp()
            });
        });

        await Promise.all(batchPromises);

        return {
            jobs: scoredJobs,
            isColdStart: false,
            lastUpdated: new Date()
        };
    },

    generateMatchReason(score: number, job: JobPosting, context: SeekerProfile | ResumeAnalysisResult): string {
        // Simple heuristic for "Why this matches"
        if (score > 0.85) return "Excellent match based on your skills and professional goals.";
        if (score > 0.75) return "Strong match for your defined preferences.";

        const jobSkills = job.skills.map((s: string) => s.toLowerCase());

        let userSkills: string[] = [];
        if ('skills' in context) {
            userSkills = context.skills.map((s: string) => s.toLowerCase());
        } else if ('keywords' in context) {
            userSkills = context.keywords.found.map((s: string) => s.toLowerCase());
        }

        const overlap = jobSkills.filter(s => userSkills.includes(s));

        if (overlap.length > 0) {
            return `Matches your skills in ${overlap.slice(0, 3).join(", ")}.`;
        }

        return "Aligned with your target role and industry focus.";
    }
};
