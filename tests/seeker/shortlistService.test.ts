import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ShortlistService } from '../../src/features/seeker/services/shortlistService';
import { JobService } from '../../src/features/jobs/services/jobService';
import { callAIProxy } from '../../src/lib/ai/proxy';
import {
    getDocs,
    getDoc,
    writeBatch
} from 'firebase/firestore';

// Mock Dependencies
vi.mock('../../src/lib/firebase', () => ({
    db: {}
}));

vi.mock('../../src/lib/ai/proxy', () => ({
    callAIProxy: vi.fn()
}));

vi.mock('../../src/features/jobs/services/jobService', () => ({
    JobService: {
        getJobsByIds: vi.fn()
    }
}));

vi.mock('firebase/firestore', () => {
    const mockBatch = {
        set: vi.fn(),
        commit: vi.fn().mockResolvedValue(undefined)
    };
    return {
        collection: vi.fn(),
        query: vi.fn(),
        where: vi.fn(),
        orderBy: vi.fn(),
        limit: vi.fn(),
        getDocs: vi.fn(),
        getDoc: vi.fn(),
        writeBatch: vi.fn(() => mockBatch),
        doc: vi.fn(),
        serverTimestamp: vi.fn(() => 'mock-timestamp'),
        Timestamp: class {
            static fromDate = vi.fn((date) => date);
            static now = vi.fn(() => new Date());
            seconds: number;
            nanoseconds: number;
            constructor(seconds: number, nanoseconds: number) {
                this.seconds = seconds;
                this.nanoseconds = nanoseconds;
            }
            toDate() { return new Date(this.seconds * 1000); }
        },
        getFirestore: vi.fn(() => ({}))
    };
});

vi.mock('@sentry/react', () => ({
    startSpan: vi.fn((_, cb) => cb({ setAttribute: vi.fn() })),
    captureException: vi.fn()
}));

describe('ShortlistService', () => {
    const userId = 'user123';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getDailyShortlist', () => {
        it('should return cached shortlist if available', async () => {
            const mockRecommendedAt = new Date();
            const mockSnapshot = {
                empty: false,
                docs: [
                    {
                        data: () => ({
                            job_id: 'job1',
                            score: 0.9,
                            reason: 'Matches skills',
                            recommended_at: { toDate: () => mockRecommendedAt }
                        })
                    }
                ]
            };
            (getDocs as any).mockResolvedValueOnce(mockSnapshot);

            (JobService.getJobsByIds as any).mockResolvedValueOnce([
                { id: 'job1', title: 'Software Engineer', status: 'active' }
            ]);

            const result = await ShortlistService.getDailyShortlist(userId);

            expect(result.jobs).toHaveLength(1);
            expect(result.jobs[0].matchScore).toBe(0.9);
            expect(result.isColdStart).toBe(false);
        });

        it('should generate new shortlist if cache is empty', async () => {
            (getDocs as any).mockResolvedValueOnce({ empty: true }); // Cache empty

            // Mock generateShortlist internal calls
            (getDoc as any).mockResolvedValueOnce({
                exists: () => true,
                data: () => ({ skills: ['React'], preferences: { roles: ['Developer'] } })
            });
            (callAIProxy as any).mockResolvedValueOnce({ embedding: new Array(768).fill(0.1) });
            (getDocs as any).mockResolvedValueOnce({ // Active jobs query
                empty: false,
                docs: [
                    { id: 'job_new', data: () => ({ title: 'New Job', status: 'active', skills: ['React'], embedding: new Array(768).fill(0.1) }) }
                ]
            });

            const result = await ShortlistService.getDailyShortlist(userId);

            expect(result.jobs).toHaveLength(1);
            expect(result.jobs[0].id).toBe('job_new');
            expect(writeBatch).toHaveBeenCalled();
        });
    });

    describe('generateMatchReason', () => {
        it('should return excellent match for high score', () => {
            const reason = ShortlistService.generateMatchReason(0.9, {} as any, {} as any);
            expect(reason).toContain('Excellent match');
        });

        it('should identify specific skill overlap', () => {
            const job = { skills: ['React', 'TypeScript'] };
            const context = { skills: ['React', 'Node.js'] };
            const reason = ShortlistService.generateMatchReason(0.7, job as any, context as any);
            expect(reason).toContain('Matches your skills in react');
        });
    });
});
