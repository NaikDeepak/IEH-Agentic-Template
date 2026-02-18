import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateAssessment, submitAssessment } from '../../src/features/seeker/services/assessmentService';
import { callAIProxy } from '../../src/lib/ai/proxy';
import { addDoc, updateDoc, doc } from 'firebase/firestore';

// Mock Dependencies
vi.mock('../../src/lib/firebase', () => ({
    db: {}
}));

vi.mock('../../src/lib/ai/proxy', () => ({
    callAIProxy: vi.fn()
}));

vi.mock('firebase/firestore', () => ({
    collection: vi.fn(),
    doc: vi.fn(),
    addDoc: vi.fn(),
    updateDoc: vi.fn(),
    serverTimestamp: vi.fn(() => 'mock-timestamp'),
    arrayUnion: vi.fn((val) => `arrayUnion(${val})`)
}));

// Mock crypto.randomUUID
if (!globalThis.crypto) {
    (globalThis as any).crypto = { randomUUID: () => 'mock-uuid' };
} else if (!(globalThis.crypto as any).randomUUID) {
    (globalThis.crypto as any).randomUUID = () => 'mock-uuid';
}

describe('AssessmentService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('generateAssessment', () => {
        it('should call AI proxy and return structured assessment', async () => {
            const mockQuestions = [{ id: 'q1', text: 'Q?', options: ['A', 'B'], correctOptionIndex: 0 }];
            (callAIProxy as any).mockResolvedValueOnce({ questions: mockQuestions });

            const result = await generateAssessment('React');

            expect(callAIProxy).toHaveBeenCalledWith('/api/ai/assessment', expect.objectContaining({
                skill: 'React'
            }));
            expect(result.questions).toEqual(mockQuestions);
            expect(result.skill).toBe('React');
        });
    });

    describe('submitAssessment', () => {
        const mockAssessment: any = {
            id: 'asmt1',
            questions: [
                { id: 'q1', correctOptionIndex: 1 },
                { id: 'q2', correctOptionIndex: 0 }
            ]
        };

        it('should grade correctly and persist result (pass case)', async () => {
            const answers = { q1: 1, q2: 0 }; // 100%
            const mockDocRef = { id: 'user123' };
            (doc as any).mockReturnValue(mockDocRef);

            const result = await submitAssessment('user123', 'React', mockAssessment, answers);

            expect(result.score).toBe(100);
            expect(result.passed).toBe(true);
            expect(addDoc).toHaveBeenCalled();
            expect(updateDoc).toHaveBeenCalledWith(mockDocRef, {
                verified_skills: 'arrayUnion(React)'
            });
        });

        it('should grade correctly and persist result (fail case)', async () => {
            const answers = { q1: 0, q2: 0 }; // 50%
            const result = await submitAssessment('user123', 'React', mockAssessment, answers);

            expect(result.score).toBe(50);
            expect(result.passed).toBe(false);
            expect(updateDoc).not.toHaveBeenCalled();
        });

        it('should handle missing answers during grading', async () => {
            const answers = { q1: 1 }; // q2 missing -> 50%
            const result = await submitAssessment('user123', 'React', mockAssessment, answers);
            expect(result.score).toBe(50);
        });
    });
});
