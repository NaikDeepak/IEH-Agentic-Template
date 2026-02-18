import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApplicationService } from '../../src/features/applications/services/applicationService';
import { getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';

// Mock Dependencies
vi.mock('../../src/lib/firebase', () => ({
    db: {}
}));

vi.mock('firebase/firestore', () => ({
    collection: vi.fn(),
    doc: vi.fn(),
    getDocs: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    addDoc: vi.fn(),
    updateDoc: vi.fn(),
    serverTimestamp: vi.fn(() => 'mock-timestamp'),
    orderBy: vi.fn(),
    limit: vi.fn()
}));

describe('ApplicationService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getApplicationsForJob', () => {
        it('should fetch and map applications for a job', async () => {
            const mockDocs = [
                { id: 'app1', data: () => ({ candidate_id: 'user1', status: 'applied' }) },
                { id: 'app2', data: () => ({ candidate_id: 'user2', status: 'shortlisted' }) }
            ];
            (getDocs as any).mockResolvedValueOnce({ docs: mockDocs });

            const results = await ApplicationService.getApplicationsForJob('job123');

            expect(results).toHaveLength(2);
            expect(results[0].id).toBe('app1');
            expect(results[1].status).toBe('shortlisted');
        });
    });

    describe('hasApplied', () => {
        it('should return true if application exists', async () => {
            (getDocs as any).mockResolvedValueOnce({ empty: false });
            const result = await ApplicationService.hasApplied('job1', 'user1');
            expect(result).toBe(true);
        });

        it('should return false if no application exists', async () => {
            (getDocs as any).mockResolvedValueOnce({ empty: true });
            const result = await ApplicationService.hasApplied('job1', 'user1');
            expect(result).toBe(false);
        });
    });

    describe('updateApplicationStatus', () => {
        it('should update Firestore document with new status', async () => {
            const mockDocRef = { id: 'app123' };
            (doc as any).mockReturnValueOnce(mockDocRef);

            await ApplicationService.updateApplicationStatus('app123', 'shortlisted');

            expect(updateDoc).toHaveBeenCalledWith(mockDocRef, {
                status: 'shortlisted',
                updated_at: 'mock-timestamp'
            });
        });

        it('should throw error and log if update fails', async () => {
            (updateDoc as any).mockRejectedValueOnce(new Error('Firebase Error'));
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            await expect(ApplicationService.updateApplicationStatus('app123', 'shortlisted'))
                .rejects.toThrow('Firebase Error');
            expect(consoleSpy).toHaveBeenCalled();
        });
    });

    describe('submitApplication', () => {
        it('should create a new application document', async () => {
            (addDoc as any).mockResolvedValueOnce({ id: 'new-app-id' });
            const input = { job_id: 'job1', candidate_id: 'user1', resume_url: 'url' };

            const appId = await ApplicationService.submitApplication(input as any);

            expect(appId).toBe('new-app-id');
            expect(addDoc).toHaveBeenCalledWith(undefined, expect.objectContaining({
                ...input,
                status: 'applied',
                applied_at: 'mock-timestamp'
            }));
        });
    });
});
