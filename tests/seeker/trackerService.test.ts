import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TrackerService } from '../../src/features/seeker/services/trackerService';
import { getDocs } from 'firebase/firestore';

// Mock Dependencies
vi.mock('../../src/lib/firebase', () => ({
    db: {}
}));

vi.mock('firebase/firestore', () => ({
    collection: vi.fn(),
    getDocs: vi.fn(),
    query: vi.fn(),
    where: vi.fn()
}));

describe('TrackerService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getSeekerApplications', () => {
        it('should fetch and map applications for a seeker', async () => {
            const mockDocs = [
                { id: 'app1', data: () => ({ job_id: 'job1', status: 'applied' }) }
            ];
            (getDocs as any).mockResolvedValueOnce({ docs: mockDocs });

            const results = await TrackerService.getSeekerApplications('user123');

            expect(results).toHaveLength(1);
            expect(results[0].job_id).toBe('job1');
        });

        it('should throw and log error if fetch fails', async () => {
            (getDocs as any).mockRejectedValueOnce(new Error('Firestore Error'));
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            await expect(TrackerService.getSeekerApplications('user123'))
                .rejects.toThrow('Firestore Error');
            expect(consoleSpy).toHaveBeenCalled();
        });
    });
});
