
import { runVectorSearch } from '../src/server/lib/firestore.js';

// Mock vector
const mockVector = new Array(768).fill(0.1);

async function testAdminVectorSearch() {
    console.log("Starting Firebase Admin SDK Vector Search Test...");

    try {
        // We just call the function, it handles the SDK logic
        const results = await runVectorSearch('jobs', mockVector, [], 3);

        if (results) {
            console.log(`✅ SUCCESS! Found ${results.length} results.`);
            if (results.length > 0) {
                console.log("Top Result ID:", results[0].id);
                console.log("Match Score:", results[0].matchScore);
                // console.log("Data:", JSON.stringify(results[0], null, 2));
            }
        }
    } catch (e) {
        console.error(`❌ Search Failed:`, e);
    }
}

testAdminVectorSearch();
