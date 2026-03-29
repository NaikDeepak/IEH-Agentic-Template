import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationsService } from '../notificationsService';
import { 
  addDoc, 
  updateDoc, 
  getDocs, 
  onSnapshot
} from 'firebase/firestore';

// Mock Firestore
const mockDocRef = { id: 'mock-notif-id' };
const mockBatch = {
  update: vi.fn(),
  commit: vi.fn(() => Promise.resolve()),
};

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({})),
  addDoc: vi.fn(() => Promise.resolve(mockDocRef)),
  updateDoc: vi.fn(() => Promise.resolve()),
  doc: vi.fn(() => ({})),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  getDocs: vi.fn(),
  writeBatch: vi.fn(() => mockBatch),
  onSnapshot: vi.fn((_q, cb: any) => {
    // Immediate callback with mock data for testing
    cb({
      docs: [
        { id: 'n123', data: (_opts: any) => ({ title: 'Test Notif', userId: 'user123' }) }
      ]
    });
    return vi.fn(); // Unsubscribe function
  }),
  serverTimestamp: vi.fn(() => 'mock-timestamp'),
}));

vi.mock('../../../lib/firebase', () => ({
  db: {}
}));

describe('NotificationsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('subscribe', () => {
    it('sets up a snapshot listener and maps data', () => {
      const callback = vi.fn();
      const unsubscribe = NotificationsService.subscribe('user123', callback);

      expect(onSnapshot).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith([
        expect.objectContaining({ id: 'n123', title: 'Test Notif' })
      ]);
      expect(typeof unsubscribe).toBe('function');
    });
  });

  describe('create', () => {
    it('creates a notification if actor is the same as recipient', async () => {
      await NotificationsService.create(
        'user123',
        'user123',
        'SYSTEM' as any,
        'Welcome',
        'Hello message'
      );

      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          userId: 'user123',
          title: 'Welcome',
          message: 'Hello message',
          read: false
        })
      );
    });

    it('throws error if actor is different from recipient', async () => {
      await expect(
        NotificationsService.create(
          'actor123',
          'user123',
          'SYSTEM' as any,
          'Bad',
          'Cross-user'
        )
      ).rejects.toThrow('Cross-user notifications are blocked on client');
    });
  });

  describe('markRead', () => {
    it('updates the specific notification doc', async () => {
      await NotificationsService.markRead('notif123');
      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        { read: true }
      );
    });
  });

  describe('markAllRead', () => {
    it('uses batches to update unread notifications', async () => {
      const mockDocs = [
        { ref: { id: 'n1' } },
        { ref: { id: 'n2' } }
      ];
      vi.mocked(getDocs).mockResolvedValue({
        empty: false,
        docs: mockDocs
      } as any);

      await NotificationsService.markAllRead('user123');

      expect(getDocs).toHaveBeenCalled();
      expect(mockBatch.update).toHaveBeenCalledTimes(2);
      expect(mockBatch.commit).toHaveBeenCalled();
    });

    it('returns early if no unread notifications found', async () => {
      vi.mocked(getDocs).mockResolvedValue({ empty: true } as any);
      await NotificationsService.markAllRead('user123');
      expect(mockBatch.commit).not.toHaveBeenCalled();
    });
  });
});
