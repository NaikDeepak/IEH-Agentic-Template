import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeSkillGap, getLatestSkillGap } from '../../src/features/seeker/services/skillService';
import { callAIProxy } from '../../src/lib/ai/proxy';
import { doc, setDoc, getDocs } from 'firebase/firestore';

// Mock Dependencies
vi.mock('../../src/lib/firebase', () => ({
    db: {}
}));

vi.mock('../../src/lib/ai/proxy', () => ({
    callAIProxy: vi.fn()
}));

vi.mock('firebase/firestore', () => ({
    doc: vi.fn(),
    setDoc: vi.fn(),
    serverTimestamp: vi.fn(() => 'mock-timestamp'),
    collection: vi.fn(),
    query: vi.fn(),
    limit: vi.fn(),
    getDocs: vi.fn(),
    getFirestore: vi.fn(() => ({}))
}));

describe('SkillService', () => {
    const userId = 'user123';
    const currentSkills = ['React', 'CSS'];
    const targetRole = 'Frontend Lead';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('analyzeSkillGap', () => {
        it('should call AI proxy and persist result to firestore', async () => {
            const aiMockResponse = {
                missing_skills: [{ name: 'System Design', importance: 'high', reason: 'Needed for lead role' }],
                resources: [{ name: 'Design Course', url: 'https://example.com' }]
            };
            (callAIProxy as any).mockResolvedValueOnce(aiMockResponse);

            const mockDocRef = { id: 'gap_123' };
            (doc as any).mockReturnValueOnce(mockDocRef);
            (setDoc as any).mockResolvedValueOnce(undefined);

            const result = await analyzeSkillGap(userId, currentSkills, targetRole);

            expect(callAIProxy).toHaveBeenCalledWith('/api/ai/skill-gap', expect.any(Object));
            expect(setDoc).toHaveBeenCalledWith(mockDocRef, expect.objectContaining({
                user_id: userId,
                target_role: targetRole,
                missing_skills: aiMockResponse.missing_skills
            }));
            expect(result.id).toBe('gap_123');
        });

        it('should throw error if AI proxy fails', async () => {
            (callAIProxy as any).mockRejectedValueOnce(new Error('AI Overheat'));

            await expect(analyzeSkillGap(userId, currentSkills, targetRole)).rejects.toThrow('AI Overheat');
        });
    });

    describe('getLatestSkillGap', () => {
        it('should return the first skill gap found', async () => {
            const mockSnapshot = {
                empty: false,
                docs: [
                    {
                        id: 'gap_123',
                        data: () => ({ target_role: 'Frontend Lead', user_id: userId })
                    }
                ]
            };
            (getDocs as any).mockResolvedValueOnce(mockSnapshot);

            const result = await getLatestSkillGap(userId);

            expect(result?.id).toBe('gap_123');
            expect(result?.target_role).toBe('Frontend Lead');
        });

        it('should return null if no skill gap found', async () => {
            (getDocs as any).mockResolvedValueOnce({ empty: true });

            const result = await getLatestSkillGap(userId);

            expect(result).toBeNull();
        });
    });
});
