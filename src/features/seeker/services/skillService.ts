import { db } from "../../../lib/firebase";
import { doc, setDoc, serverTimestamp, collection, query, limit, getDocs } from "firebase/firestore";
import type { SkillGap } from "../types";
import { callAIProxy } from "../../../lib/ai/proxy";

export const analyzeSkillGap = async (
    userId: string,
    currentSkills: string[],
    targetRole: string
): Promise<SkillGap> => {
    try {
        const prompt = `
        You are a Career Coach and Skill Gap Analyst.

        The user has these current skills: ${currentSkills.join(", ")}.
        They want to become a: ${targetRole}.

        Identify the key missing hard and soft skills required for the target role that the user doesn't seem to have (or might need to improve).

        For each missing skill:
        1. Determine its importance (high, medium, low).
        2. Provide a brief description of why it's needed.

        Also, suggest specific learning resources (courses, articles, or videos) to help bridge these gaps.
        Note: Since you cannot browse the live web, suggest well-known, evergreen resources or search queries formatted as URLs (e.g., Coursera, Udemy, YouTube, Medium, official documentation).

        Return the result as JSON.
        `;

        // Generate Content via Proxy
        const data = await callAIProxy<{ missing_skills: SkillGap['missing_skills']; resources: SkillGap['resources'] }>('/api/ai/skill-gap', { prompt });

        const skillGap: SkillGap = {
            user_id: userId,
            target_role: targetRole,
            missing_skills: data.missing_skills,
            resources: data.resources,
            identified_at: serverTimestamp()
        };

        // Persist to Firestore
        const gapRef = doc(collection(db, `users/${userId}/skillGaps`));
        await setDoc(gapRef, {
            ...skillGap,
            id: gapRef.id
        });

        return { ...skillGap, id: gapRef.id };

    } catch (error) {
        console.error("Skill Gap Analysis Error:", error);
        throw error;
    }
};

/**
 * Fetches the most recent skill gap analysis for a user.
 */
export const getLatestSkillGap = async (userId: string): Promise<SkillGap | null> => {
    try {
        const gapRef = collection(db, `users/${userId}/skillGaps`);
        const q = query(gapRef, limit(1));
        const snapshot = await getDocs(q);

        if (snapshot.empty) return null;
        const firstDoc = snapshot.docs[0];
        if (!firstDoc) return null;
        return { id: firstDoc.id, ...firstDoc.data() } as SkillGap;
    } catch (error) {
        console.error("Error fetching latest skill gap:", error);
        return null;
    }
};
