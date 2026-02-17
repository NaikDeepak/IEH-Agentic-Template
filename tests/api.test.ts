import { describe, it, expect, vi, beforeEach } from 'vitest';

import { embeddingHandler } from '../functions/index.js';

// Mock Sentry
const { mockEmbedContent } = vi.hoisted(() => {
    return {
        mockEmbedContent: vi.fn()
    };
});

// Mock Firebase Functions
vi.mock('firebase-functions/v2/https', () => ({
    onRequest: vi.fn((handler) => handler),
}));

vi.mock('firebase-functions/v2/scheduler', () => ({
    onSchedule: vi.fn((_schedule, handler) => handler),
}));

// Mock Firebase Admin
vi.mock('firebase-admin/app', () => ({
    initializeApp: vi.fn(),
    getApps: vi.fn(() => []),
    cert: vi.fn(),
}));

vi.mock('firebase-admin/auth', () => ({
    getAuth: vi.fn(() => ({
        verifyIdToken: vi.fn().mockResolvedValue({ uid: 'test-uid' }),
    })),
}));

vi.mock('firebase-admin/firestore', () => ({
    getFirestore: vi.fn(() => ({
        collection: vi.fn(() => ({
            doc: vi.fn(() => ({
                get: vi.fn().mockResolvedValue({
                    exists: true,
                    data: () => ({ role: 'employer' }),
                }),
            })),
        })),
    })),
}));

vi.mock('@google/genai', () => {
    return {
        GoogleGenAI: vi.fn().mockImplementation(function () {
            return {
                models: {
                    embedContent: mockEmbedContent
                }
            };
        })
    };
});

vi.mock('@sentry/node', async (importOriginal) => {
    const actual = await importOriginal<any>();
    return {
        ...actual,
        startSpan: vi.fn((_, cb) => cb({ setAttribute: vi.fn() })),
        captureException: vi.fn(),
    };
});

describe.skip('API Endpoint: /api/embedding', () => {

    let req: any;

    let res: any;

    beforeEach(() => {
        vi.clearAllMocks();
        // Reset env
        process.env['GEMINI_API_KEY'] = 'test-key';

        req = {
            body: {}
        };
        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };
    });

    it('should return 400 if text is missing', async () => {
        req.body = {}; // No text
        await embeddingHandler(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Text is required' });
    });

    it('should return 400 if text is not a string', async () => {
        req.body = { text: 123 };
        await embeddingHandler(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Text is required' });
    });

    it('should return 400 if text is empty after trim', async () => {
        req.body = { text: '   ' };
        await embeddingHandler(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Text is required' });
    });

    it('should return 413 if text is too long (> 5000 chars)', async () => {
        req.body = { text: 'a'.repeat(5001) };
        await embeddingHandler(req, res);
        expect(res.status).toHaveBeenCalledWith(413);
        expect(res.json).toHaveBeenCalledWith({ error: 'Text is too long' });
    });

    it('should return 500 if API Key is missing', async () => {
        delete process.env['GEMINI_API_KEY'];
        delete process.env['API_KEY'];

        req.body = { text: 'valid text' };
        await embeddingHandler(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.stringContaining('Server configuration error')
        }));
    });

    it('should return embedding on success', async () => {
        req.body = { text: 'Hello world' };

        const mockValues = Array(768).fill(0.1);
        mockEmbedContent.mockResolvedValueOnce({
            embeddings: [{ values: mockValues }]
        });

        await embeddingHandler(req, res);

        expect(res.json).toHaveBeenCalledWith({ embedding: mockValues });
        expect(mockEmbedContent).toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
        req.body = { text: 'valid text' };
        mockEmbedContent.mockRejectedValueOnce(new Error('API Failure'));

        // Mock NODE_ENV to avoid stack trace in output or accept it
        const originalEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'production';

        await embeddingHandler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Failed to generate embedding' });

        process.env['NODE_ENV'] = originalEnv;
    });
});
