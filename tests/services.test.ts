import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JobService } from '../src/features/jobs/services/jobService';
import { CandidateService } from '../src/features/candidates/services/candidateService';
import { searchJobs } from '../src/lib/ai/search';

// 1. Mock Firebase Firestore
vi.mock('firebase/firestore', () => ({
    collection: vi.fn(),
    addDoc: vi.fn(),
    serverTimestamp: vi.fn(() => 'mock-timestamp'),
    doc: vi.fn(),
    updateDoc: vi.fn(),
    getDoc: vi.fn(),
    getFirestore: vi.fn(() => ({})),
}));

import { addDoc, updateDoc, getDoc } from 'firebase/firestore';

// 2. Mock global fetch
global.fetch = vi.fn();

describe('Frontend Services Logic', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('JobService', () => {
        it('should create a job with automated embedding', async () => {
            const input = {
                title: 'Software Engineer',
                skills: ['React', 'TS'],
                location: 'Remote',
                type: 'FULL_TIME',
                work_mode: 'REMOTE',
                description: 'Build cool stuff',
                employer_id: 'emp123',
                salary_range: '100k'
            };

            // Mock embedding API
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ embedding: new Array(768).fill(0.1) })
            });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (addDoc as any).mockResolvedValueOnce({ id: 'job123' });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const jobId = await JobService.createJob(input as any);

            expect(jobId).toBe('job123');
            expect(global.fetch).toHaveBeenCalledWith('/api/embedding', expect.anything());
            expect(addDoc).toHaveBeenCalledWith(undefined, expect.objectContaining({
                title: 'Software Engineer',
                embedding: expect.any(Array)
            }));
        });

        it('should regenerate embedding on update if semantic fields change', async () => {
            const jobId = 'job123';
            const updates = { title: 'Senior Software Engineer' };

            // Mock getDoc for current data
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (getDoc as any).mockResolvedValueOnce({
                exists: () => true,
                data: () => ({ title: 'Software Engineer', skills: ['React'], location: 'US', type: 'FT', work_mode: 'REMOTE', description: 'desc' })
            });

            // Mock embedding API
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ embedding: new Array(768).fill(0.2) })
            });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await JobService.updateJob(jobId, updates as any);

            expect(updateDoc).toHaveBeenCalledWith(undefined, expect.objectContaining({
                title: 'Senior Software Engineer',
                embedding: expect.any(Array)
            }));
        });
    });

    describe('CandidateService', () => {
        it('should update profile and regenerate embedding if skills change', async () => {
            const uid = 'user123';
            const updates = { skills: ['Node.js'] };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (getDoc as any).mockResolvedValueOnce({
                exists: () => true,
                data: () => ({ skills: ['React'], parsed_data: { summary: 'bio' } })
            });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ embedding: [0.5] })
            });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await CandidateService.updateProfile(uid, updates as any);

            expect(updateDoc).toHaveBeenCalledWith(undefined, expect.objectContaining({
                skills: ['Node.js'],
                embedding: [0.5]
            }));
        });
    });

    describe('searchJobs', () => {
        it('should call the backend API and return jobs', async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ jobs: [{ id: '1', title: 'Job 1' }] })
            });

            const results = await searchJobs('engineer', 5);

            expect(results).toHaveLength(1);
            expect(global.fetch).toHaveBeenCalledWith('/api/jobs/search', expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ query: 'engineer', limit: 5 })
            }));
        });
    });
});
