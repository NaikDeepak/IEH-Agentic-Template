/**
 * Migration: Backfill searchTokens on existing job alerts
 * 
 * Run standalone: node functions/src/migrations/backfillAlertTokens.js
 * Or call backfillAlertTokens() from an admin endpoint
 */

import { initializeApp, applicationDefault, getApps } from 'firebase-admin/app';
import { getFirestore, FieldPath } from 'firebase-admin/firestore';
import { generateAlertTokens } from '../utils/tokenizer.js';
import * as readline from 'readline';

// Determine target project
const PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || 'india-emp-hub';
const IS_PRODUCTION = PROJECT_ID === 'india-emp-hub';

// Initialize Firebase Admin if not already done
if (getApps().length === 0) {
    initializeApp({
        credential: applicationDefault(),
        projectId: PROJECT_ID,
    });
}

const db = getFirestore();

async function confirmProduction() {
    if (!IS_PRODUCTION) return true;

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question(
            `⚠️  WARNING: You are about to run migration on PRODUCTION (${PROJECT_ID})\nType "yes" to continue: `,
            (answer) => {
                rl.close();
                resolve(answer.toLowerCase() === 'yes');
            }
        );
    });
}
const BATCH_SIZE = 500;

/**
 * Backfill searchTokens on all job alerts
 * @returns {Promise<{processed: number, updated: number, errors: number}>}
 */
export async function backfillAlertTokens() {
    let processed = 0;
    let updated = 0;
    let errors = 0;
    let lastDoc = null;

    console.log('Starting backfill of searchTokens on jobAlerts...');

    while (true) {
        // Query alerts without searchTokens (or with empty array)
        let query = db.collection('jobAlerts')
            .orderBy(FieldPath.documentId())
            .limit(BATCH_SIZE);

        if (lastDoc) {
            query = query.startAfter(lastDoc);
        }

        const snapshot = await query.get();

        if (snapshot.empty) {
            console.log('No more documents to process');
            break;
        }

        const batch = db.batch();
        let batchUpdates = 0;

        for (const doc of snapshot.docs) {
            processed++;
            const data = doc.data();

            // Skip if already has valid searchTokens
            if (Array.isArray(data.searchTokens) && data.searchTokens.length > 0) {
                continue;
            }

            try {
                const tokens = generateAlertTokens({
                    keywords: data.keywords,
                    location: data.location,
                    jobType: data.jobType,
                });

                if (tokens.length > 0) {
                    batch.update(doc.ref, { searchTokens: tokens });
                    batchUpdates++;
                    updated++;
                }
            } catch (err) {
                console.error(`Error processing alert ${doc.id}:`, err.message);
                errors++;
            }
        }

        if (batchUpdates > 0) {
            await batch.commit();
        }

        lastDoc = snapshot.docs[snapshot.docs.length - 1];
        console.log(`Processed ${processed} alerts, updated ${updated}, errors ${errors}`);
    }

    const result = { processed, updated, errors };
    console.log('Backfill complete:', result);
    return result;
}

// Run as standalone script
if (process.argv[1]?.includes('backfillAlertTokens')) {
    console.log(`\n🎯 Target project: ${PROJECT_ID}`);
    console.log(`📊 Environment: ${IS_PRODUCTION ? 'PRODUCTION' : 'STAGING/DEV'}\n`);

    (async () => {
        if (!await confirmProduction()) {
            console.log('Migration cancelled.');
            process.exit(0);
        }

        try {
            const result = await backfillAlertTokens();
            console.log('Migration finished:', result);
            process.exit(0);
        } catch (err) {
            console.error('Migration failed:', err);
            process.exit(1);
        }
    })();
}

export default backfillAlertTokens;
