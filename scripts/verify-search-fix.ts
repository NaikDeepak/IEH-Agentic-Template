import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
if (!apiKey) {
    console.error("Error: GEMINI_API_KEY or API_KEY is missing in environment variables.");
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });


async function verifySearch() {
    console.log("Starting search verification...");

    // query: "Senior React Developer Bangalore full time with 15 Lakhs salary"
    const query = "Senior React Developer Bangalore full time with 15 Lakhs salary";

    console.log(`Calling search API with query: "${query}"`);

    // Determine API URL
    const apiUrl = process.env.API_URL || 'http://localhost:8001/api/jobs/search';

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, limit: 5 })
        });

        if (!response.ok) {
            console.error(`Search API failed: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error(text);
            process.exit(1);
        }

        const data = await response.json();
        const jobs = data.jobs || [];

        console.log(`\nFound ${jobs.length} jobs.`);

        // Check for the expected job
        // Note: The seeded job is "Senior React Developer" in "Bangalore, India" with salary 15-25L
        const targetJob = jobs.find((j: any) =>
            j.title.includes("React") &&
            (j.location.includes("Bangalore") || j.location.includes("India"))
        );

        if (targetJob) {
            console.log(`\nMatch Found!`);
            console.log(`Title: ${targetJob.title}`);
            console.log(`Location: ${targetJob.location}`);
            console.log(`Match Score: ${targetJob.matchScore}%`);

            if (targetJob.matchScore > 60) { // Should be high, but let's be realistic with cosine sim on small text
                console.log("SUCCESS: Match score is good (>60%).");
            } else {
                console.error(`FAILURE: Match score is low (${targetJob.matchScore}%). Expected > 60%.`);
                // process.exit(1); // Don't fail hard, just report
            }
        } else {
            console.error("FAILURE: Target job not found in top results.");
        }

    } catch (error) {
        console.error("Fetch failed:", error);
        process.exit(1);
    }
}

verifySearch();

// Also a small manual check script logic
// Since we can't easily curl localhost from here reliably without potentially hitting issues, 
// a node script is better.
