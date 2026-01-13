import { describe, it, expect, vi, beforeEach } from 'vitest';

// 1. Mock all dependencies using hoisted to ensure they are ready before any imports
const { mockEmbedContent, mockGenerateContent, mockCaptureException } = vi.hoisted(() => {
    return {
        mockEmbedContent: vi.fn(),
        mockGenerateContent: vi.fn(),
        mockCaptureException: vi.fn(),
    };
});

vi.mock('firebase-functions/v2/https', () => ({
    onRequest: vi.fn(),
}));

vi.mock('firebase-admin/app', () => ({
    initializeApp: vi.fn(),
}));

vi.mock('firebase-admin/firestore', () => ({
    getFirestore: vi.fn(() => ({})),
}));

vi.mock('@google/genai', () => ({
    GoogleGenAI: vi.fn().mockImplementation(function () {
        return {
            models: {
                embedContent: mockEmbedContent,
                generateContent: mockGenerateContent,
            },
        };
    }),
}));

vi.mock('@sentry/node', () => ({
    init: vi.fn(),
    captureException: mockCaptureException,
}));

vi.mock('google-auth-library', () => ({
    GoogleAuth: vi.fn().mockImplementation(function () {
        return {
            getClient: vi.fn().mockResolvedValue({
                getAccessToken: vi.fn().mockResolvedValue('test-token'),
            }),
        };
    }),
}));

// Mock fetch for Firestore REST API search
global.fetch = vi.fn();

import { generateJdHandler, embeddingHandler, searchJobsHandler } from '../functions/index.js';

describe('Functions: API Handlers', () => {
     
    let req: any;
     
    let res: any;

    beforeEach(() => {
        vi.clearAllMocks();
        process.env.GEMINI_API_KEY = 'test-key';
        process.env.SENTRY_DSN = 'https://test@sentry.io/1';
        process.env.NODE_ENV = 'development';

        req = { body: {} };
        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
            send: vi.fn().mockReturnThis(),
        };
    });

    describe('generateJdHandler', () => {
        it('should generate JD on success', async () => {
            req.body = { role: 'Dev', skills: 'JS', experience: '5y' };
            mockGenerateContent.mockResolvedValueOnce({
                text: () => 'Mocked JD'
            });

            await generateJdHandler(req, res);

            expect(res.json).toHaveBeenCalledWith({ jd: 'Mocked JD' });
        });

        it('should handle missing API key', async () => {
            delete process.env.API_KEY;
            delete process.env.GEMINI_API_KEY;

            await generateJdHandler(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('API Key missing') }));
        });
    });

    describe('embeddingHandler', () => {
        it('should return embedding on success', async () => {
            req.body = { text: 'test' };
            mockEmbedContent.mockResolvedValueOnce({
                embedding: { values: [0.1, 0.2] }
            });

            await embeddingHandler(req, res);

            expect(res.json).toHaveBeenCalledWith({ embedding: [0.1, 0.2] });
        });

        it('should return 400 for empty text', async () => {
            req.body = { text: '' };
            await embeddingHandler(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe('searchJobsHandler', () => {
        it('should return search results', async () => {
            req.body = { query: 'test' };
            mockEmbedContent.mockResolvedValueOnce({
                embedding: { values: [0.1] }
            });

             
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => ([{
                    document: {
                        name: 'projects/p/databases/d/documents/jobs/id1',
                        fields: { title: { stringValue: 'Job 1' } }
                    }
                }])
            });

            await searchJobsHandler(req, res);

            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                jobs: expect.arrayContaining([expect.objectContaining({ id: 'id1', title: 'Job 1' })])
            }));
        });

        it('should capture exception on Sentry if setup', async () => {
            req.body = { query: 'test' };
            mockEmbedContent.mockRejectedValueOnce(new Error('Fail'));

            await searchJobsHandler(req, res);

            expect(mockCaptureException).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});
