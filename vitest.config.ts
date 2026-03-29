import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [react(), tailwindcss()],
    define: {
        __APP_VERSION__: JSON.stringify('test'),
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./tests/setup.ts'],
        testTimeout: 30000, // Increase global timeout
        env: {
            // Enables simulation mode in PhoneVerification during tests
            VITE_USE_FIREBASE_EMULATOR: 'true',
        },
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
            include: ['src/**'],
            exclude: [
                'functions/**',
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
                '**/.env*',
                'src/assets/**',
                'src/server/**',
                'src/types/**',
                'src/test/**',
                'functions/src/growth/**',
                'functions/src/triggers/**',
                'functions/src/ai/handlers/**',
                'functions/src/user/**',
                'functions/src/marketProxy.js',
                'functions/index.js',
                'functions/index.d.ts',
                'src/pages/admin/**',
                'src/pages/employer/**',
                'src/layouts/AdminLayout.tsx',
                'src/features/applications/components/Admin/**',
                '**/types.ts',
                '**/constants.ts',
                'src/features/employer/**',
                'src/features/admin/**',
                'src/components/ui/**',
                'src/lib/ai/generation.js', // Exclude massive prompt management logic
                'src/App.tsx',
                'src/main.tsx',
                'src/vite-env.d.ts',
                'src/lib/firebase.ts',
                'src/lib/ai/search.ts',
                'src/lib/ai/proxy.ts',
                '**/*.css',
                'src/instrument.ts',
                'src/context/ThemeContext.ts',
                'src/context/ThemeProvider.tsx',
                'src/components/ErrorBoundary/**',
                'src/components/admin/**',
                'src/pages/BrownieLeaderboardPage.tsx',
                'src/pages/CompanyProfile.tsx'
            ]
        }
    },
    resolve: {
        alias: {
            '@google/genai': path.resolve(__dirname, 'node_modules/@google/genai'),
            'google-auth-library': path.resolve(__dirname, 'node_modules/google-auth-library')
        }
    }
});
