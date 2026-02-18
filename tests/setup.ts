import { vi, type Mock } from 'vitest';
import '@testing-library/jest-dom';

interface GlobalMocks {
    sentryCaptureException: Mock<(error: unknown) => void>;
}

declare global {
    var __MOCKS__: GlobalMocks;
}

// Global Registry for Mocks (to bridge different module resolution contexts)
globalThis.__MOCKS__ = {
    sentryCaptureException: vi.fn<(error: unknown) => void>(),
};

// Global Mocks for Browser APIs
class MockIntersectionObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
}
global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

class MockResizeObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
}
global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Global Mock for Fetch
global.fetch = vi.fn();

// Global Mock for Gemini API
class MockGoogleGenAI {
    get models() {
        return {
            embedContent: vi.fn().mockResolvedValue({ embedding: { values: new Array(768).fill(0.1) } }),
            generateContent: vi.fn().mockResolvedValue({
                text: () => 'Mocked JD',
                data: { candidates: [{ content: { parts: [{ text: 'Mocked JD' }] } }] }
            }),
        };
    }
}

vi.mock('@google/genai', () => {
    return {
        GoogleGenAI: MockGoogleGenAI
    };
});

// Global Mock for Firebase Functions
vi.mock('firebase-functions/v2/https', () => ({
    onRequest: vi.fn((handler: (req: unknown, res: unknown) => void) => handler),
}));

// Global Mock for Firebase Admin
vi.mock('firebase-admin/app', () => ({
    initializeApp: vi.fn(),
    applicationDefault: vi.fn(),
}));

vi.mock('firebase-admin/firestore', () => ({
    getFirestore: vi.fn(() => ({
        collection: vi.fn(() => ({
            doc: vi.fn(() => ({
                set: vi.fn(),
                get: vi.fn(),
            })),
        })),
    })),
    FieldValue: {
        serverTimestamp: vi.fn(),
    },
}));

// Global Mock for Google Auth
vi.mock('google-auth-library', () => ({
    GoogleAuth: class {
        getClient = vi.fn().mockResolvedValue({
            getAccessToken: vi.fn().mockResolvedValue('test-token'),
        });
    },
}));

// Global Mock for Sentry
const mockSentryLogger = {
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
    fmt: (strings: TemplateStringsArray, ...values: unknown[]) =>
        strings.reduce((acc, str, i) => acc + str + (values[i] ?? ''), ''),
};

vi.mock('@sentry/node', () => ({
    init: vi.fn(),
    captureException: (error: unknown) => { globalThis.__MOCKS__.sentryCaptureException(error); },
    startSpan: vi.fn((_: unknown, callback: (span: Record<string, unknown>) => unknown) => callback({ setAttribute: vi.fn() })),
    logger: mockSentryLogger,
}));
vi.mock('@sentry/react', () => ({
    init: vi.fn(),
    captureException: (error: unknown) => { globalThis.__MOCKS__.sentryCaptureException(error); },
    startSpan: vi.fn((_: unknown, callback: (span: Record<string, unknown>) => unknown) => callback({ setAttribute: vi.fn() })),
    logger: mockSentryLogger,
}));

