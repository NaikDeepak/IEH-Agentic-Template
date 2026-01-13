/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@google/genai': path.resolve(__dirname, 'node_modules/@google/genai'),
            'google-auth-library': path.resolve(__dirname, 'node_modules/google-auth-library'),
            '@sentry/node': path.resolve(__dirname, 'node_modules/@sentry/node'),
        }
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: './src/test/setup.ts',
        testTimeout: 15000,
        exclude: ['**/node_modules/**', 'e2e/**', 'dist/**'],
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
