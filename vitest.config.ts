/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {}
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: './src/test/setup.ts',
        exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: ['src/**/*.{ts,tsx}', 'index.js', 'functions/index.js'],
            exclude: ['src/test/**', 'src/**/*.test.{ts,tsx}', 'node_modules/**'],
            thresholds: {
                global: {
                    lines: 80,
                    functions: 80,
                    branches: 80,
                    statements: 80
                }
            }
        },
    },
})
