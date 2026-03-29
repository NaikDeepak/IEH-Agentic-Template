import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateQuestions, evaluateAnswer } from '../interviewService';
import { callAIProxy } from '../../../../lib/ai/proxy';

vi.mock('../../../../lib/ai/proxy', () => ({
    callAIProxy: vi.fn(),
}));

describe('interviewService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('generateQuestions', () => {
        it('returns questions for a given role', async () => {
            const mockQuestions = [
                { id: 1, question: 'Tell me about yourself', type: 'behavioral', difficulty: 'easy' },
                { id: 2, question: 'Explain closures', type: 'technical', difficulty: 'medium' },
            ];
            (callAIProxy as any).mockResolvedValue({ questions: mockQuestions });

            const result = await generateQuestions('Frontend Engineer');

            expect(result).toEqual(mockQuestions);
            expect(callAIProxy).toHaveBeenCalledWith('/api/ai/interview-questions', expect.objectContaining({
                prompt: expect.stringContaining('Frontend Engineer'),
            }));
        });

        it('includes resume context in prompt when provided', async () => {
            (callAIProxy as any).mockResolvedValue({ questions: [] });

            await generateQuestions('Backend Developer', 'Resume with Node.js experience');

            expect(callAIProxy).toHaveBeenCalledWith('/api/ai/interview-questions', expect.objectContaining({
                prompt: expect.stringContaining('Resume with Node.js experience'),
            }));
        });

        it('does not include resume context when not provided', async () => {
            (callAIProxy as any).mockResolvedValue({ questions: [] });

            await generateQuestions('Product Manager');

            expect(callAIProxy).toHaveBeenCalledWith('/api/ai/interview-questions', expect.objectContaining({
                prompt: expect.not.stringContaining('Based on this resume context'),
            }));
        });

        it('re-throws error when callAIProxy fails', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            (callAIProxy as any).mockRejectedValue(new Error('API down'));

            await expect(generateQuestions('Engineer')).rejects.toThrow('API down');
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });

    describe('evaluateAnswer', () => {
        const mockEvaluation = {
            score: 78,
            strengths: ['Good structure', 'Clear communication'],
            weaknesses: ['Could be more specific'],
            suggestion: 'Add concrete examples',
            betterAnswer: 'A more specific answer would be...',
        };

        it('returns evaluation result for a given question/answer/role', async () => {
            (callAIProxy as any).mockResolvedValue(mockEvaluation);

            const result = await evaluateAnswer(
                'What is your biggest strength?',
                'I am a fast learner.',
                'Software Engineer'
            );

            expect(result).toEqual(mockEvaluation);
            expect(callAIProxy).toHaveBeenCalledWith('/api/ai/evaluate-answer', expect.objectContaining({
                prompt: expect.stringContaining('Software Engineer'),
            }));
        });

        it('includes question and answer in the prompt', async () => {
            (callAIProxy as any).mockResolvedValue(mockEvaluation);

            await evaluateAnswer('Describe a challenge you faced.', 'I once had a tight deadline...', 'PM');

            expect(callAIProxy).toHaveBeenCalledWith('/api/ai/evaluate-answer', expect.objectContaining({
                prompt: expect.stringContaining('Describe a challenge you faced.'),
            }));
            expect(callAIProxy).toHaveBeenCalledWith('/api/ai/evaluate-answer', expect.objectContaining({
                prompt: expect.stringContaining('I once had a tight deadline...'),
            }));
        });

        it('re-throws error when callAIProxy fails', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            (callAIProxy as any).mockRejectedValue(new Error('Evaluation failed'));

            await expect(evaluateAnswer('Q', 'A', 'Role')).rejects.toThrow('Evaluation failed');
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });
});
