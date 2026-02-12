import 'dotenv/config';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || 'india-emp-hub';

// Initialize Firebase Admin
initializeApp({
    credential: applicationDefault(),
    projectId: PROJECT_ID
});

const db = getFirestore();
const auth = getAuth();

async function migrate() {
    console.log(`🚀 Starting Migration to Custom Claims for project: ${PROJECT_ID}`);

    try {
        const usersSnapshot = await db.collection('users').get();
        console.log(`Found ${usersSnapshot.size} total users.`);

        let processed = 0;
        let skipped = 0;
        let errors = 0;

        for (const doc of usersSnapshot.docs) {
            const userData = doc.data();
            const uid = doc.id;
            const role = userData.role;

            if (!role) {
                console.log(`[SKIP] User ${uid} has no role defined.`);
                skipped++;
                continue;
            }

            try {
                // 1. Set Custom Claims
                await auth.setCustomUserClaims(uid, { role });

                // 2. Mark as migrated in Firestore
                await db.collection('users').doc(uid).update({
                    claims_synced_at: FieldValue.serverTimestamp(),
                    onboarded_at: userData.onboarded_at || FieldValue.serverTimestamp()
                });

                console.log(`[SUCCESS] Migrated user ${uid} with role: ${role}`);
                processed++;
            } catch (err) {
                console.error(`[ERROR] Failed to migrate user ${uid}:`, err.message);
                errors++;
            }
        }

        console.log('\n--- Migration Summary ---');
        console.log(`✅ Successfully Processed: ${processed}`);
        console.log(`⏩ Skipped (No Role): ${skipped}`);
        console.log(`❌ Errors: ${errors}`);
        console.log('--------------------------\n');

        if (processed > 0) {
            console.log('TIP: Existing users must sign out and sign back in (or refresh their token) for the new rules to take effect.');
        }

    } catch (globalError) {
        console.error("Migration fatal error:", globalError);
    }
}

migrate();
