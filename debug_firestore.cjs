
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Since I'm in the environment, I'll try to use the project ID
const projectId = 'india-emp-hub';
const userId = 'TKy0jVGbC4MttX47b9T363PkKIK2';

async function checkData() {
    try {
        const app = initializeApp({ projectId });
        const db = getFirestore();

        console.log(`Checking resumes for user: ${userId}`);
        const resumesRef = db.collection('users').doc(userId).collection('resumes');

        // Check all resumes
        const snapshot = await resumesRef.get();
        if (snapshot.empty) {
            console.log('No resumes found.');
            return;
        }

        console.log(`Found ${snapshot.size} resumes.`);
        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`Doc ID: ${doc.id}`);
            console.log(`  Score: ${data.score}`);
            console.log(`  Analyzed At: ${data.analyzed_at ? (data.analyzed_at.toDate ? data.analyzed_at.toDate() : data.analyzed_at) : 'MISSING'}`);
            console.log(`  ---`);
        });

        // Simulate the query in the app
        console.log('\nSimulating ordered query (orderBy analyzed_at desc, limit 1):');
        const q = resumesRef.orderBy('analyzed_at', 'desc').limit(1);
        const qSnapshot = await q.get();
        if (qSnapshot.empty) {
            console.log('  Ordered query returned NOTHING.');
        } else {
            const d = qSnapshot.docs[0];
            console.log(`  Latest Doc: ${d.id}, Score: ${d.data().score}`);
        }

    } catch (err) {
        console.error('Error:', err);
    }
}

checkData();
