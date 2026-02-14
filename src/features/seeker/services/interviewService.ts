import { callAIProxy } from "../../../lib/ai/proxy";

export interface InterviewQuestion {
    id: number;
    question: string;
    type: 'behavioral' | 'technical' | 'situational';
    difficulty: 'easy' | 'medium' | 'hard';
}

export interface EvaluationResult {
    score: number;
    strengths: string[];
    weaknesses: string[];
    suggestion: string;
    betterAnswer: string;
}

export const generateQuestions = async (
    role: string,
    resumeContext?: string
): Promise<InterviewQuestion[]> => {
    try {
        const prompt = `
            Generate 5 interview questions for a ${role} position.
            ${resumeContext ? `Based on this resume context: ${resumeContext.substring(0, 5000)}...` : ''}

            Include a mix of behavioral, technical, and situational questions.
            Vary the difficulty.
        `;

        const data = await callAIProxy<{ questions: InterviewQuestion[] }>('/api/ai/interview-questions', { prompt });
        return data.questions;
    } catch (error) {
        console.error("Error generating questions:", error);
        throw error;
    }
};

export const evaluateAnswer = async (
    question: string,
    answer: string,
    role: string
): Promise<EvaluationResult> => {
    try {
        const prompt = `
            You are an expert interviewer for a ${role} position.

            Question: "${question}"
            Candidate Answer: "${answer}"

            Evaluate the answer. Provide a score (0-100), list strengths and weaknesses,
            give a specific suggestion for improvement, and provide a better version of the answer.
        `;

        return await callAIProxy<EvaluationResult>('/api/ai/evaluate-answer', { prompt });
    } catch (error) {
        console.error("Error evaluating answer:", error);
        throw error;
    }
};
