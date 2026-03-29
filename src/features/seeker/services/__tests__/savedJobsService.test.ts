import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SavedJobsService } from '../savedJobsService';
import { 
  doc,
  setDoc, 
  deleteDoc, 
  getDoc, 
  getDocs
} from 'firebase/firestore';

// Mock Firestore
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(() => ({ id: 'mock-doc-id' })),
  setDoc: vi.fn(() => Promise.resolve()),
  deleteDoc: vi.fn(() => Promise.resolve()),
  getDoc: vi.fn(),
  collection: vi.fn(() => ({ id: 'mock-col-id' })),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(),
  serverTimestamp: vi.fn(() => 'mock-timestamp'),
}));

vi.mock('../../../../lib/firebase', () => ({
  db: {}
}));

describe('SavedJobsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('save', () => {
    it('sets a document in the savedJobs collection', async () => {
      const mockJob = { id: 'job123', title: 'Developer' };
      await SavedJobsService.save('user123', mockJob as any);

      expect(doc).toHaveBeenCalledWith(expect.anything(), 'savedJobs', 'user123_job123');
      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          seekerId: 'user123',
          jobId: 'job123',
          snapshot: mockJob
        })
      );
    });

    it('throws error if job has no id', async () => {
      await expect(SavedJobsService.save('user123', {} as any)).rejects.toThrow('Cannot save job without an id');
    });
  });

  describe('unsave', () => {
    it('deletes the document', async () => {
      await SavedJobsService.unsave('user123', 'job123');
      expect(deleteDoc).toHaveBeenCalled();
    });
  });

  describe('isSaved', () => {
    it('returns true if document exists', async () => {
      (getDoc as any).mockResolvedValue({ exists: () => true });
      const result = await SavedJobsService.isSaved('user123', 'job123');
      expect(result).toBe(true);
    });

    it('returns false if document does not exist', async () => {
      (getDoc as any).mockResolvedValue({ exists: () => false });
      const result = await SavedJobsService.isSaved('user123', 'job123');
      expect(result).toBe(false);
    });
  });

  describe('getSavedBySeeker', () => {
    it('maps snapshot data to JobPosting objects', async () => {
      const mockDocs = [
        { data: () => ({ jobId: 'j1', snapshot: { title: 'Job 1' } }) },
        { data: () => ({ jobId: 'j2', snapshot: { title: 'Job 2' } }) }
      ];
      (getDocs as any).mockResolvedValue({ docs: mockDocs });

      const results = await SavedJobsService.getSavedBySeeker('user123');

      expect(results).toHaveLength(2);
      expect(results[0].id).toBe('j1');
      expect(results[0].title).toBe('Job 1');
    });
  });

  describe('getSavedJobIds', () => {
    it('returns a set of job IDs', async () => {
      const mockDocs = [
        { data: () => ({ jobId: 'j1' }) },
        { data: () => ({ jobId: 'j2' }) }
      ];
      (getDocs as any).mockResolvedValue({ docs: mockDocs });

      const ids = await SavedJobsService.getSavedJobIds('user123');

      expect(ids.size).toBe(2);
      expect(ids.has('j1')).toBe(true);
      expect(ids.has('j2')).toBe(true);
    });
  });
});
