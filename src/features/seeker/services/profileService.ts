import { db } from "../../../lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import type { SeekerProfile, ResumeAnalysisResult } from "../types";

const PROFILE_COLLECTION = "seeker_profiles";

export const ProfileService = {
    /**
     * Fetches the seeker's profile.
     */
    async getProfile(userId: string): Promise<SeekerProfile | null> {
        try {
            const profileRef = doc(db, PROFILE_COLLECTION, userId);
            const profileSnap = await getDoc(profileRef);

            if (profileSnap.exists()) {
                return { uid: profileSnap.id, ...profileSnap.data() } as SeekerProfile;
            }
            return null;
        } catch (error) {
            console.error("Error fetching seeker profile:", error);
            return null;
        }
    },

    /**
     * Upserts (creates or updates) the seeker's profile.
     */
    async upsertProfile(userId: string, data: Partial<SeekerProfile>): Promise<void> {
        try {
            const profileRef = doc(db, PROFILE_COLLECTION, userId);
            await setDoc(profileRef, {
                ...data,
                updated_at: serverTimestamp(),
                // If it's a new profile, we'll want created_at, but setDoc with merge handles updates fine.
                // For a truly new document, we might want to check existence or use a merge strategy.
            }, { merge: true });
        } catch (error) {
            console.error("Error upserting seeker profile:", error);
            throw error;
        }
    },

    /**
     * Synchronizes profile data from a resume analysis result.
     */
    async syncFromResume(userId: string, resume: ResumeAnalysisResult): Promise<void> {
        try {
            const roles = resume.parsed_data.experience?.map(e => e.role) ?? [];
            const primaryRole = roles[0] ?? "";

            const firstExp = resume.parsed_data.experience?.[0];
            const profileData: Partial<SeekerProfile> = {
                parsed_data: resume.parsed_data,
                skills: resume.keywords.found,
                headline: primaryRole,
                bio: firstExp ? firstExp.description.slice(0, 2).join(" ") : "",
                preferences: {
                    roles: roles.slice(0, 3), // Top 3 roles from experience
                    locations: [],
                    remote: false,
                }
            };

            await this.upsertProfile(userId, profileData);
        } catch (error) {
            console.error("Error syncing profile from resume:", error);
            throw error;
        }
    }
};
