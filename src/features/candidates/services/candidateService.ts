import {
    doc,
    updateDoc,
    serverTimestamp,
    getDoc
} from "firebase/firestore";
import { db } from "../../../lib/firebase";
// NOTE: embeddings must be generated server-side via /api/embedding (never import server-only SDKs in the browser)
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
    return data.embedding ?? [];
}
import type { UpdateProfileInput, UserProfile } from "../types";

const USERS_COLLECTION = "users";

export const CandidateService = {
    /**
     * Updates a specific candidate profile.
     * Triggers embedding regeneration if semantic fields (skills, bio) change.
     */
    async updateProfile(uid: string, updates: UpdateProfileInput): Promise<void> {
        try {
            const userRef = doc(db, USERS_COLLECTION, uid);

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { bio, resume_url: _resumeUrl, ...restUpdates } = updates;

            // Prepare update data - remove bio/resume_url from top-level payload to avoid rule rejection
            const updateData: Partial<UserProfile> & { updated_at: ReturnType<typeof serverTimestamp> } = {
                ...restUpdates,
                updated_at: serverTimestamp()
            };

            // 1. Check if we need to regenerate embedding or map bio
            const shouldRegenEmbedding = ('skills' in updates) || ('bio' in updates) || ('displayName' in updates);

            if (shouldRegenEmbedding) {
                const snap = await getDoc(userRef);
                if (!snap.exists()) {
                    throw new Error(`User ${uid} not found`);
                }

                const currentData = snap.data() as UserProfile;

                // Map bio to parsed_data.summary if provided (supporting empty string)
                if (bio !== undefined) {
                    updateData.parsed_data = {
                        ...(currentData.parsed_data ?? {}),
                        summary: bio
                    };
                }

                const finalSkills = ('skills' in updates) ? (updates.skills ?? []) : (currentData.skills ?? []);
                const finalBio = ('bio' in updates) ? (updates.bio ?? "") : (currentData.parsed_data?.summary ?? "");
                const displayName = ('displayName' in updates) ? (updates.displayName ?? "") : (currentData.displayName ?? "");

                const semanticText = `
                    Candidate: ${displayName}
                    Skills: ${finalSkills.join(", ")}
                    Bio: ${finalBio}
                `.trim();

                const embedding = await fetchEmbedding(semanticText);
                updateData.embedding = embedding;
            }

            // 2. Update Firestore
            await updateDoc(userRef, updateData);

        } catch (error) {
            console.error("Error updating candidate profile:", error);
            throw error;
        }
    }
};
