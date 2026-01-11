import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock IntersectionObserver
class IntersectionObserver {
    private readonly callback: IntersectionObserverCallback

    observe = vi.fn((target: Element) => {
        // Simulate the element being in view to unblock whileInView animations.
        const entry = [{ isIntersecting: true, target }] as unknown as IntersectionObserverEntry[]
        this.callback(entry, this)
    })
    disconnect = vi.fn()
    unobserve = vi.fn()
    takeRecords = vi.fn(() => [])
    root: Element | Document | null = null
    rootMargin: string = ''
    thresholds: ReadonlyArray<number> = []

    constructor(callback: IntersectionObserverCallback) {
        this.callback = callback
    }
}

Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: IntersectionObserver,
});

Object.defineProperty(globalThis, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: IntersectionObserver,
});

// Mock ResizeObserver
class ResizeObserver {
    observe = vi.fn()
    disconnect = vi.fn()
    unobserve = vi.fn()
    constructor() { }
}

Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: ResizeObserver,
});

Object.defineProperty(globalThis, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: ResizeObserver,
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});
