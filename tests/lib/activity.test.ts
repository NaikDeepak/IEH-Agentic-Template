import { describe, it, expect, vi, beforeEach } from 'vitest';
import { trackUserActivity, trackJobActivity } from '../../src/lib/activity';
import { updateDoc, doc } from 'firebase/firestore';

// Mock Firebase
vi.mock('firebase/firestore', () => ({
    doc: vi.fn(),
    updateDoc: vi.fn(),
    serverTimestamp: vi.fn(() => 'mock-timestamp'),
    Timestamp: {
        fromDate: vi.fn((date: Date) => ({ seconds: Math.floor(date.getTime() / 1000) }))
    }
}));

vi.mock('../../src/lib/firebase', () => ({
    db: {}
}));

describe('Activity Tracking', () => {
    const userId = 'user123';
    const jobId = 'job456';

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    describe('trackUserActivity', () => {
        it('should update user activity in Firestore and set localStorage', async () => {
            const mockDocRef = { id: userId };
            (doc as any).mockReturnValue(mockDocRef);
            (updateDoc as any).mockResolvedValue(undefined);

            await trackUserActivity(userId);

            expect(updateDoc).toHaveBeenCalledWith(mockDocRef, expect.objectContaining({
                status: 'active',
                lastActiveAt: 'mock-timestamp'
            }));
            expect(localStorage.getItem(`last_active_user_${userId}`)).not.toBeNull();
        });

        it('should skip update if within debounce period', async () => {
            const now = Date.now();
            localStorage.setItem(`last_active_user_${userId}`, now.toString());

            await trackUserActivity(userId);

            expect(updateDoc).not.toHaveBeenCalled();
        });

        it('should fail silently if updateDoc throws', async () => {
            (updateDoc as any).mockRejectedValue(new Error('Firestore error'));

            // Should not throw
            await expect(trackUserActivity(userId)).resolves.not.toThrow();
        });
    });

    describe('trackJobActivity', () => {
        it('should update job activity in Firestore', async () => {
            const mockDocRef = { id: jobId };
            (doc as any).mockReturnValue(mockDocRef);
            (updateDoc as any).mockResolvedValue(undefined);

            await trackJobActivity(jobId);

            expect(updateDoc).toHaveBeenCalledWith(mockDocRef, expect.objectContaining({
                status: 'active',
                lastActiveAt: 'mock-timestamp'
            }));
        });

        it('should skip update if within debounce period', async () => {
            const now = Date.now();
            localStorage.setItem(`last_active_job_${jobId}`, now.toString());

            await trackJobActivity(jobId);

            expect(updateDoc).not.toHaveBeenCalled();
        });
    });
});
