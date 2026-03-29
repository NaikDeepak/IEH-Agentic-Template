import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeResume, getLatestResume } from '../resumeService';
import { db } from '../../../../lib/firebase';
import { doc, setDoc, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { callAIProxy } from '../../../../lib/ai/proxy';
import { parseDocx, preparePdf } from '../documentService';
import { ProfileService } from '../profileService';
import { ResumeMapper } from '../resumeMapper';

// Mock Firestore
vi.mock('firebase/firestore', () => ({
    collection: vi.fn(),
    doc: vi.fn(),
    setDoc: vi.fn(),
    getDocs: vi.fn(),
    query: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    Timestamp: {
        now: () => ({ toDate: () => new Date() })
    }
}));

vi.mock('../../../../lib/firebase', () => ({
    db: {}
}));

// Mock Proxy & Services
vi.mock('../../../../lib/ai/proxy', () => ({
    callAIProxy: vi.fn()
}));

vi.mock('../documentService', () => ({
    parseDocx: vi.fn(),
    preparePdf: vi.fn()
}));

vi.mock('../profileService', () => ({
    ProfileService: {
        syncFromResume: vi.fn()
    }
}));

vi.mock('../resumeMapper', () => ({
    ResumeMapper: {
        mapToDomain: vi.fn()
    }
}));

// Mock Sentry
vi.mock('@sentry/react', () => ({
    startSpan: vi.fn((_, cb) => cb({ setAttribute: vi.fn() })),
    captureException: vi.fn()
}));

describe('ResumeService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('analyzeResume', () => {
        it('analyzes text resume successfully', async () => {
            const mockResponse = { some: 'ai-data' };
            const mockAnalysis = { id: 'res123', score: 85, user_id: 'user123' };
            (callAIProxy as any).mockResolvedValue(mockResponse);
            (ResumeMapper.mapToDomain as any).mockReturnValue(mockAnalysis);
            (collection as any).mockReturnValue('mock-collection');
            (doc as any).mockReturnValue({ id: 'res123' });

            const result = await analyzeResume('user123', 'My resume text', 'text');

            expect(result).toEqual(mockAnalysis);
            expect(callAIProxy).toHaveBeenCalledWith('/api/ai/analyze-resume', expect.anything());
            expect(setDoc).toHaveBeenCalled();
            expect(ProfileService.syncFromResume).toHaveBeenCalledWith('user123', mockAnalysis);
        });

        it('analyzes PDF resume successfully', async () => {
            const mockFile = new File([''], 'resume.pdf', { type: 'application/pdf' });
            (preparePdf as any).mockResolvedValue({ base64: 'base64-data', mimeType: 'application/pdf' });
            (callAIProxy as any).mockResolvedValue({});
            (ResumeMapper.mapToDomain as any).mockReturnValue({ id: 'res123' });
            (doc as any).mockReturnValue({ id: 'res123' });

            await analyzeResume('user123', mockFile, 'file');

            expect(preparePdf).toHaveBeenCalledWith(mockFile);
            expect(callAIProxy).toHaveBeenCalledWith('/api/ai/analyze-resume', expect.objectContaining({
                promptParts: expect.arrayContaining([
                    expect.objectContaining({ inlineData: { data: 'base64-data', mimeType: 'application/pdf' } })
                ])
            }));
        });

        it('analyzes DOCX resume successfully', async () => {
             const mockFile = new File([''], 'resume.docx');
             Object.defineProperty(mockFile, 'name', { value: 'resume.docx' });
             (parseDocx as any).mockResolvedValue('Extracted Text');
             (callAIProxy as any).mockResolvedValue({});
             (ResumeMapper.mapToDomain as any).mockReturnValue({ id: 'res123' });
             (doc as any).mockReturnValue({ id: 'res123' });

             await analyzeResume('user123', mockFile, 'file');

             expect(parseDocx).toHaveBeenCalledWith(mockFile);
             expect(callAIProxy).toHaveBeenCalledWith('/api/ai/analyze-resume', expect.objectContaining({
                 promptParts: expect.arrayContaining([
                     expect.objectContaining({ text: expect.stringContaining('Extracted Text') })
                 ])
             }));
        });
    });

    describe('getLatestResume', () => {
        it('returns latest valid resume', async () => {
            const mockDate = { toDate: () => new Date() };
            const mockDocs = [{
                id: 'res123',
                data: () => ({
                    analyzed_at: mockDate,
                    score: 0.85,
                    sections: { contact: true },
                    keywords: { found: ['React'] },
                    parsed_data: { experience: [] }
                })
            }];
            (getDocs as any).mockResolvedValue({ empty: false, docs: mockDocs });

            const result = await getLatestResume('user123');

            expect(result).not.toBeNull();
            expect(result?.score).toBe(85); // Normalization check 0.85 -> 85
            expect(result?.sections.contact).toBe(true);
        });

        it('returns null if no resumes found', async () => {
            (getDocs as any).mockResolvedValue({ empty: true });

            const result = await getLatestResume('user123');

            expect(result).toBeNull();
        });
    });
});
