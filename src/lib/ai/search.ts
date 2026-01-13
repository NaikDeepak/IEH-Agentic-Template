

/**
 * Performs a semantic search on the 'jobs' collection.
 * 
 * @param searchQuery - The user's natural language query (e.g., "Remote React developer jobs")
 * @param limitCount - Number of results to return (default 10)
 * @returns Array of matching job documents with their IDs and data
 */
/**
 * Performs a semantic search on the 'jobs' collection via the backend API.
 * 
 * @param searchQuery - The user's natural language query (e.g., "Remote React developer jobs")
 * @param limitCount - Number of results to return (default 10)
 * @returns Array of matching job documents with their IDs and data
 */
export async function searchJobs(searchQuery: string, limitCount = 10) {
    try {
        const response = await fetch('/api/jobs/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: searchQuery, limit: limitCount })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Search failed: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        return data.jobs || [];

    } catch (error) {
        console.error("Vector Search failed (Server-Side):", error);
        throw error;
    }
}
