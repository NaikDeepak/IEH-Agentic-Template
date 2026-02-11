import { GoogleGenAI } from "@google/genai";
import { db } from "../../../lib/firebase";
import { doc, updateDoc, arrayUnion, addDoc, collection, serverTimestamp } from "firebase/firestore";
import type { Assessment, AssessmentQuestion, AssessmentResult } from "../types";

// Initialize Gemini
// Note: In a production environment, this should be proxied through a backend/Cloud Function to protect the API key.
const API_KEY = (import.meta.env['VITE_GEMINI_API_KEY'] as string) || "";
const genAI = new GoogleGenAI({ apiKey: API_KEY });

// Schema types as string constants since they are not exported by the SDK
const SchemaType = {
    STRING: "STRING",
    NUMBER: "NUMBER",
    INTEGER: "INTEGER",
    BOOLEAN: "BOOLEAN",
    ARRAY: "ARRAY",
    OBJECT: "OBJECT"
};

const ASSESSMENT_SCHEMA = {
    type: SchemaType.OBJECT,
    properties: {
        questions: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    id: { type: SchemaType.STRING },
                    text: { type: SchemaType.STRING },
                    options: {
                        type: SchemaType.ARRAY,
                        items: { type: SchemaType.STRING }
                    },
                    correctOptionIndex: { type: SchemaType.INTEGER }
                },
                required: ["id", "text", "options", "correctOptionIndex"]
            }
        }
    },
    required: ["questions"]
};

export const generateAssessment = async (skill: string): Promise<Assessment> => {
    try {
        const systemPrompt = `
        You are an expert technical interviewer.
        Generate 5 multiple-choice questions to assess proficiency in: ${skill}.

        For each question:
        - Provide a unique ID (e.g., "q1", "q2").
        - Provide the question text.
        - Provide 4 distinct options.
        - Indicate the index (0-3) of the correct option.

        The questions should be challenging enough to verify intermediate competence.
        `;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result: any = await genAI.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [{ role: "user", parts: [{ text: `Generate assessment for ${skill}` }] }],
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
                responseSchema: ASSESSMENT_SCHEMA,
            }
        });

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const responseText = result.text() as string;
        if (!responseText) throw new Error("No response from AI");

        const data = JSON.parse(responseText) as { questions: AssessmentQuestion[] };

        return {
            id: crypto.randomUUID(),
            skill,
            questions: data.questions,
            generated_at: serverTimestamp()
        };

    } catch (error) {
        console.error("Error generating assessment:", error);
        throw error;
    }
};

export const submitAssessment = async (
    userId: string,
    skill: string,
    assessment: Assessment,
    answers: Record<string, number>
): Promise<AssessmentResult> => {
    try {
        let correctCount = 0;
        const totalQuestions = assessment.questions.length;

        // Grade locally
        assessment.questions.forEach(q => {
            const userAnswer = answers[q.id];
            if (userAnswer !== undefined && userAnswer === q.correctOptionIndex) {
                correctCount++;
            }
        });

        const score = Math.round((correctCount / totalQuestions) * 100);
        const passed = score >= 80; // Pass threshold

        const result: AssessmentResult = {
            assessmentId: assessment.id,
            user_id: userId,
            skill,
            score,
            passed,
            feedback: passed ? "Congratulations! You have verified this skill." : "You did not pass this time. Review the material and try again.",
            completed_at: serverTimestamp()
        };

        // Persist result
        await addDoc(collection(db, `users/${userId}/assessments`), result);

        // If passed, update profile
        if (passed) {
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, {
                verified_skills: arrayUnion(skill)
            });
        }

        return result;

    } catch (error) {
        console.error("Error submitting assessment:", error);
        throw error;
    }
};
