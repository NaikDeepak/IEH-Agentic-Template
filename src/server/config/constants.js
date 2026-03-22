export const CONSTANTS = {
    AI: {
        MODEL_FAST: 'gemini-2.0-flash',
        MODEL_EMBEDDING: 'models/gemini-embedding-001',
        EMBEDDING_DIMENSIONS: 768,
        API_VERSION: 'v1beta',
    },
    FIREBASE: {
        COLLECTIONS: {
            JOBS: 'jobs',
            USERS: 'users',
        },
        URLS: {
            FIRESTORE_RUN_QUERY: 'https://firestore.googleapis.com/v1beta1/projects/{projectId}/databases/(default)/documents:runQuery',
        }
    },
    DEFAULTS: {
        PAGINATION_LIMIT: 10,
        SEARCH_LIMIT_MULTIPLIER: 2, // Fetch 2x items for post-filtering
    },
    SEARCH: {
        SUGGEST_SCAN_LIMIT: 150,      // Max job docs to scan for suggestions
        SUGGEST_SKILL_WEIGHT: 0.4,    // Weight of skill trigram score vs title
        SUGGEST_MIN_SCORE: 0.1,       // Minimum trigram score to include a suggestion
        RANKING_VECTOR_WEIGHT: 0.7,   // Weight of vector similarity in hybrid ranking
        RANKING_KEYWORD_WEIGHT: 0.3,  // Weight of keyword match in hybrid ranking
        MIN_MATCH_SCORE: 30,          // Results below this score are filtered out
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
