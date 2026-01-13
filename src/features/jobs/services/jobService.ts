import {
    collection,
    addDoc,
    serverTimestamp,
    doc,
    updateDoc,
    getDoc
} from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { generateEmbedding } from "../../../lib/ai/embedding";
import type { CreateJobInput, JobPosting } from "../types";

const JOBS_COLLECTION = "jobs";

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

            const embedding = await generateEmbedding(semanticText);

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

            // If semantic fields change, regenerate embedding
            if (updates.title || updates.description || updates.skills) {
                const snap = await getDoc(docRef);

                if (!snap.exists()) {
                    throw new Error(`Job ${jobId} not found`);
                }

                const currentData = snap.data() as JobPosting;

                // Merge current data with updates for complete embedding context
                const finalTitle = updates.title || currentData.title;
                const finalDescription = updates.description || currentData.description;
                const finalSkills = updates.skills || currentData.skills;
                const finalLocation = currentData.location;
                const finalType = currentData.type;
                const finalWorkMode = currentData.work_mode;

                const semanticText = `
                    Title: ${finalTitle}
                    Skills: ${finalSkills.join(", ")}
                    Location: ${finalLocation}
                    Type: ${finalType} (${finalWorkMode})
                    Description: ${finalDescription}
                `.trim();

                const embedding = await generateEmbedding(semanticText);
                updateData.embedding = embedding;

                // Normalize skills if being updated
                if (updates.skills) {
                    updateData.skills = updates.skills.map(s => s.toLowerCase());
                }
            }

            await updateDoc(docRef, updateData);
        } catch (error) {
            console.error("Error updating job:", error);
            throw error;
        }
    }
};
