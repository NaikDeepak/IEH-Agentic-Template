import {
    collection,
    addDoc,
    serverTimestamp,
    doc,
    updateDoc,
    getDoc
} from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { EMBEDDING_DIMENSION } from "../../../lib/ai/embedding";
import type { CreateJobInput, JobPosting } from "../types";



const JOBS_COLLECTION = "jobs";

async function fetchEmbedding(text: string): Promise<number[]> {
    const res = await fetch("/api/embedding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
    });

    if (!res.ok) {
        throw new Error(`Embedding service failed: ${res.status}`);
    }

    const data = await res.json();
    const embedding = data?.embedding;

    if (!Array.isArray(embedding) || embedding.length !== EMBEDDING_DIMENSION || typeof embedding[0] !== "number" || typeof embedding[EMBEDDING_DIMENSION - 1] !== "number") {
        throw new Error("Embedding service returned invalid vector");
    }

    return embedding as number[];
}

export const JobService = {
    /**
     * Creates a new job posting and automatically generates a vector embedding for it.
     */
    async createJob(input: CreateJobInput): Promise<string> {
        try {
            // 1. Generate Embedding (Client-side for MVP)
            // Combine relevant fields for semantic search: Title, Description, Skills, Location
            const semanticText = `
        Title: ${input.title}
        Skills: ${input.skills.join(", ")}
        Location: ${input.location}
        Type: ${input.type} (${input.work_mode})
        Description: ${input.description}
      `.trim();

            const embedding = await fetchEmbedding(semanticText);

            // 2. Prepare Data
            const jobData: Omit<JobPosting, 'id'> = {
                ...input,
                status: 'ACTIVE',
                created_at: serverTimestamp(),
                updated_at: serverTimestamp(),
                embedding: embedding,
                skills: input.skills.map(s => s.toLowerCase()) // Normalize skills
            };

            // 3. Save to Firestore
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
                ...updates,
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
                const finalSkills = ('skills' in updates) ? (updates.skills ?? currentData.skills ?? []) : (currentData.skills ?? []);
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
        } catch (error) {
            console.error("Error updating job:", error);
            throw error;
        }
    }
};
