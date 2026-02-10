import {
    collection,
    addDoc,
    serverTimestamp,
    doc,
    updateDoc,
    getDoc,
    query,
    where,
    orderBy,
    getDocs,
    limit,
    Timestamp
} from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { EMBEDDING_DIMENSION } from "../../../lib/ai/embedding";
import { trackJobActivity } from "../../../lib/activity";
import type { CreateJobInput, JobPosting } from "../types";
import { CompanyService } from "../../companies/services/companyService";

const JOBS_COLLECTION = "jobs";

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

    if (!Array.isArray(embedding) || embedding.length !== EMBEDDING_DIMENSION || typeof embedding[0] !== "number" || typeof embedding[EMBEDDING_DIMENSION - 1] !== "number") {
        console.error(`Invalid embedding received. Expected ${EMBEDDING_DIMENSION}, got ${Array.isArray(embedding) ? embedding.length : typeof embedding}`);
        throw new Error(`Embedding service returned invalid vector. Expected dimension ${EMBEDDING_DIMENSION}, got ${Array.isArray(embedding) ? embedding.length : 'non-array'}`);
    }

    return embedding;
}

export const JobService = {
    /**
     * Creates a new job posting and automatically generates a vector embedding for it.
     */
    async createJob(input: CreateJobInput): Promise<string> {
        try {
            // 1. Fetch Company ID if not provided
            let companyId = input.company_id;
            if (!companyId) {
                const company = await CompanyService.getCompanyByEmployerId(input.employer_id);
                if (company) {
                    companyId = company.id;
                }
            }

            // 2. Generate Embedding (Client-side for MVP)
            // Combine relevant fields for semantic search: Title, Description, Skills, Location
            const semanticText = `
        Title: ${input.title}
        Skills: ${input.skills.join(", ")}
        Location: ${input.location}
        Type: ${input.type} (${input.work_mode})
        Description: ${input.description}
      `.trim();

            const embedding = await fetchEmbedding(semanticText);

            // 3. Prepare Data
            const now = new Date();
            const expirationDate = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000); // 4 days from now

            const jobData = {
                ...input,
                company_id: companyId,
                status: 'active',
                created_at: serverTimestamp(),
                updated_at: serverTimestamp(),
                lastActiveAt: serverTimestamp(),
                expiresAt: Timestamp.fromDate(expirationDate),
                embedding: embedding,
                skills: input.skills.map(s => s.toLowerCase()) // Normalize skills
            };

            // 4. Save to Firestore
            const docRef = await addDoc(collection(db, JOBS_COLLECTION), jobData);

            return docRef.id;
        } catch (error) {
            console.error("Error creating job:", error);
            throw error;
        }
    },

    /**
     * Update an existing job. If title/description/skills changes, re-generate embedding.
     */
    async updateJob(jobId: string, updates: Partial<CreateJobInput>): Promise<void> {
        try {
            const docRef = doc(db, JOBS_COLLECTION, jobId);
            const updateData: Partial<JobPosting> & { updated_at: ReturnType<typeof serverTimestamp> } = {
                ...Object.fromEntries(
                    Object.entries(updates).filter(([, v]) => (v as unknown) !== undefined)
                ),
                updated_at: serverTimestamp()
            };

            // If semantic fields change, regenerate embedding (use key-presence, not truthiness)
            const shouldRegenEmbedding =
                ('title' in updates) ||
                ('description' in updates) ||
                ('skills' in updates) ||
                ('location' in updates) ||
                ('type' in updates) ||
                ('work_mode' in updates);

            if (shouldRegenEmbedding) {
                const snap = await getDoc(docRef);

                if (!snap.exists()) {
                    throw new Error(`Job ${jobId} not found`);
                }

                const currentData = snap.data() as JobPosting;

                const finalTitle = ('title' in updates) ? (updates.title ?? currentData.title) : currentData.title;
                const finalDescription = ('description' in updates) ? (updates.description ?? currentData.description) : currentData.description;
                const finalSkills = ('skills' in updates) ? (updates.skills ?? currentData.skills) : currentData.skills;
                const finalLocation = ('location' in updates) ? (updates.location ?? currentData.location) : currentData.location;
                const finalType = ('type' in updates) ? (updates.type ?? currentData.type) : currentData.type;
                const finalWorkMode = ('work_mode' in updates) ? (updates.work_mode ?? currentData.work_mode) : currentData.work_mode;

                const semanticText = `
                    Title: ${finalTitle}
                    Skills: ${finalSkills.join(", ")}
                    Location: ${finalLocation}
                    Type: ${finalType} (${finalWorkMode})
                    Description: ${finalDescription}
                `.trim();

                const embedding = await fetchEmbedding(semanticText);
                updateData.embedding = embedding;

                if ('skills' in updates) {
                    updateData.skills = finalSkills.map(s => s.toLowerCase());
                }
            }

            await updateDoc(docRef, updateData);

            // Updating a job counts as activity
            void trackJobActivity(jobId);
        } catch (error) {
            console.error("Error updating job:", error);
            throw error;
        }
    },

    /**
     * Fetch jobs with "Active First" sorting.
     * Priority:
     * 1. Status: ACTIVE (alphabetically before PASSIVE)
     * 2. lastActiveAt: Descending (most recently active first)
     */
    async getJobs(limitCount = 20): Promise<JobPosting[]> {
        try {
            const jobsRef = collection(db, JOBS_COLLECTION);

            // Filter for ACTIVE jobs only
            // Sort by status and then recency
            const q = query(
                jobsRef,
                where("status", "==", "active"),
                orderBy("status", "asc"),
                orderBy("lastActiveAt", "desc"),
                limit(limitCount)
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as JobPosting));
        } catch (error) {
            console.error("Error fetching jobs:", error);
            throw error;
        }
    },

    /**
     * Get a specific job by ID.
     * @param jobId The job ID
     * @param isOwner If true, records activity for this job (keeps it active)
     */
    async getJobById(jobId: string, isOwner = false): Promise<JobPosting | null> {
        try {
            const docRef = doc(db, JOBS_COLLECTION, jobId);
            const snap = await getDoc(docRef);

            if (!snap.exists()) {
                return null;
            }

            if (isOwner) {
                void trackJobActivity(jobId);
            }

            return { id: snap.id, ...snap.data() } as JobPosting;
        } catch (error) {
            console.error("Error fetching job:", error);
            throw error;
        }
    },

    /**
     * Get all active jobs for a specific company.
     */
    async getJobsByCompanyId(companyId: string): Promise<JobPosting[]> {
        try {
            const jobsRef = collection(db, JOBS_COLLECTION);
            const q = query(
                jobsRef,
                where("company_id", "==", companyId),
                where("status", "==", "active"),
                orderBy("created_at", "desc")
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as JobPosting));
        } catch (error) {
            console.error("Error fetching jobs by company:", error);
            throw error;
        }
    },

    /**
     * Get all jobs created by a specific employer.
     */
    async getJobsByEmployerId(employerId: string): Promise<JobPosting[]> {
        try {
            const jobsRef = collection(db, JOBS_COLLECTION);
            const q = query(
                jobsRef,
                where("employer_id", "==", employerId),
                orderBy("created_at", "desc")
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as JobPosting));
        } catch (error) {
            console.error("Error fetching jobs by employer:", error);
            throw error;
        }
    }
};
