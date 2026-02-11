import { GoogleGenAI } from "@google/genai";
import { db } from "../../../lib/firebase";
import { doc, setDoc, serverTimestamp, collection } from "firebase/firestore";
import { SkillGap } from "../types";

const API_KEY = (import.meta.env.VITE_GEMINI_API_KEY as string) || "";
const genAI = new GoogleGenAI({ apiKey: API_KEY });

// Schema types
const SchemaType = {
    STRING: "STRING",
    NUMBER: "NUMBER",
    INTEGER: "INTEGER",
    BOOLEAN: "BOOLEAN",
    ARRAY: "ARRAY",
    OBJECT: "OBJECT"
};

const SKILL_GAP_SCHEMA = {
    type: SchemaType.OBJECT,
    properties: {
        target_role: { type: SchemaType.STRING },
        missing_skills: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    name: { type: SchemaType.STRING },
                    importance: { type: SchemaType.STRING, enum: ["high", "medium", "low"] },
                    description: { type: SchemaType.STRING }
                },
                required: ["name", "importance", "description"]
            }
        },
        resources: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    title: { type: SchemaType.STRING },
                    url: { type: SchemaType.STRING },
                    type: { type: SchemaType.STRING, enum: ["course", "article", "video"] },
                    skill_name: { type: SchemaType.STRING, description: "The skill this resource helps with" }
                },
                required: ["title", "url", "type"]
            }
        }
    },
    required: ["target_role", "missing_skills", "resources"]
};

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

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const result = await genAI.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                responseMimeType: "application/json",
                responseSchema: SKILL_GAP_SCHEMA,
            }
        }) as any;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const responseText = result.text() as string;
        if (!responseText) throw new Error("No response from AI");

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const data = JSON.parse(responseText);

        const skillGap: SkillGap = {
            user_id: userId,
            target_role: targetRole,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            missing_skills: data.missing_skills,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
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
