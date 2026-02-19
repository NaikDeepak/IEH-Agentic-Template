import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LedgerService } from '../../src/features/growth/services/ledgerService';
import * as Sentry from '@sentry/react';

const mockTransaction = {
    get: vi.fn(),
    set: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
};

// Mock Dependencies
vi.mock('../../src/lib/firebase', () => ({
    db: {}
}));

vi.mock('firebase/firestore', () => ({
    doc: vi.fn(() => ({ id: 'mock-doc-id' })),
    collection: vi.fn(() => ({ id: 'mock-coll-id' })),
    runTransaction: vi.fn(async (_db, cb) => cb(mockTransaction)),
    serverTimestamp: vi.fn(() => 'mock-timestamp')
}));

vi.mock('@sentry/react', () => ({
    startSpan: vi.fn((_ctx, cb) => cb({ setAttribute: vi.fn() })),
    captureException: vi.fn(),
    logger: {
        info: vi.fn(),
        error: vi.fn(),
        fmt: vi.fn((strings, ...values) => strings[0] + values.map((v, i) => v + strings[i + 1]).join(''))
    }
}));

describe('LedgerService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('adjustPoints', () => {
        const uid = 'user123';

        it('should update points and log entry successfully', async () => {
            mockTransaction.get.mockResolvedValueOnce({
                exists: () => true,
                data: () => ({ browniePoints: 100 })
            });

            await LedgerService.adjustPoints(uid, 50, 'referral_bonus');

            expect(mockTransaction.update).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
                browniePoints: 150
            }));
            expect(mockTransaction.set).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
                amount: 50,
                type: 'referral_bonus'
            }));
        });

        it('should throw error if user does not exist', async () => {
            mockTransaction.get.mockResolvedValueOnce({
                exists: () => false
            });

            await expect(LedgerService.adjustPoints(uid, 50, 'referral_bonus'))
                .rejects.toThrow('User does not exist');

            expect(Sentry.captureException).toHaveBeenCalled();
        });

        it('should throw error on insufficient points', async () => {
            mockTransaction.get.mockResolvedValueOnce({
                exists: () => true,
                data: () => ({ browniePoints: 10 })
            });

            await expect(LedgerService.adjustPoints(uid, -50, 'redemption'))
                .rejects.toThrow('Insufficient points for this transaction');
        });
    });

    describe('addReferralBonus', () => {
        it('should call adjustPoints with correct values', async () => {
            const spy = vi.spyOn(LedgerService, 'adjustPoints').mockResolvedValueOnce(undefined);

            await LedgerService.addReferralBonus('ref1', 'user1');

            expect(spy).toHaveBeenCalledWith('ref1', 50, 'referral_bonus', { referredUid: 'user1' });
        });
    });
});
