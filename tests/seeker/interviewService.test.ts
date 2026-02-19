import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateQuestions, evaluateAnswer } from '../../src/features/seeker/services/interviewService';
import { callAIProxy } from '../../src/lib/ai/proxy';

// Mock Dependencies
vi.mock('../../src/lib/ai/proxy', () => ({
    callAIProxy: vi.fn()
}));

describe('InterviewService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('generateQuestions', () => {
        it('should call AI proxy and return questions', async () => {
            const mockQuestions = [{ id: 1, question: 'Q?', type: 'technical', difficulty: 'medium' }];
            (callAIProxy as any).mockResolvedValue({ questions: mockQuestions });

            const results = await generateQuestions('Developer');

            expect(callAIProxy).toHaveBeenCalled();
            expect(results).toHaveLength(1);
        });
    });

    describe('evaluateAnswer', () => {
        it('should call AI proxy and return evaluation', async () => {
            const mockEvaluation = { score: 80, strengths: ['Good'], weaknesses: [], suggestion: 'Keep it up', betterAnswer: '...' };
            (callAIProxy as any).mockResolvedValue(mockEvaluation);

            const result = await evaluateAnswer('Q', 'A', 'Role');

            expect(callAIProxy).toHaveBeenCalled();
            expect(result.score).toBe(80);
        });
    });
});
