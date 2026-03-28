#!/usr/bin/env node
/**
 * Validates that the dist/ build matches the intended deploy target.
 * Run automatically by deploy:staging and deploy:prod scripts.
 *
 * Usage:
 *   node scripts/validate-dist.js staging
 *   node scripts/validate-dist.js prod
 */

import { readdirSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ASSETS_DIR = join(ROOT, 'dist', 'assets');

const FIREBASE_RC_PATH = join(ROOT, '.firebaserc');
if (!existsSync(FIREBASE_RC_PATH)) {
    console.error('❌  .firebaserc not found — cannot validate build target.');
    process.exit(1);
}
const firebaseRc = JSON.parse(readFileSync(FIREBASE_RC_PATH, 'utf8'));
if (!firebaseRc.projects?.default) {
    console.error('❌  .firebaserc missing projects.default — cannot validate prod build.');
    process.exit(1);
}
if (!firebaseRc.projects?.staging) {
    console.error('❌  .firebaserc missing projects.staging — cannot validate staging build.');
    process.exit(1);
}

const ENV_CONFIG = {
    staging: {
        expectedProjectId: firebaseRc.projects.staging,
        forbiddenProjectId: null,
        get label() { return `Staging (${this.expectedProjectId})`; }
    },
    prod: {
        expectedProjectId: firebaseRc.projects.default,
        forbiddenProjectId: firebaseRc.projects.staging,
        get label() { return `Production (${this.expectedProjectId})`; }
    },
};

const target = process.argv[2];

if (!target || !ENV_CONFIG[target]) {
    console.error('Usage: node scripts/validate-dist.js [staging|prod]');
    process.exit(1);
}

if (!existsSync(ASSETS_DIR)) {
    console.error(`\n❌  dist/assets/ not found — run the build first:\n`);
    console.error(target === 'staging'
        ? '    npm run build:staging'
        : '    npm run build');
    process.exit(1);
}

const { expectedProjectId, forbiddenProjectId, label } = ENV_CONFIG[target];

const jsFiles = readdirSync(ASSETS_DIR).filter(f => f.endsWith('.js'));
if (jsFiles.length === 0) {
    console.error('❌  No JS files found in dist/assets/ — build may have failed.');
    process.exit(1);
}

let foundExpected = false;
let foundForbidden = false;
let foundEmulator = false;

for (const file of jsFiles) {
    const content = readFileSync(join(ASSETS_DIR, file), 'utf8');
    if (content.includes(expectedProjectId)) foundExpected = true;
    if (forbiddenProjectId && content.includes(forbiddenProjectId)) foundForbidden = true;
    if (
        content.includes('127.0.0.1:9099') || content.includes('127.0.0.1:8080') ||
        content.includes('localhost:9099') || content.includes('localhost:8080') ||
        content.includes('::1:9099') || content.includes('::1:8080') ||
        content.includes('0.0.0.0:9099') || content.includes('0.0.0.0:8080') ||
        /"VITE_USE_FIREBASE_EMULATOR"\s*:\s*"true"/.test(content)
    ) {
        foundEmulator = true;
    }
}

let failed = false;

if (!foundExpected) {
    console.error(`\n❌  dist/ does not contain project ID "${expectedProjectId}"`);
    console.error(`    Run the correct build before deploying to ${label}:\n`);
    console.error(target === 'staging'
        ? '    npm run build:staging'
        : '    npm run build');
    failed = true;
}

if (foundForbidden) {
    console.error(`\n❌  dist/ contains "${forbiddenProjectId}" — this is a STAGING build, not prod`);
    console.error(`    Run npm run build (not build:staging) before deploying to prod.\n`);
    failed = true;
}

if (foundEmulator) {
    console.error(`\n❌  dist/ contains emulator URLs (127.0.0.1:9099 / 8080)`);
    console.error(`    VITE_USE_FIREBASE_EMULATOR=true was baked into this build.`);
    console.error(`    Check your .env.local or .env.${target} and rebuild.\n`);
    failed = true;
}

if (failed) process.exit(1);

console.log(`✅  dist/ validated for ${label}`);
