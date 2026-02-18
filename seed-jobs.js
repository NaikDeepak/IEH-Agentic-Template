
import { db } from './src/server/config/firebase.js';

async function seedJobs() {
    console.log('Seeding mock jobs to Firestore emulator...');
    const jobs = [
        {
            title: 'Software Engineer',
            company: 'Tech Corp',
            location: 'Remote',
            type: 'Full-time',
            description: 'Help us build the future of AI.',
            salary: '₹15L - ₹25L',
            created_at: new Date(),
            status: 'active'
        },
        {
            title: 'Product Manager',
            company: 'Innovation Labs',
            location: 'Bangalore',
            type: 'Full-time',
            description: 'Lead our next-gen product suite.',
            salary: '₹20L - ₹35L',
            created_at: new Date(),
            status: 'active'
        }
    ];

    for (const job of jobs) {
        await db.collection('jobs').add(job);
        console.log(`Added job: ${job.title}`);
    }
    // Seed a user with a known referral code for testing
    console.log('Seeding referral provider...');
    const refProvider = {
        uid: 'test-ref-provider',
        email: 'ref-provider@example.com',
        displayName: 'Referral Provider',
        role: 'seeker',
        referralCode: 'IEH-TEST123',
        created_at: new Date(),
        onboarded_at: new Date()
    };
    await db.collection('users').doc('test-ref-provider').set(refProvider);
    // Also add to referralCodes collection for lookup
    await db.collection('referralCodes').doc('TEST123').set({
        uid: 'test-ref-provider',
        created_at: new Date()
    });
    console.log('Seeded referral provider with code: IEH-TEST123');

    console.log('Seeding complete.');
}

seedJobs().catch(console.error);
