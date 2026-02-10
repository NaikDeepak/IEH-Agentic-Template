import { FieldValue } from 'firebase-admin/firestore';
import { db } from '../config/firebase.js';
import { CONSTANTS } from '../config/constants.js';

// Helper to construct equality filter for Firestore SDK (if needed for client-side filtering or future use)
export const createFilter = (field, value) => ({
    fieldFilter: {
        field: { fieldPath: field },
        op: "EQUAL",
        value: { stringValue: value }
    }
});

/**
 * Run vector search using Firebase Admin SDK
 * @param {string} collectionName 
 * @param {number[]} queryVector 
 * @param {any[]} filters - Array of filter objects (currently unused in SDK implementation, explicit filtering applied post-fetch or via chained queries if supported)
 * @param {number} limit 
 * @param {string} authToken - Unused in Admin SDK (service account/default credentials used)
 * @returns {Promise<any[]>}
 */
export const runVectorSearch = async (collectionName, queryVector, filters = [], limit = CONSTANTS.DEFAULTS.PAGINATION_LIMIT, authToken = null) => {
    // Validate vector
    if (!queryVector || !Array.isArray(queryVector)) {
        throw new Error("Invalid queryVector: must be an array");
    }

    console.log(`[Firestore] Running vector search on ${collectionName} via Admin SDK. Vector length: ${queryVector.length}`);

    try {
        const collRef = db.collection(collectionName);

        // Use FieldValue.vector to ensure correct type mapping
        const vectorValue = FieldValue.vector(queryVector);

        // Perform vector search
        const vectorQuery = collRef.findNearest('embedding', vectorValue, {
            limit: Number(limit) * CONSTANTS.DEFAULTS.SEARCH_LIMIT_MULTIPLIER,
            distanceMeasure: 'COSINE'
        });

        // Execute query
        const snapshot = await vectorQuery.get();

        // Map results
        const results = snapshot.docs.map(doc => {
            const data = doc.data();

            // Calculate match score manually or use distance property if available in future SDKs
            // Current Node SDK might not expose distance in doc metadata easily without specific accessors
            // For now, we rely on the returned order (nearest first) and can re-calculate score if needed
            // or return a placeholder score since logic in jobs.service.js recalculates it anyway.

            // Note: The REST API verification logic did manual cosine similarity.
            // We can keep a simple matchScore based on re-calculation to maintain compatibility.

            let matchScore = 0;
            // Unpack embedding if it's a VectorValue (it comes back as an object with .toArray() or .values in some SDK versions)
            // In Admin SDK, data.embedding is usually a Vector object.
            let vec = data.embedding;

            // Helper to get array from potential Vector object
            const getVecArray = (v) => {
                if (Array.isArray(v)) return v;
                if (v && typeof v.toArray === 'function') return v.toArray();
                // Relying on internal properties like `_values` is risky.
                // It's better to fail explicitly if the documented method isn't available.
                return null;
            };

            const vecArray = getVecArray(vec);

            if (vecArray && queryVector) {
                // Calculate magnitudes
                const magA = Math.sqrt(vecArray.reduce((sum, val) => sum + val * val, 0));
                const magB = Math.sqrt(queryVector.reduce((sum, val) => sum + val * val, 0));

                if (magA && magB) {
                    const len = Math.min(vecArray.length, queryVector.length);
                    if (vecArray.length !== queryVector.length) {
                        console.warn(`[Firestore] Vector dimension mismatch: stored=${vecArray.length}, query=${queryVector.length}`);
                    }

                    // Safe dot product calculation
                    let dotProduct = 0;
                    for (let i = 0; i < len; i++) {
                        dotProduct += vecArray[i] * queryVector[i];
                    }

                    const similarity = dotProduct / (magA * magB);
                    matchScore = Math.max(0, Math.min(100, Math.round(similarity * 100)));
                }
            }

            // Cleanup large embedding from result to save bandwidth
            delete data.embedding;

            return {
                id: doc.id,
                ...data,
                matchScore
            };
        });

        // Apply post-filtering based on constraints (e.g., status=active)
        if (filters && filters.length > 0) {
            console.log(`[Firestore] Applying ${filters.length} post-filters to ${results.length} initial results`);
            const filteredResults = results.filter(item => {
                return filters.every(filter => {
                    // Handle structured query format from createFilter
                    if (filter.fieldFilter && filter.fieldFilter.op === 'EQUAL') {
                        const fieldPath = filter.fieldFilter.field.fieldPath;
                        const filterValue = filter.fieldFilter.value.stringValue;

                        // Check exact match
                        return item[fieldPath] === filterValue;
                    }
                    return true;
                });
            });
            console.log(`[Firestore] Post-filtering complete. Returning ${filteredResults.length} results.`);
            return filteredResults;
        }

        return results;

    } catch (error) {
        console.error(`[Firestore] Admin SDK Vector Search Failed:`, error);
        throw new Error(`Firestore Vector Search failed: ${error.message}`);
    }
};
