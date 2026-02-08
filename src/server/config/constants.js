export const CONSTANTS = {
    AI: {
        MODEL_FAST: 'gemini-2.0-flash',
        MODEL_EMBEDDING: 'gemini-embedding-001', // Used in REST API URL
        EMBEDDING_DIMENSIONS: 768,
        API_VERSION: 'v1beta',
    },
    FIREBASE: {
        COLLECTIONS: {
            JOBS: 'jobs',
            USERS: 'users',
        },
        URLS: {
            FIRESTORE_RUN_QUERY: 'https://firestore.googleapis.com/v1/projects/{projectId}/databases/(default)/documents:runQuery',
        }
    },
    DEFAULTS: {
        PAGINATION_LIMIT: 10,
        SEARCH_LIMIT_MULTIPLIER: 2, // Fetch 2x items for post-filtering
    },
    FILTERS: {
        STATUS: {
            ACTIVE: 'active',
            PASSIVE: 'passive',
        },
        ROLES: {
            SEEKER: 'seeker',
            RECRUITER: 'recruiter',
        }
    }
};
