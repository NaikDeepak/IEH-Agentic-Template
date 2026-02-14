import { db } from "../../../lib/firebase";
import { doc, updateDoc, arrayUnion, addDoc, collection, serverTimestamp } from "firebase/firestore";
import type { Assessment, AssessmentResult } from "../types";
import { callAIProxy } from "../../../lib/ai/proxy";

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

        // Generate Content via Proxy
        const data = await callAIProxy<{ questions: Assessment['questions'] }>('/api/ai/assessment', {
            systemPrompt,
            skill
        });

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
