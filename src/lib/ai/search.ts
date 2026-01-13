import {
    collection,
    query,
    getDocs,
    // @ts-expect-error - findNearest is in preview/beta in firebase SDK type definitions
    findNearest
} from "firebase/firestore";
import { db } from "../firebase";
import { generateEmbedding } from "./embedding";

/**
 * Performs a semantic search on the 'jobs' collection.
 * 
 * @param searchQuery - The user's natural language query (e.g., "Remote React developer jobs")
 * @param limitCount - Number of results to return (default 10)
 * @returns Array of matching job documents with their IDs and data
 */
export async function searchJobs(searchQuery: string, limitCount = 10) {
    try {
        // 1. Convert text query to vector
        const queryVector = await generateEmbedding(searchQuery);

        if (!queryVector || queryVector.length === 0) {
            return [];
        }

        // 2. Perform Vector Search on Firestore
        const coll = collection(db, "jobs");

        // Note: ensure 'embedding' field is indexed in firestore.indexes.json
        const q = query(
            coll,
            findNearest("embedding", queryVector, {
                limit: limitCount,
                distanceMeasure: "COSINE"
            })
        );

        const snapshot = await getDocs(q);

        // 3. Map results
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

    } catch (error) {
        console.error("Vector Search failed:", error);
        throw error;
    }
}
