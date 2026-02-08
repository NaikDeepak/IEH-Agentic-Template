import { getAuth } from 'firebase/auth';

export interface CandidateSearchResult {
    id: string;
    displayName?: string;
    bio?: string;
    skills?: string | string[];
    experience?: string;
    location?: string;
    photoURL?: string;
    jobTitle?: string;
    availability?: string;
    preferredRole?: string;
    linkedIn?: string;
    portfolio?: string;
    github?: string;
    matchScore?: number;
}

// Response wrappers
interface JobSearchResponse {
    jobs?: Record<string, unknown>[]; // Using Record<string, unknown> because the backend returns serialized JSON
}

interface CandidateSearchResponse {
    candidates?: CandidateSearchResult[];
}

/**
 * Get the current user's Firebase ID token for authenticated API calls.
 */
async function getAuthToken(): Promise<string | null> {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return null;
    return user.getIdToken();
}

/**
 * Performs a semantic search on the 'jobs' collection via the backend API.
 *
 * @param searchQuery - The user's natural language query (e.g., "Remote React developer jobs")
 * @param limitCount - Number of results to return (default 10)
 * @returns Array of matching job documents
 */
export async function searchJobs(searchQuery: string, locationFilter = '', limitCount = 10): Promise<Record<string, unknown>[]> {
    try {
        const token = await getAuthToken();
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch('/api/jobs/search', {
            method: 'POST',
            headers,
            body: JSON.stringify({ query: searchQuery, location: locationFilter, limit: limitCount })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Search failed: ${response.status.toString()} ${errorText}`);
        }

        const data = (await response.json()) as JobSearchResponse;
        return data.jobs ?? [];

    } catch (error) {
        console.error("Job Search failed:", error);
        throw error;
    }
}

/**
 * Performs a semantic search on the 'users' collection for candidates.
 *
 * @param searchQuery - The user's natural language query
 * @param limitCount - Number of results to return (default 10)
 * @returns Array of matching candidate profiles
 */
export async function searchCandidates(searchQuery: string, limitCount = 10): Promise<CandidateSearchResult[]> {
    try {
        const token = await getAuthToken();
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch('/api/candidates/search', {
            method: 'POST',
            headers,
            body: JSON.stringify({ query: searchQuery, limit: limitCount })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Search failed: ${response.status} ${errorText}`);
        }

        const data = (await response.json()) as CandidateSearchResponse;
        return data.candidates ?? [];

    } catch (error) {
        console.error("Candidate Search failed:", error);
        throw error;
    }
}
