import { describe, it, expect, vi, beforeEach } from 'vitest';
import { findConnections, generateOutreachTemplate } from '../../src/features/seeker/services/networkingService';
import { getDocs } from 'firebase/firestore';
import { callAIProxy } from '../../src/lib/ai/proxy';

// Mock Dependencies
vi.mock('../../src/lib/firebase', () => ({
    db: {}
}));

vi.mock('../../src/lib/ai/proxy', () => ({
    callAIProxy: vi.fn()
}));

vi.mock('firebase/firestore', () => ({
    collection: vi.fn(),
    getDocs: vi.fn(),
    query: vi.fn(),
    limit: vi.fn()
}));

describe('NetworkingService', () => {
    const mockUserProfile: any = {
        uid: 'user123',
        displayName: 'John Doe',
        parsed_data: {
            education: [{ institution: 'IIT Bombay' }],
            experience: [{ company: 'Google' }]
        }
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('findConnections', () => {
        it('should find alumnus connections at target company', async () => {
            const mockDocs = [{
                id: 'user456',
                data: () => ({
                    uid: 'user456',
                    displayName: 'Jane Alum',
                    parsed_data: {
                        education: [{ institution: 'IIT Bombay' }],
                        experience: [{ company: 'Microsoft' }]
                    }
                })
            }];
            (getDocs as any).mockResolvedValueOnce({ forEach: (cb: any) => mockDocs.forEach(doc => cb(doc)), docs: mockDocs });

            const results = await findConnections(mockUserProfile, 'Microsoft');

            expect(results).toHaveLength(1);
            expect(results[0].connectionType).toBe('alumni');
        });

        it('should find ex-colleague connections', async () => {
            const mockDocs = [{
                id: 'user789',
                data: () => ({
                    uid: 'user789',
                    displayName: 'Bob Colleague',
                    parsed_data: {
                        education: [],
                        experience: [{ company: 'Google' }, { company: 'Meta' }]
                    }
                })
            }];
            (getDocs as any).mockResolvedValueOnce({ forEach: (cb: any) => mockDocs.forEach(doc => cb(doc)), docs: mockDocs });

            const results = await findConnections(mockUserProfile, 'Meta');

            expect(results).toHaveLength(1);
            expect(results[0].connectionType).toBe('ex-colleague');
        });

        it('should return empty array on Firestore error', async () => {
            (getDocs as any).mockRejectedValueOnce(new Error('Connection Error'));
            vi.spyOn(console, 'error').mockImplementation(() => { });

            const result = await findConnections(mockUserProfile, 'Meta');

            expect(result).toEqual([]);
        });
    });

    describe('generateOutreachTemplate', () => {
        const mockConnection: any = {
            name: 'Jane Doe',
            company: 'Meta',
            connectionType: 'alumni',
            sharedAttribute: 'IIT Bombay'
        };

        it('should call AI proxy and return template', async () => {
            (callAIProxy as any).mockResolvedValueOnce({ subject: 'Hi', body: 'Test' });

            const result = await generateOutreachTemplate(mockConnection, mockUserProfile);

            expect(callAIProxy).toHaveBeenCalled();
            expect(result.subject).toBe('Hi');
        });
    });
});
