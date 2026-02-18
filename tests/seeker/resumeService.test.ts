import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeResume, getLatestResume } from '../../src/features/seeker/services/resumeService';
import { callAIProxy } from '../../src/lib/ai/proxy';
import { ProfileService } from '../../src/features/seeker/services/profileService';
import { ResumeMapper } from '../../src/features/seeker/services/resumeMapper';
import { doc, setDoc, getDocs } from 'firebase/firestore';

// Mock Dependencies
vi.mock('../../src/lib/firebase', () => ({
    db: {}
}));

vi.mock('../../src/lib/ai/proxy', () => ({
    callAIProxy: vi.fn()
}));

vi.mock('../../src/features/seeker/services/documentService', () => ({
    parseDocx: vi.fn().mockResolvedValue('Extracted Text'),
    preparePdf: vi.fn().mockResolvedValue({ base64: 'base64data', mimeType: 'application/pdf' })
}));

vi.mock('../../src/features/seeker/services/profileService', () => ({
    ProfileService: {
        syncFromResume: vi.fn().mockResolvedValue(undefined)
    }
}));

vi.mock('../../src/features/seeker/services/resumeMapper', () => ({
    ResumeMapper: {
        mapToDomain: vi.fn().mockReturnValue({
            user_id: 'user123',
            score: 85,
            sections: {},
            keywords: { found: [], missing: [] },
            suggestions: [],
            parsed_data: { name: 'John Doe', experience: [], education: [] }
        })
    }
}));

vi.mock('firebase/firestore', () => ({
    doc: vi.fn(),
    setDoc: vi.fn(),
    collection: vi.fn(),
    query: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    getDocs: vi.fn(),
    getFirestore: vi.fn(() => ({})),
    Timestamp: {
        fromDate: vi.fn((date) => date),
        now: vi.fn(() => new Date())
    }
}));

vi.mock('@sentry/react', () => ({
    startSpan: vi.fn((_, cb) => cb({ setAttribute: vi.fn() })),
    captureException: vi.fn()
}));

describe('ResumeService', () => {
    const userId = 'user123';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('analyzeResume', () => {
        it('should process text input and sync profile', async () => {
            const content = 'Resume text content';
            const inputType = 'text';

            (callAIProxy as any).mockResolvedValueOnce({ raw: 'ai-data' });

            const mockDocRef = { id: 'resume_123' };
            (doc as any).mockReturnValueOnce(mockDocRef);

            const result = await analyzeResume(userId, content, inputType);

            expect(callAIProxy).toHaveBeenCalled();
            expect(ResumeMapper.mapToDomain).toHaveBeenCalledWith(userId, content, 'Text Input', { raw: 'ai-data' });
            expect(setDoc).toHaveBeenCalled();
            expect(ProfileService.syncFromResume).toHaveBeenCalled();
            expect(result.id).toBe('resume_123');
        });

        it('should process PDF file input', async () => {
            const content = new File([''], 'resume.pdf', { type: 'application/pdf' });
            const inputType = 'file';

            (callAIProxy as any).mockResolvedValueOnce({ raw: 'ai-data' });
            (doc as any).mockReturnValueOnce({ id: 'resume_456' });

            await analyzeResume(userId, content, inputType);

            expect(callAIProxy).toHaveBeenCalledWith('/api/ai/analyze-resume', expect.objectContaining({
                promptParts: expect.arrayContaining([expect.objectContaining({ inlineData: expect.any(Object) })])
            }));
        });
    });

    describe('getLatestResume', () => {
        it('should return latest valid resume', async () => {
            const mockSnapshot = {
                empty: false,
                docs: [
                    {
                        id: 'res_1',
                        data: () => ({
                            score: 0.85,
                            analyzed_at: { toDate: () => new Date() } // Valid timestamp
                        })
                    }
                ]
            };
            (getDocs as any).mockResolvedValueOnce(mockSnapshot);

            const result = await getLatestResume(userId);

            expect(result?.id).toBe('res_1');
            expect(result?.score).toBe(85); // Normalization check
        });

        it('should return null if no valid resume is found', async () => {
            (getDocs as any).mockResolvedValueOnce({ empty: true });
            (getDocs as any).mockResolvedValueOnce({ empty: true });

            const result = await getLatestResume(userId);

            expect(result).toBeNull();
        });
    });
});
