# Phase 03: Semantic Matching Engine - Context

## Objective
Implement bi-directional semantic matching to connect candidates and jobs based on meaning, not just keywords.

## Goals
1.  **Candidate Search**: Enable employers to find talent using natural language (e.g., "React dev with 3 years exp").
2.  **Job Search Enhancement**: Improve the existing job search with query expansion for better recall.
3.  **Scoring & Ranking**: Display a "Match Score" to users to indicate relevance.

## Key Concepts
-   **Vector Search**: Using Google's `text-embedding-004` model to convert text into 768-dimensional vectors.
-   **Cosine Similarity**: Measuring the angle between vectors to determine similarity.
-   **Query Expansion**: Using a LLM to expand a user's short query into a richer semantic description before embedding.
-   **Hard Filters vs. Soft Filters**:
    -   *Hard*: "Must be in Bangalore" (Firestore `where` clause).
    -   *Soft*: "Experience with startups" (Vector similarity).

## Current Architecture
-   **Embeddings**: Generated via Cloud Function `generateEmbedding` (Gemini API).
-   **Storage**: Stored in Firestore documents (`jobs/{id}`, `users/{id}`) as `embedding` field.
-   **Search**: Performed via Firestore `runQuery` vector search.

## Constraints
-   **Firestore Indexes**: Vector search requires specific Single-Field Vector Indexes.
-   **Cost**: Each search involves an LLM call (embedding) + DB read. Optimization is key.
