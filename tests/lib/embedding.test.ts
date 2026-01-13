import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateEmbedding } from '../../src/lib/ai/embedding';

// Mock values
const mockValues = Array(768).fill(0.1);

// Mock Sentry
vi.mock('@sentry/node', () => ({
    init: vi.fn(),
    captureException: vi.fn(),
}));

// Mock @google/genai
const mockEmbedContent = vi.fn();
// We need to mock the module so that dynamic imports work as expected in the test environment
vi.mock('@google/genai', () => {
    return {
        // Mock as a class-like function (constructor)
        GoogleGenAI: vi.fn(function () {
            return {
                models: {
                    embedContent: mockEmbedContent
                }
            };
        })
    };
});

describe('Lib: Embedding Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env['GEMINI_API_KEY'] = 'test-key';
    });

    it('should return empty array if text is empty', async () => {
        const result = await generateEmbedding('   ');
        expect(result).toEqual([]);
        expect(mockEmbedContent).not.toHaveBeenCalled();
    });

    it('should handle "embedding" (singular) response shape', async () => {
        mockEmbedContent.mockResolvedValueOnce({
            embedding: { values: mockValues }
        });

        const result = await generateEmbedding('test text');
        expect(result).toEqual(mockValues);
        expect(mockEmbedContent).toHaveBeenCalled();
    });

    it('should handle "embeddings" (plural) response shape', async () => {
        mockEmbedContent.mockResolvedValueOnce({
            embeddings: [{ values: mockValues }]
        });

        const result = await generateEmbedding('test text');
        expect(result).toEqual(mockValues);
    });

    it('should throw error if response is invalid', async () => {
        mockEmbedContent.mockResolvedValueOnce({}); // Empty response

        await expect(generateEmbedding('test text')).rejects.toThrow('Invalid embedding response');
    });

    it('should throw error if API fails', async () => {
        mockEmbedContent.mockRejectedValueOnce(new Error('API Error'));

        await expect(generateEmbedding('test text')).rejects.toThrow('API Error');
    });

    it('should throw error if GEMINI_API_KEY is missing (when getAI is called)', async () => {
        delete process.env['GEMINI_API_KEY'];

        // Note: verify that the error happens inside the function call
        // Since we are mocking dynamic import, the strict process.env check might need to be simulated carefully.
        // In our code, getAI() checks env var.

        // We need to reset the module state or the 'ai' singleton variable if we want to re-trigger getAI logic fully.
        // However, since 'ai' is a module-level variable, it persists across tests in the same file unless reset.
        // Dynamic import logic makes it tricky to reset without `vi.resetModules()`.

        // For simplicity in this unit test context without complex module resetting:
        // We will just verify the logic path if possible, or skip if 'ai' is already initialized.
        // A robust way uses vi.resetModules() but that requires re-importing the subject under test.

        vi.resetModules();
        const { generateEmbedding: freshGenerateEmbedding } = await import('../../src/lib/ai/embedding');

        await expect(freshGenerateEmbedding('test')).rejects.toThrow('GEMINI_API_KEY is required');
    });
});
