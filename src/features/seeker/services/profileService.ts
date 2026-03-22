import { db } from "../../../lib/firebase";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import type { SeekerProfile, ResumeAnalysisResult } from "../types";

const PROFILE_COLLECTION = "seeker_profiles";

/**
 * Robust helper to extract a string from unknown data.
 */
function getSafeString(data: Record<string, unknown>, key: string, fallback = ""): string {
    const val = data[key];
    return typeof val === "string" ? val : fallback;
}

/**
 * Robust helper to extract an array from unknown data.
 */
function getSafeArray<T>(data: Record<string, unknown>, key: string): T[] {
    const val = data[key];
    return Array.isArray(val) ? (val as T[]) : [];
}

/**
 * Robust helper to extract a nested object property safely.
 */
function getNestedValue<T>(data: Record<string, unknown>, parentKey: string, childKey: string, fallback: T): T {
    const parent = data[parentKey];
    if (parent && typeof parent === "object") {
        const val = (parent as Record<string, unknown>)[childKey];
        if (val !== undefined && val !== null) {
            if (Array.isArray(fallback) && Array.isArray(val)) return val as unknown as T;
            if (typeof fallback === typeof val) return val as unknown as T;
        }
    }
    return fallback;
}

export const ProfileService = {
    /**
     * Fetches the seeker's profile.
     */
    async getProfile(userId: string): Promise<SeekerProfile | null> {
        try {
            const profileRef = doc(db, PROFILE_COLLECTION, userId);
            const profileSnap = await getDoc(profileRef);

            if (profileSnap.exists()) {
                const data = profileSnap.data() as Record<string, unknown>;
                return {
                    ...data,
                    uid: userId,
                    email: getSafeString(data, 'email'),
                    displayName: getSafeString(data, 'displayName'),
                    headline: getSafeString(data, 'headline'),
                    bio: getSafeString(data, 'bio'),
                    photoURL: getSafeString(data, 'photoURL'),
                    currentLocation: getSafeString(data, 'currentLocation'),
                    skills: getSafeArray<string>(data, 'skills'),
                    work_preferences: getSafeArray<string>(data, 'work_preferences'),
                    verified_skills: getSafeArray<string>(data, 'verified_skills'),
                    preferences: {
                        roles: getNestedValue<string[]>(data, 'preferences', 'roles', []),
                        locations: getNestedValue<string[]>(data, 'preferences', 'locations', []),
                        remote: getNestedValue<boolean>(data, 'preferences', 'remote', false),
                    },
                    parsed_data: {
                        experience: getNestedValue<NonNullable<SeekerProfile['parsed_data']>['experience']>(data, 'parsed_data', 'experience', []),
                        education: getNestedValue<NonNullable<SeekerProfile['parsed_data']>['education']>(data, 'parsed_data', 'education', []),
                    }
                } as unknown as SeekerProfile;
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
     * Updates a single dot-path field without touching other nested fields.
     * Use this instead of upsertProfile when you need to update one field
     * inside a nested object (e.g. 'preferences.roles') to avoid shallow-merge overwrite.
     */
    async updateProfileField(userId: string, fieldPath: string, value: unknown): Promise<void> {
        try {
            const profileRef = doc(db, PROFILE_COLLECTION, userId);
            await updateDoc(profileRef, { [fieldPath]: value, updated_at: serverTimestamp() });
        } catch (error) {
            console.error("Error updating profile field:", error);
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
