# Testing Patterns

**Analysis Date:** 2026-01-16

## Test Framework

**Runner:**
- Vitest v4.0.16
- Config: `vitest.config.ts`

**Assertion Library:**
- Vitest (built-in) and `@testing-library/jest-dom` for DOM assertions.

**Run Commands:**
```bash
npm test               # Run all tests
npm run coverage       # Run tests with coverage reporting
npm run test:e2e       # Run Playwright E2E tests
```

## Test File Organization

**Location:**
- Component tests: Co-located in `__tests__` directories (e.g., `src/components/__tests__/`).
- Service/Library tests: Located in the root `tests/` directory (e.g., `tests/lib/embedding.test.ts`).

**Naming:**
- `*.test.tsx` for React components.
- `*.test.ts` for logic and services.

**Structure:**
```
src/
  components/
    __tests__/
      [Component].test.tsx
tests/
  lib/
    [Module].test.ts
  [Service].test.ts
```

## Test Structure

**Suite Organization:**
```typescript
describe('Feature or Component Name', () => {
    beforeEach(() => {
        // Setup
    });

    it('should perform expected behavior', async () => {
        // Arrange
        // Act
        // Assert
    });
});
```

**Patterns:**
- **Setup:** `beforeEach` is used to clear mocks and set up environment variables (e.g., `process.env['GEMINI_API_KEY']`).
- **Assertion:** Uses `expect(...)` from Vitest. React tests use `screen` from `@testing-library/react`.

## Mocking

**Framework:** Vitest (`vi`).

**Patterns:**
```typescript
// Example: Mocking a module
vi.mock('@google/genai', () => ({
    GoogleGenAI: vi.fn().mockImplementation(() => ({
        models: {
            embedContent: vi.fn().mockResolvedValue({ embedding: { values: [...] } })
        }
    }))
}));

// Example: Clearing mocks
beforeEach(() => {
    vi.clearAllMocks();
});
```

**What to Mock:**
- External APIs (Gemini, Firebase).
- Browser APIs (IntersectionObserver, ResizeObserver, matchMedia) - handled in `src/test/setup.ts`.
- Error tracking services (Sentry).

**What NOT to Mock:**
- Internal utility functions that don't have side effects.
- Simple pure components.

## Fixtures and Factories

**Test Data:**
- Simple constant arrays or objects (e.g., `mockValues = Array(768).fill(0.1)`).

**Location:**
- Usually defined within the test file or in `src/test/setup.ts` for global mocks.

## Coverage

**Requirements:**
- Global thresholds: 80% for lines, functions, branches, and statements.

**View Coverage:**
```bash
npm run coverage
```
- Provider: `v8`.
- Output: `text`, `json`, `html`.

## Test Types

**Unit Tests:**
- Focus on individual functions or logic (e.g., `tests/lib/embedding.test.ts`).

**Integration Tests:**
- Component tests that render UI and check for elements (e.g., `src/components/__tests__/HeroSection.test.tsx`).

**E2E Tests:**
- Framework: Playwright.
- Config: `playwright.config.ts`.
- Location: `e2e/` directory.

## Common Patterns

**Async Testing:**
```typescript
it('handles async data', async () => {
    const result = await someAsyncFunction();
    expect(result).toBe(expected);
});
```

**Error Testing:**
```typescript
it('should throw error if API fails', async () => {
    mockEmbedContent.mockRejectedValueOnce(new Error('API Error'));
    await expect(generateEmbedding('test')).rejects.toThrow('API Error');
});
```

---

*Testing analysis: 2026-01-16*
