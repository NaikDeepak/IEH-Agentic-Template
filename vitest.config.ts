import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [react(), tailwindcss()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./tests/setup.ts'],
        exclude: [
            '**/node_modules/**',
            '**/dist/**',
            '**/tests/e2e/**', // If they were there
            'e2e/**',
            '**/coverage/**'
        ],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: ['src/**', 'functions/**'],
            exclude: [
                '**/node_modules/**',
                'functions/node_modules/**',
                '**/dist/**',
                '**/tests/**',
                '**/coverage/**',
                'e2e/**',
                'vite.config.ts',
                '**/*.json',
                '**/*.lock',
                '**/*.svg',
                '**/*.png',
                '**/*.jpg',
                'src/assets/**',
                'src/server/**',
                'src/types/**',
                'src/test/**',
                'functions/src/ai/handlers/**',
                'functions/src/user/**',
                'functions/index.js'
            ]
        }
    },
    resolve: {
        alias: {
            '@google/genai': path.resolve(__dirname, 'node_modules/@google/genai')
        }
    }
});
