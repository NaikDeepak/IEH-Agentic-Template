import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JobService } from '../../../src/features/jobs/services/jobService';
import { getDocs, addDoc, getDoc } from 'firebase/firestore';
import { CompanyService } from '../../../src/features/companies/services/companyService';
import { callAIProxy } from '../../../src/lib/ai/proxy';

// Mock Firebase
vi.mock('../../../src/lib/firebase', () => ({
    db: {}
}));

vi.mock('firebase/firestore', () => ({
    collection: vi.fn(),
    addDoc: vi.fn(),
    serverTimestamp: vi.fn(() => 'mock-timestamp'),
    doc: vi.fn(),
    updateDoc: vi.fn(),
    getDoc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    getDocs: vi.fn(),
    limit: vi.fn(),
    Timestamp: {
        fromDate: vi.fn((date) => ({ toDate: () => date })),
        now: vi.fn(() => ({ toDate: () => new Date() }))
    }
}));

vi.mock('../../../src/features/companies/services/companyService', () => ({
    CompanyService: {
        getCompanyByEmployerId: vi.fn()
    }
}));

vi.mock('../../../src/lib/ai/proxy', () => ({
    callAIProxy: vi.fn()
}));

vi.mock('../../../src/lib/activity', () => ({
    trackJobActivity: vi.fn()
}));

describe('JobService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createJob', () => {
        it('creates a job with generated embedding', async () => {
            const mockInput = {
                title: 'Software Engineer',
                description: 'Build cool stuff',
                skills: ['React', 'TypeScript'],
                location: 'Remote',
                type: 'full-time' as const,
                work_mode: 'remote' as const,
                employer_id: 'e1'
            };

            (CompanyService.getCompanyByEmployerId as any).mockResolvedValue({ id: 'c1' });
            (callAIProxy as any).mockResolvedValue({ embedding: new Array(768).fill(0.1) });
            (addDoc as any).mockResolvedValue({ id: 'job123' });

            const jobId = await JobService.createJob(mockInput);

            expect(jobId).toBe('job123');
            expect(addDoc).toHaveBeenCalled();
            expect(callAIProxy).toHaveBeenCalledWith('/api/ai/embedding', expect.anything());
        });

        it('handles embedding service errors', async () => {
            (callAIProxy as any).mockResolvedValue({ embedding: [0.1] }); // Wrong dimension

            await expect(JobService.createJob({
                title: 'T', description: 'D', skills: ['S'], location: 'L', type: 'full-time', work_mode: 'remote', employer_id: 'e1'
            } as any)).rejects.toThrow(/invalid vector/);
        });
    });

    describe('getJobs', () => {
        it('fetches active jobs', async () => {
            const mockSnap = {
                docs: [
                    { id: 'j1', data: () => ({ title: 'Job 1', status: 'active' }) },
                    { id: 'j2', data: () => ({ title: 'Job 2', status: 'active' }) }
                ]
            };
            (getDocs as any).mockResolvedValue(mockSnap);

            const jobs = await JobService.getJobs();
            expect(jobs).toHaveLength(2);
            expect(jobs[0].title).toBe('Job 1');
        });
    });

    describe('getJobById', () => {
        it('returns job data if exists', async () => {
            (getDoc as any).mockResolvedValue({
                exists: () => true,
                id: 'j1',
                data: () => ({ title: 'Job 1' })
            });

            const job = await JobService.getJobById('j1');
            expect(job?.title).toBe('Job 1');
        });

        it('returns null if not found', async () => {
            (getDoc as any).mockResolvedValue({ exists: () => false });
            const job = await JobService.getJobById('missing');
            expect(job).toBeNull();
        });
    });

    describe('getJobsByEmployerId', () => {
        it('queries jobs by employer_id', async () => {
            (getDocs as any).mockResolvedValue({ docs: [] });
            await JobService.getJobsByEmployerId('e1');
            expect(getDocs).toHaveBeenCalled();
        });
    });

    describe('getJobsByIds', () => {
        it('fetches jobs in chunks of 10', async () => {
            const ids = Array.from({ length: 15 }, (_, i) => `id${i}`);
            (getDocs as any).mockResolvedValue({ docs: [] });

            await JobService.getJobsByIds(ids);

            // Should call getDocs twice (one for 10, one for 5)
            expect(getDocs).toHaveBeenCalledTimes(2);
        });

        it('returns empty array for empty input', async () => {
            const result = await JobService.getJobsByIds([]);
            expect(result).toEqual([]);
        });
    });
});
