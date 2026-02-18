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
        mockTransaction.set.mockReset();
        mockTransaction.get.mockReset();
        mockTransaction.update.mockReset();
        mockTransaction.delete.mockReset();
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

            // Inside the transaction: 1st tx.get = userRef (no existing code), 2nd tx.get = codeRef (unique)
            mockTransaction.get
                .mockResolvedValueOnce({ exists: () => true, data: () => ({}) })  // userRef: no referralCode
                .mockResolvedValueOnce({ exists: () => false });                   // codeRef: not taken

            const code = await ReferralService.ensureReferralCode(uid);

            // generateReferralCode mock returns 'IEH-123456'; the full display code is stored on the user profile
            expect(code).toBe('IEH-123456');
            expect(mockTransaction.set).toHaveBeenCalledTimes(2);
        });

        it('should return existing code if a concurrent request already committed one', async () => {
            // Initial getDoc: no code yet
            (getDoc as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ exists: () => true, data: () => ({}) });

            // Inside the transaction: tx.get(userRef) finds a code already written by a concurrent request
            mockTransaction.get.mockResolvedValueOnce({
                exists: () => true,
                data: () => ({ referralCode: 'IEH-CONCURRENT' })
            });

            // The code logic now returns directly from transaction if existing code found.
            // No second getDoc call is made.

            const code = await ReferralService.ensureReferralCode(uid);
            expect(code).toBe('IEH-CONCURRENT');
            expect(mockTransaction.set).not.toHaveBeenCalled();
        });

        it('should throw error if fails to generate unique code after 5 attempts', async () => {
            // User profile has no referral code
            (getDoc as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ exists: () => true, data: () => ({}) });

            // All transaction.get() calls
            // For each attempt (loop 5 times):
            // 1. tx.get(userRef) -> exists, no code
            // 2. tx.get(codeRef) -> exists (collision)
            // Total 10 calls.

            mockTransaction.get
                .mockResolvedValueOnce({ exists: () => true, data: () => ({}) })  // attempt 1: userRef
                .mockResolvedValueOnce({ exists: () => true })                    // attempt 1: codeRef collision
                .mockResolvedValueOnce({ exists: () => true, data: () => ({}) })  // attempt 2: userRef
                .mockResolvedValueOnce({ exists: () => true })                    // attempt 2: codeRef collision
                .mockResolvedValueOnce({ exists: () => true, data: () => ({}) })  // attempt 3: userRef
                .mockResolvedValueOnce({ exists: () => true })                    // attempt 3: codeRef collision
                .mockResolvedValueOnce({ exists: () => true, data: () => ({}) })  // attempt 4: userRef
                .mockResolvedValueOnce({ exists: () => true })                    // attempt 4: codeRef collision
                .mockResolvedValueOnce({ exists: () => true, data: () => ({}) })  // attempt 5: userRef
                .mockResolvedValueOnce({ exists: () => true });                   // attempt 5: codeRef collision

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
