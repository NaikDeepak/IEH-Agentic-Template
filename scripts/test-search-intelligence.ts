import 'dotenv/config';

const TEST_QUERY = "Remote React Native Developer >15L";

async function testSearchIntelligence() {
    console.log(`Testing Search Intelligence with Query: "${TEST_QUERY}"`);
    console.log("Expecting: Work Mode=Remote, Min Salary=15L, Semantic=React Native");

    try {
        const response = await fetch('http://localhost:8001/api/jobs/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: TEST_QUERY,
                limit: 5
            })
        });

        if (!response.ok) {
            throw new Error(`Search failed: ${response.status} ${await response.text()}`);
        }

        const data = await response.json();
        console.log(`\nFound ${data.jobs.length} jobs.`);

        data.jobs.forEach((job: any, i: number) => {
            console.log(`\n[${i + 1}] ${job.title} @ ${job.company || 'Unknown'}`);
            console.log(`    Location: ${job.location}`);
            console.log(`    Work Mode: ${job.work_mode || 'N/A'}`);
            console.log(`    Salary: ${job.salary_range ? `${job.salary_range.min}-${job.salary_range.max}` : 'Not specified'}`);
            console.log(`    Score: ${job.matchScore}% (Original: ${job.originalScore}%, Keyword: ${job.debugKeywordScore}%)`);

            // assertions
            let passed = true;
            if (job.work_mode && job.work_mode.toLowerCase() !== 'remote') {
                console.warn("    ⚠️ WARNING: Result is NOT Remote!");
                passed = false;
            }
            if (job.salary_range && job.salary_range.max < 1500000) {
                console.warn("    ⚠️ WARNING: Salary is below 15L!");
                passed = false;
            }
            if (!passed) console.log("    ❌ INTELLIGENCE CHECK FAILED");
            else console.log("    ✅ INTELLIGENCE CHECK PASSED");
        });

    } catch (error) {
        console.error("Test Failed:", error);
    }
}

testSearchIntelligence();
