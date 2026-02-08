import { config } from '../config/index.js';
import { CONSTANTS } from '../config/constants.js';

// Helper to construct equality filter for Firestore REST API
export const createFilter = (field, value) => ({
    fieldFilter: {
        field: { fieldPath: field },
        op: "EQUAL",
        value: { stringValue: value }
    }
});

// Helper to run vector search via Firestore REST API
export const runVectorSearch = async (collectionName, queryVector, filters = [], limit = CONSTANTS.DEFAULTS.PAGINATION_LIMIT, authToken = null) => {
    const { projectId, apiKey } = config.firebase;

    // Construct URL from template
    const url = CONSTANTS.FIREBASE.URLS.FIRESTORE_RUN_QUERY.replace('{projectId}', projectId);

    // Build headers - prefer Bearer token for authenticated requests
    const headers = { 'Content-Type': 'application/json' };
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    // Add API key as query param if no auth token
    const fetchUrl = authToken ? url : (apiKey ? `${url}?key=${apiKey}` : url);

    // Construct structured query
    const structuredQuery = {
        from: [{ collectionId: collectionName }],
        findNearest: {
            vectorField: { fieldPath: "embedding" },
            queryVector: {
                mapValue: {
                    fields: {
                        __type__: { stringValue: "__vector__" },
                        value: {
                            arrayValue: {
                                values: queryVector.map((v) => ({ doubleValue: v })),
                            },
                        },
                    },
                },
            },
            distanceMeasure: "COSINE",
            limit: Number(limit) * CONSTANTS.DEFAULTS.SEARCH_LIMIT_MULTIPLIER,
        },
    };

    // Add filters if present
    if (filters.length > 0) {
        if (filters.length === 1) {
            structuredQuery.where = filters[0];
        } else {
            structuredQuery.where = {
                compositeFilter: {
                    op: "AND",
                    filters: filters,
                },
            };
        }
    }

    const response = await fetch(fetchUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ structuredQuery })
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Firestore REST API failed: ${response.status} ${errText}`);
    }

    const data = await response.json();

    // Transform response to clean objects with match scores
    return data
        .filter(item => item.document)
        .map(item => {
            const doc = item.document;
            const id = doc.name.split('/').pop();
            const fields = doc.fields || {};

            // Helper to unwrap Firestore JSON syntax
            const unwrap = (field) => {
                if (!field) return null;
                const key = Object.keys(field)[0];
                if (key === 'stringValue') return field.stringValue;
                if (key === 'integerValue') return Number(field.integerValue);
                if (key === 'doubleValue') return Number(field.doubleValue);
                if (key === 'booleanValue') return field.booleanValue;
                if (key === 'timestampValue') return field.timestampValue;
                if (key === 'arrayValue') return (field.arrayValue.values || []).map(unwrap);
                if (key === 'mapValue') return Object.fromEntries(Object.entries(field.mapValue.fields || {}).map(([k, v]) => [k, unwrap(v)]));
                return null;
            };

            const unwrappedData = Object.fromEntries(
                Object.entries(fields).map(([k, v]) => [k, unwrap(v)])
            );

            // Calculate Match Score from embedding vectors
            const vec = Array.isArray(unwrappedData.embedding)
                ? unwrappedData.embedding
                : unwrappedData.embedding?.value;

            let matchScore = 0;
            if (vec && Array.isArray(vec) && queryVector) {
                // Calculate magnitudes
                const magA = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
                const magB = Math.sqrt(queryVector.reduce((sum, val) => sum + val * val, 0));

                if (magA && magB) {
                    const dotProduct = vec.reduce((sum, val, i) => sum + val * queryVector[i], 0);
                    const similarity = dotProduct / (magA * magB);
                    matchScore = Math.max(0, Math.min(100, Math.round(similarity * 100)));
                }
            }

            // Remove large embedding vector from response
            delete unwrappedData.embedding;

            return { id, matchScore, ...unwrappedData };
        });
};
