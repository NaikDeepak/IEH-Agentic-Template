import {
    collection,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    Timestamp,
    addDoc
} from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { EMBEDDING_DIMENSION } from "../../../lib/ai/embedding";
import { JobService } from "../../jobs/services/jobService";
import type { JobPosting } from "../../jobs/types";
import type { ResumeAnalysisResult, ShortlistedJob } from "../types";

const SHORTLIST_COLLECTION = "shortlist";
const RESUMES_SUBCOLLECTION = "resumes";

export interface ShortlistResult {
    jobs: (JobPosting & { matchScore: number; matchReason: string })[];
    isColdStart: boolean;
    lastUpdated: Date | null;
}

interface EmbeddingResponse {
    embedding?: number[];
}

async function fetchEmbedding(text: string): Promise<number[]> {
    const res = await fetch("/api/ai/embedding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
    });

    if (!res.ok) {
        throw new Error(`Embedding service failed: ${res.status.toString()}`);
    }

    const data = (await res.json()) as EmbeddingResponse;
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
        dotProduct += vecA[i] * vecB[i];
        magnitudeA += vecA[i] * vecA[i];
        magnitudeB += vecB[i] * vecB[i];
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
                limit(5)
            );

            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                // We have recent recommendations. Hydrate them with Job details.
                const shortlistedJobs = snapshot.docs.map(doc => doc.data() as ShortlistedJob);

                // Fetch job details (this could be optimized with a batched fetch or storing job snapshot)
                // For MVP, fetching individually or assuming we have them is okay.
                // Let's fetch them to ensure they are still active/exist.
                const hydratedJobs = [];
                for (const sj of shortlistedJobs) {
                    const job = await JobService.getJobById(sj.job_id);
                    if (job?.status === 'active') {
                        hydratedJobs.push({
                            ...job,
                            matchScore: sj.score,
                            matchReason: sj.reason
                        });
                    }
                }

                // If we have at least 1 valid job, return it. If jobs expired, we might need to regenerate.
                if (hydratedJobs.length > 0) {
                    return {
                        jobs: hydratedJobs,
                        isColdStart: false,
                        lastUpdated: shortlistedJobs[0].recommended_at instanceof Timestamp
                            ? shortlistedJobs[0].recommended_at.toDate()
                            : new Date()
                    };
                }
            }

            // 2. No fresh shortlist found. Generate new one.
            return await this.generateShortlist(userId);

        } catch (error) {
            console.error("Error fetching daily shortlist:", error);
            // Fallback to cold start on error to be safe
            return { jobs: [], isColdStart: true, lastUpdated: null };
        }
    },

    /**
     * Generates a new shortlist by matching user profile/resume against active jobs.
     */
    async generateShortlist(userId: string): Promise<ShortlistResult> {
        // 1. Get User's Latest Resume
        const resumesRef = collection(db, `users/${userId}/${RESUMES_SUBCOLLECTION}`);
        const resumeQuery = query(resumesRef, orderBy("analyzed_at", "desc"), limit(1));
        const resumeSnap = await getDocs(resumeQuery);

        if (resumeSnap.empty) {
            return { jobs: [], isColdStart: true, lastUpdated: null };
        }

        const resumeData = resumeSnap.docs[0].data() as ResumeAnalysisResult;

        // 2. Create a semantic query from the resume
        // We want to capture the user's essence: Title/Role, Skills, Experience
        const skills = resumeData.keywords.found.join(", ");
        // Use parsed data if available, otherwise fallback
        const roles = resumeData.parsed_data.experience?.map(e => e.role).join(" ") ?? "";
        const summary = `
            Resume Summary for matching:
            Skills: ${skills}
            Experience Roles: ${roles}
            Suggestions: ${resumeData.suggestions.join(" ")}
        `.trim();

        // 3. Generate User Embedding
        const userEmbedding = await fetchEmbedding(summary);

        // 4. Fetch Active Jobs (Candidate Pool)
        // Optimization: In a real app, use vector search (Vector Store) or limit candidates.
        // For MVP, fetch recent active jobs (e.g., last 50).
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
                return {
                    ...job,
                    matchScore: score,
                    matchReason: this.generateMatchReason(score, job, resumeData)
                };
            })
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 5); // Top 5

        // 6. Save to Firestore (Shortlist)
        // Delete old shortlist? Or just append. We filtered by date in getDailyShortlist.
        // Let's add new entries.
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

    generateMatchReason(score: number, job: JobPosting, resume: ResumeAnalysisResult): string {
        // Simple heuristic for "Why this matches"
        if (score > 0.85) return "Excellent match based on your skills and experience.";
        if (score > 0.75) return "Strong match for your skill profile.";

        // Try to find overlapping skills
        const jobSkills = job.skills.map(s => s.toLowerCase());
        const userSkills = resume.keywords.found.map(s => s.toLowerCase());
        const overlap = jobSkills.filter(s => userSkills.includes(s));

        if (overlap.length > 0) {
            return `Matches your skills in ${overlap.slice(0, 3).join(", ")}.`;
        }

        return "Based on your general profile.";
    }
};
