import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JobAlertsService } from '../jobAlertsService';
import { 
  addDoc, 
  getDocs, 
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';

// Mock Firestore
const mockDocRef = { id: 'mock-alert-id' };
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({ id: 'mock-col-id' })),
  addDoc: vi.fn(() => Promise.resolve(mockDocRef)),
  getDocs: vi.fn(() => Promise.resolve({
    docs: [
      { id: 'a1', data: () => ({ seekerId: 's123', keywords: 'react', location: 'remote', jobType: 'FULL_TIME', active: true }) }
    ]
  })),
  query: vi.fn(),
  where: vi.fn(),
  deleteDoc: vi.fn(() => Promise.resolve()),
  doc: vi.fn(() => ({ id: 'mock-doc-id' })),
  updateDoc: vi.fn(() => Promise.resolve()),
  serverTimestamp: vi.fn(() => 'mock-timestamp'),
  orderBy: vi.fn(),
}));

vi.mock('../../../lib/firebase', () => ({
  db: {}
}));

describe('JobAlertsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAlerts', () => {
    it('fetches alerts for a seeker', async () => {
      const alerts = await JobAlertsService.getAlerts('s123');
      expect(getDocs).toHaveBeenCalled();
      expect(alerts).toHaveLength(1);
      expect(alerts[0].keywords).toBe('react');
    });
  });

  describe('createAlert', () => {
    it('creates an alert and generates correct tokens', async () => {
      const alertId = await JobAlertsService.createAlert(
        's123',
        'React, TypeScript',
        'New York',
        'FULL_TIME'
      );

      expect(alertId).toBe('mock-alert-id');
      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          seekerId: 's123',
          keywords: 'React, TypeScript',
          location: 'New York',
          jobType: 'FULL_TIME',
          active: true,
          searchTokens: expect.arrayContaining(['react', 'typescript', 'loc:new-york', 'type:full_time'])
        })
      );
    });

    it('handles empty strings and special characters in tokens', async () => {
       await JobAlertsService.createAlert(
        's123',
        'a', // too short for keywords
        ' ', 
        ''
      );

      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          searchTokens: []
        })
      );
    });
  });

  describe('toggleAlert', () => {
    it('updates the active status of an alert', async () => {
      await JobAlertsService.toggleAlert('alert123', false);
      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        { active: false }
      );
    });
  });

  describe('deleteAlert', () => {
    it('removes the alert document', async () => {
      await JobAlertsService.deleteAlert('alert123');
      expect(deleteDoc).toHaveBeenCalled();
    });
  });
});
