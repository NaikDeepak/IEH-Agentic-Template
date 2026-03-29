import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JobService } from '../jobService';
import { 
    addDoc, 
    getDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc,
    serverTimestamp,
    Timestamp,
    vector
} from 'firebase/firestore';
import { CompanyService } from '../../../companies/services/companyService';
import { callAIProxy } from '../../../../lib/ai/proxy';
import { trackJobActivity } from '../../../../lib/activity';

// Mock Firestore
vi.mock('firebase/firestore', () => ({
    collection: vi.fn(),
    addDoc: vi.fn(),
    serverTimestamp: vi.fn(() => 'mock-timestamp'),
    doc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    getDoc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    getDocs: vi.fn(),
    limit: vi.fn(),
    Timestamp: {
        fromDate: vi.fn((date) => ({ toDate: () => date }))
    },
    vector: vi.fn((v) => v)
}));

vi.mock('../../../../lib/firebase', () => ({
    db: {}
}));

vi.mock('../../../../lib/ai/embedding', () => ({
    EMBEDDING_DIMENSION: 1536
}));

vi.mock('../../../../lib/ai/proxy', () => ({
    callAIProxy: vi.fn()
}));

vi.mock('../../../companies/services/companyService', () => ({
    CompanyService: {
        getCompanyByEmployerId: vi.fn()
    }
}));

vi.mock('../../../../lib/activity', () => ({
    trackJobActivity: vi.fn()
}));

describe('JobService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createJob', () => {
        const mockInput = {
            title: 'Frontend Engineer',
            description: 'Work with React',
            skills: ['React', 'TypeScript'],
            location: 'Remote',
            type: 'full-time',
            work_mode: 'remote',
            employer_id: 'emp123',
            salary_min: 100000,
            salary_max: 150000,
            currency: 'USD'
        };

        it('creates a job with generated embedding', async () => {
            const mockEmbedding = new Array(1536).fill(0.1);
            (callAIProxy as any).mockResolvedValueOnce({ embedding: mockEmbedding });
            (CompanyService.getCompanyByEmployerId as any).mockResolvedValueOnce({ id: 'comp123' });
            (addDoc as any).mockResolvedValueOnce({ id: 'job123' });

            const jobId = await JobService.createJob(mockInput as any);

            expect(jobId).toBe('job123');
            expect(callAIProxy).toHaveBeenCalledWith('/api/ai/embedding', expect.any(Object));
            expect(addDoc).toHaveBeenCalledWith(undefined, expect.objectContaining({
                title: 'Frontend Engineer',
                company_id: 'comp123',
                status: 'active',
                embedding: mockEmbedding
            }));
        });

        it('handles embedding service error', async () => {
            (callAIProxy as any).mockResolvedValueOnce({ embedding: 'invalid' });
            
            await expect(JobService.createJob(mockInput as any)).rejects.toThrow(/invalid vector/);
        });
    });

    describe('updateJob', () => {
        it('updates job fields and regenerates embedding if needed', async () => {
            const mockJobId = 'job123';
            const updates = { title: 'Senior Frontend Engineer' };
            const mockCurrentData = {
                title: 'Frontend Engineer',
                description: 'React work',
                skills: ['React'],
                location: 'Remote',
                type: 'full-time',
                work_mode: 'remote'
            };

            (getDoc as any).mockResolvedValueOnce({
                exists: () => true,
                data: () => mockCurrentData
            });
            (callAIProxy as any).mockResolvedValueOnce({ embedding: new Array(1536).fill(0.2) });

            await JobService.updateJob(mockJobId, updates);

            expect(updateDoc).toHaveBeenCalled();
            expect(trackJobActivity).toHaveBeenCalledWith(mockJobId);
        });
    });

    describe('getJobs', () => {
        it('fetches active jobs', async () => {
            const mockDocs = [
                { id: '1', data: () => ({ title: 'Job 1' }) },
                { id: '2', data: () => ({ title: 'Job 2' }) }
            ];
            (getDocs as any).mockResolvedValueOnce({ docs: mockDocs });

            const jobs = await JobService.getJobs();

            expect(jobs).toHaveLength(2);
            expect(jobs[0].id).toBe('1');
        });
    });

    describe('getJobById', () => {
        it('returns job data if exists', async () => {
            (getDoc as any).mockResolvedValueOnce({
                exists: () => true,
                id: 'job123',
                data: () => ({ title: 'Job 123' })
            });

            const job = await JobService.getJobById('job123');
            expect(job?.id).toBe('job123');
        });

        it('returns null if not found', async () => {
            (getDoc as any).mockResolvedValueOnce({ exists: () => false });
            const job = await JobService.getJobById('missing');
            expect(job).toBeNull();
        });
    });

    describe('deleteJob', () => {
        it('deletes job from firestore', async () => {
            await JobService.deleteJob('job123');
            expect(deleteDoc).toHaveBeenCalled();
        });
    });

    describe('getJobById with isOwner', () => {
        it('tracks activity when isOwner is true', async () => {
            (getDoc as any).mockResolvedValueOnce({
                exists: () => true,
                id: 'job123',
                data: () => ({ title: 'Job 123' })
            });

            await JobService.getJobById('job123', true);
            expect(trackJobActivity).toHaveBeenCalledWith('job123');
        });

        it('returns null on error instead of throwing', async () => {
            (getDoc as any).mockRejectedValueOnce(new Error('Firestore down'));
            const job = await JobService.getJobById('any-job');
            expect(job).toBeNull();
        });
    });

    describe('getJobsByCompanyId', () => {
        it('returns jobs for a company', async () => {
            const mockDocs = [
                { id: 'j1', data: () => ({ title: 'Company Job 1' }) }
            ];
            (getDocs as any).mockResolvedValueOnce({ docs: mockDocs });

            const jobs = await JobService.getJobsByCompanyId('comp123');
            expect(jobs).toHaveLength(1);
            expect(jobs[0].id).toBe('j1');
        });

        it('throws on firestore error', async () => {
            (getDocs as any).mockRejectedValueOnce(new Error('Firestore error'));
            await expect(JobService.getJobsByCompanyId('comp')).rejects.toThrow('Firestore error');
        });
    });

    describe('getJobsByEmployerId', () => {
        it('returns all jobs for an employer', async () => {
            const mockDocs = [
                { id: 'j1', data: () => ({ title: 'Employer Job 1', status: 'active' }) },
                { id: 'j2', data: () => ({ title: 'Employer Job 2', status: 'closed' }) }
            ];
            (getDocs as any).mockResolvedValueOnce({ docs: mockDocs });

            const jobs = await JobService.getJobsByEmployerId('emp123');
            expect(jobs).toHaveLength(2);
        });
    });

    describe('getJobsByIds', () => {
        it('returns empty array for empty input', async () => {
            const jobs = await JobService.getJobsByIds([]);
            expect(jobs).toEqual([]);
        });

        it('fetches jobs by IDs in chunks', async () => {
            const mockDocs = [{ id: 'j1', data: () => ({ title: 'Job 1' }) }];
            (getDocs as any).mockResolvedValueOnce({ docs: mockDocs });

            const jobs = await JobService.getJobsByIds(['j1', 'j2', 'j3']);
            expect(jobs).toHaveLength(1);
            expect(getDocs).toHaveBeenCalled();
        });

        it('throws on firestore error', async () => {
            (getDocs as any).mockRejectedValueOnce(new Error('Batch error'));
            await expect(JobService.getJobsByIds(['j1'])).rejects.toThrow('Batch error');
        });
    });

    describe('setJobStatus', () => {
        it('updates job status', async () => {
            await JobService.setJobStatus('job123', 'passive');
            expect(updateDoc).toHaveBeenCalledWith(undefined, { status: 'passive', updated_at: 'mock-timestamp' });
        });

        it('throws on firestore error', async () => {
            (updateDoc as any).mockRejectedValueOnce(new Error('Update failed'));
            await expect(JobService.setJobStatus('job123', 'closed')).rejects.toThrow('Update failed');
        });
    });

    describe('updateJob edge cases', () => {
        it('throws when job not found during embedding regen', async () => {
            (getDoc as any).mockResolvedValueOnce({ exists: () => false });

            await expect(JobService.updateJob('missing-job', { title: 'New Title' }))
                .rejects.toThrow('Job missing-job not found');
        });

        it('updates without embedding regen when non-semantic fields change', async () => {
            await JobService.updateJob('job123', { contactEmail: 'new@test.com' } as any);
            expect(callAIProxy).not.toHaveBeenCalled();
            expect(updateDoc).toHaveBeenCalled();
        });
    });

    describe('createJob without company', () => {
        it('creates job with null company_id when company not found', async () => {
            const mockEmbedding = new Array(1536).fill(0.1);
            (callAIProxy as any).mockResolvedValueOnce({ embedding: mockEmbedding });
            (CompanyService.getCompanyByEmployerId as any).mockResolvedValueOnce(null);
            (addDoc as any).mockResolvedValueOnce({ id: 'job456' });

            const jobId = await JobService.createJob({
                title: 'Dev',
                description: 'Desc',
                skills: ['React'],
                location: 'Remote',
                type: 'full-time',
                work_mode: 'remote',
                employer_id: 'emp999'
            } as any);

            expect(jobId).toBe('job456');
            expect(addDoc).toHaveBeenCalledWith(undefined, expect.objectContaining({
                company_id: null
            }));
        });
    });
});
