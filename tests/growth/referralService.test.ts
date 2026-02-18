import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReferralService } from '../../src/features/growth/services/referralService';
import { getDoc } from 'firebase/firestore';

const { mockTransaction } = vi.hoisted(() => ({
    mockTransaction: {
        get: vi.fn(),
        set: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    }
}));

// Mock Dependencies
vi.mock('../../src/lib/firebase', () => ({
    db: {}
}));

vi.mock('../../src/lib/utils/codes', () => ({
    generateReferralCode: vi.fn().mockReturnValue('IEH-123456')
}));

vi.mock('firebase/firestore', () => ({
    doc: vi.fn(),
    getDoc: vi.fn(),
    setDoc: vi.fn(),
    updateDoc: vi.fn(),
    getFirestore: vi.fn(() => ({})),
    runTransaction: vi.fn(async (_db, callback) => {
        return callback(mockTransaction);
    })
}));

describe('ReferralService', () => {
    const uid = 'user123';

    beforeEach(() => {
        vi.clearAllMocks();
        mockTransaction.set.mockClear();
        mockTransaction.get.mockClear();
        mockTransaction.update.mockClear();
        mockTransaction.delete.mockClear();
    });

    describe('ensureReferralCode', () => {
        it('should return existing code if present', async () => {
            (getDoc as any).mockResolvedValueOnce({
                exists: () => true,
                data: () => ({ referralCode: 'EXISTING-123' })
            });

            const code = await ReferralService.ensureReferralCode(uid);

            expect(code).toBe('EXISTING-123');
            expect(mockTransaction.set).not.toHaveBeenCalled();
        });

        it('should generate and save new code if missing', async () => {
            // 1st getDoc (user profile) -> no referral code
            (getDoc as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ exists: () => true, data: () => ({}) });

            // The uniqueness check now happens inside the transaction via transaction.get().
            // Mock transaction.get() to return a non-existent code (unique).
            mockTransaction.get.mockResolvedValueOnce({ exists: () => false });

            const code = await ReferralService.ensureReferralCode(uid);

            expect(code).toBe('IEH-123456');
            expect(mockTransaction.set).toHaveBeenCalledTimes(2);
        });

        it('should throw error if fails to generate unique code after 5 attempts', async () => {
            // User profile has no referral code
            (getDoc as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ exists: () => true, data: () => ({}) });

            // All transaction.get() calls return an existing code (collision every time)
            mockTransaction.get.mockResolvedValue({ exists: () => true });

            await expect(ReferralService.ensureReferralCode(uid)).rejects.toThrow('Failed to generate a unique referral code');
        });
    });

    describe('getUserByReferralCode', () => {
        it('should resolve code to uid', async () => {
            const code = 'MY-CODE';
            (getDoc as any).mockResolvedValueOnce({
                exists: () => true,
                data: () => ({ uid: 'referred-user-id' })
            });

            const resolvedUid = await ReferralService.getUserByReferralCode(code);

            expect(resolvedUid).toBe('referred-user-id');
        });

        it('should return null if code not found', async () => {
            (getDoc as any).mockResolvedValueOnce({ exists: () => false });

            const result = await ReferralService.getUserByReferralCode('INVALID');

            expect(result).toBeNull();
        });
    });
});
