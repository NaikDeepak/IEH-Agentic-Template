import { vi, describe, it, expect, beforeEach, afterEach, type Mock } from 'vitest';
import { generateJdHandler, embeddingHandler, searchJobsHandler } from '../functions/index.js';
import { GoogleGenAI } from '@google/genai';
import * as Sentry from '@sentry/node';

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
        global.fetch = vi.fn();
        process.env['API_KEY'] = 'test-key';
        process.env['GEMINI_API_KEY'] = 'test-key';
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('generateJdHandler', () => {
        it('should generate JD on success', async () => {
            req.body = { role: 'Dev', skills: 'JS', experience: '5y' };
            const generateContentMock = vi.fn().mockResolvedValueOnce({
                text: () => JSON.stringify({ jd: 'Mocked JD' })
            });

            vi.spyOn(GoogleGenAI.prototype, 'models', 'get').mockReturnValue({
                generateContent: generateContentMock,
                embedContent: vi.fn(),
            } as any);

            await generateJdHandler(req, res);

            expect(res.json).toHaveBeenCalledWith({ jd: 'Mocked JD' });
        });

        it('should handle missing API key', async () => {
            delete process.env['API_KEY'];
            delete process.env['GEMINI_API_KEY'];

            await generateJdHandler(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('API Key missing') }));
        });
    });

    describe('embeddingHandler', () => {
        it('should return embedding on success', async () => {
            req.body = { text: 'test' };
            const embedContentMock = vi.fn().mockResolvedValueOnce({
                embedding: { values: [0.1, 0.2] }
            });

            vi.spyOn(GoogleGenAI.prototype, 'models', 'get').mockReturnValue({
                embedContent: embedContentMock,
                generateContent: vi.fn(),
            } as any);

            await embeddingHandler(req, res);

            expect(res.json).toHaveBeenCalledWith({ embedding: expect.arrayContaining([0.1]) });
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
            const embedContentMock = vi.fn().mockResolvedValueOnce({
                embedding: { values: new Array(1536).fill(0.1) }
            });

            // Mock generateContent for expandQuery
            const generateContentMock = vi.fn().mockResolvedValue({
                text: () => 'expanded query'
            });

            vi.spyOn(GoogleGenAI.prototype, 'models', 'get').mockReturnValue({
                embedContent: embedContentMock,
                generateContent: generateContentMock,
            } as any);

            (global.fetch as Mock).mockResolvedValueOnce({
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

        it.skip('should capture exception on Sentry if setup', async () => {
            req.body = { query: 'test' };
            const embedContentMock = vi.fn().mockRejectedValueOnce(new Error('Fail'));

            vi.spyOn(GoogleGenAI.prototype, 'models', 'get').mockReturnValue({
                embedContent: embedContentMock,
                generateContent: vi.fn(),
            } as any);

            await searchJobsHandler(req, res);

            expect(Sentry.captureException).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});
