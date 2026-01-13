import {
    doc,
    updateDoc,
    serverTimestamp,
    getDoc
} from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { generateEmbedding } from "../../../lib/ai/embedding";
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

            const { bio, ...restUpdates } = updates;

            // Prepare update data - remove bio as it's not a top-level field in UserProfile
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

                const embedding = await generateEmbedding(semanticText);
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
