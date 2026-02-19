import { vi, describe, it, expect, beforeEach } from 'vitest';
import { generateJdHandler, embeddingHandler, searchJobsHandler } from '../functions/index.js';

// Mock AI globally at top level
const { mockEmbedContent, mockGenerateContent } = vi.hoisted(() => ({
    mockEmbedContent: vi.fn(),
    mockGenerateContent: vi.fn(),
}));

vi.mock('@google/genai', () => ({
    GoogleGenAI: vi.fn().mockImplementation(function () {
        return {
            models: {
                generateContent: mockGenerateContent,
                embedContent: mockEmbedContent
            }
        };
    })
}));

vi.mock('google-auth-library', () => {
    const mockClient = {
        getAccessToken: vi.fn().mockResolvedValue({ token: 'mock-token' }),
        request: vi.fn().mockResolvedValue({ data: [] })
    };
    return {
        GoogleAuth: vi.fn().mockImplementation(() => ({
            getClient: vi.fn().mockResolvedValue(mockClient)
        }))
    };
});

// Mock internal proxy to be sure
vi.mock('../functions/lib/ai/proxy.js', () => ({
    callAIProxy: vi.fn().mockResolvedValue({ values: Array(768).fill(0.1) })
}));

// Mock Firebase Admin
vi.mock('firebase-admin', () => ({
    initializeApp: vi.fn(),
    getApps: vi.fn(() => []),
    cert: vi.fn(),
}));

vi.mock('firebase-admin/firestore', () => ({
    getFirestore: vi.fn(() => ({
        collection: vi.fn(() => ({
            doc: vi.fn(() => ({ set: vi.fn(), get: vi.fn(), update: vi.fn() })),
            add: vi.fn(),
            where: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            orderBy: vi.fn().mockReturnThis(),
            get: vi.fn().mockResolvedValue({ empty: true, docs: [] })
        })),
        settings: vi.fn()
    })),
    FieldValue: {
        serverTimestamp: vi.fn()
    }
}));

vi.mock('firebase-admin/app', () => ({
    initializeApp: vi.fn(),
    getApps: vi.fn(() => []),
    cert: vi.fn()
}));

vi.mock('@sentry/node', () => ({
    init: vi.fn(),
    captureException: vi.fn(),
    startSpan: vi.fn((_, cb) => cb({ setAttribute: vi.fn() })),
}));

describe('Functions: API Handlers', () => {
    let req: any;
    let res: any;

    beforeEach(() => {
        vi.clearAllMocks();
        req = {
            body: {},
            query: {},
            headers: {},
        };
        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
            send: vi.fn().mockReturnThis(),
        };
        process.env['API_KEY'] = 'test-key';
        process.env['GEMINI_API_KEY'] = 'test-key';
    });

    describe('generateJdHandler', () => {
        it('should generate JD on success', async () => {
            req.body = { role: 'Dev', skills: 'JS', experience: '5y' };
            mockGenerateContent.mockResolvedValueOnce({
                text: () => JSON.stringify({ jd: 'Mocked JD' })
            });

            await generateJdHandler(req, res);
            expect(res.json).toHaveBeenCalledWith({ jd: 'Mocked JD' });
        });

        it('should handle missing API key', async () => {
            req.body = { role: 'Dev' };
            delete process.env['API_KEY'];
            delete process.env['GEMINI_API_KEY'];
            await generateJdHandler(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('embeddingHandler', () => {
        it('should return embedding on success', async () => {
            req.body = { text: 'Hello' };
            mockEmbedContent.mockResolvedValueOnce({
                embeddings: [{ values: Array(768).fill(0.1) }]
            });
            await embeddingHandler(req, res);
            expect(res.json).toHaveBeenCalled();
        });

        it('should return 400 for empty text', async () => {
            req.body = { text: '' };
            await embeddingHandler(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe('searchJobsHandler', () => {
        it('should return search results', async () => {
            req.body = { query: 'Dev' };
            mockGenerateContent.mockResolvedValueOnce({
                text: () => 'Expanded Query'
            });
            mockEmbedContent.mockResolvedValue({
                embeddings: [{ values: Array(768).fill(0.1) }]
            });
            global.fetch = vi.fn().mockResolvedValueOnce({
                ok: true,
                json: async () => ([{
                    document: {
                        name: 'projects/p/databases/d/documents/jobs/id1',
                        fields: { title: { stringValue: 'Job 1' } }
                    }
                }])
            });

            await searchJobsHandler(req, res);
            expect(res.json).toHaveBeenCalled();
        }, 10000);
    });
});
