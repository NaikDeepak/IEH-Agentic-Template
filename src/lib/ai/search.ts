import { getAuth } from "firebase/auth";
import { z } from "zod";
import { callAIProxy } from './proxy';



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

// Zod Schemas for runtime validation
const JobResultSchema = z.record(z.string(), z.unknown());
const JobSearchResponseSchema = z.object({
    jobs: z.array(JobResultSchema).optional().default([])
});

const CandidateResultSchema = z.object({
    id: z.string(),
    displayName: z.string().optional(),
    bio: z.string().optional(),
    skills: z.union([z.string(), z.array(z.string())]).optional(),
    experience: z.string().optional(),
    location: z.string().optional(),
    photoURL: z.string().optional(),
    jobTitle: z.string().optional(),
    availability: z.string().optional(),
    preferredRole: z.string().optional(),
    linkedIn: z.string().optional(),
    portfolio: z.string().optional(),
    github: z.string().optional(),
    matchScore: z.number().optional()
});
const CandidateSearchResponseSchema = z.object({
    candidates: z.array(CandidateResultSchema).optional().default([])
});

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

        const rawData = (await response.json()) as unknown;

        // Validate with Zod
        const data = JobSearchResponseSchema.parse(rawData);
        return data.jobs;

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
        const rawData = await callAIProxy('/api/candidates/search', { query: searchQuery, limit: limitCount });


        // Validate with Zod
        const data = CandidateSearchResponseSchema.parse(rawData);
        // Cast to CandidateSearchResult[] because Zod schema is slightly broader (optional fields) but effectively compatible
        return data.candidates as CandidateSearchResult[];

    } catch (error) {
        console.error("Candidate Search failed:", error);
        throw error;
    }
}

