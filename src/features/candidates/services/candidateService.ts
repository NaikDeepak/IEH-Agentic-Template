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

            // Prepare update data with proper typing
            const updateData: Partial<UserProfile> & { updated_at: ReturnType<typeof serverTimestamp> } = {
                ...updates,
                updated_at: serverTimestamp()
            };

            // 1. Check if we need to regenerate embedding
            // Ideally we should see if skills or bio changed. 
            if (updates.skills || updates.bio) {

                // Fetch current data to merge if needed, or just use what we have? 
                // For accurate embedding, we want the FULL profile context.
                // So let's fetch the current doc.
                const snap = await getDoc(userRef);
                const currentData = snap.data() as UserProfile | undefined;

                if (currentData) {
                    const finalSkills = updates.skills || currentData.skills || [];
                    const finalBio = updates.bio || currentData.parsed_data?.summary || "";
                    const displayName = updates.displayName || currentData.displayName || "";

                    const semanticText = `
                Candidate: ${displayName}
                Skills: ${finalSkills.join(", ")}
                Bio: ${finalBio}
            `.trim();

                    const embedding = await generateEmbedding(semanticText);
                    updateData.embedding = embedding;
                }
            }

            // 2. Update Firestore
            await updateDoc(userRef, updateData);

        } catch (error) {
            console.error("Error updating candidate profile:", error);
            throw error;
        }
    }
};
