# Architecture: AI Job Board (IEH) - Heavy AI Workloads

**Researched:** 2026-01-16
**Domain:** Serverless AI Orchestration
**Confidence:** HIGH

## System Overview
To handle long-running AI operations (Parsing, Scoring, JD Generation) without blocking the UI or risking timeouts, the system uses an **Asynchronous Worker Pattern** centered around Firebase Functions v2 and Google Cloud Tasks.

## Component Architecture

### 1. API Gateway (Synchronous)
- **Role:** Handles incoming HTTP requests from the frontend.
- **Technology:** Firebase Functions v2 (`onRequest`).
- **Responsibility:** Validates requests, authenticates users, and enqueues tasks. It returns a `202 Accepted` status with a `jobId` immediately.

### 2. Task Queue (Orchestration)
- **Role:** Manages the flow and timing of background work.
- **Technology:** Google Cloud Tasks.
- **Responsibility:** Stores the task payload, manages retry policies, and dispatches to the Worker.

### 3. AI Workers (Asynchronous)
- **Role:** Executes the heavy lifting.
- **Technology:** Firebase Functions v2 (`onTaskDispatched`).
- **Specific Workers:**
    - **Resume Parser:** Extracts structured data from PDF/Images using Gemini Flash 2.0.
    - **Match Scorer:** Compares JD embeddings with Candidate profiles.
    - **JD Generator:** Generates optimized job descriptions.
- **Config:** Higher memory (e.g., 2GiB) and longer timeouts (e.g., 540s).

### 4. Persistence & State
- **Role:** Source of truth and progress tracking.
- **Technology:** Firestore.
- **Collections:**
    - `jobs`: Stores JD data and embeddings.
    - `candidates`: Stores parsed profile data.
    - `processing_tasks`: Tracks status (`pending`, `processing`, `completed`, `failed`) and results.

## Data Flow: Async Processing Pattern

1. **Trigger:** User uploads a resume via the Frontend.
2. **Enqueue:** `api/upload` function saves the file to Storage and enqueues a `parse-resume` task via `firebase-admin`.
3. **Dispatch:** Cloud Tasks invokes the `onTaskDispatched` worker.
4. **Execute:** The worker calls Gemini API to parse the resume.
5. **Update:** The worker writes the result to Firestore and updates the task status to `completed`.
6. **Notify:** (Optional) Frontend listens to the Firestore document for a status change to update the UI.

## Component Boundaries

| Component | Trigger | Max Duration | Resource Profile |
|-----------|---------|--------------|------------------|
| `api-handler` | HTTP/v2 | 60s | Low (256MB) |
| `task-worker` | Cloud Tasks | 3600s | High (1GB - 4GB) |
| `gemini-api` | SDK Call | N/A | External |

## Suggested Build Order

1.  **Phase 1: Task Infrastructure**
    - Set up Cloud Tasks queue.
    - Implement `enqueueTask` helper in existing `functions/index.js`.
2.  **Phase 2: Resume Parsing Worker**
    - Create the `onTaskDispatched` function for parsing.
    - Integrate `@google/genai` with structured output prompts.
3.  **Phase 3: Status Tracking UI**
    - Implement the Firestore listener on the frontend to handle "Processing..." states.
4.  **Phase 4: Match Scoring**
    - Implement the batch scoring worker using the same async pattern.

## Implementation Snippet (v2 Task Queue)

```javascript
import { onTaskDispatched } from "firebase-functions/v2/tasks";
import { getFirestore } from "firebase-admin/firestore";

export const parseResumeWorker = onTaskDispatched(
  {
    retryConfig: { maxAttempts: 3, minBackoffSeconds: 60 },
    memory: "2GiB",
    timeoutSeconds: 540 // 9 minutes
  },
  async (request) => {
    const { resumeUrl, taskId } = request.data;
    const db = getFirestore();

    try {
      // 1. Mark as processing
      await db.collection("processing_tasks").doc(taskId).update({ status: "processing" });

      // 2. Perform AI Parsing (Gemini)
      const parsedData = await callGeminiParser(resumeUrl);

      // 3. Save result and complete
      await db.collection("candidates").add(parsedData);
      await db.collection("processing_tasks").doc(taskId).update({
        status: "completed",
        completedAt: new Date()
      });
    } catch (error) {
      await db.collection("processing_tasks").doc(taskId).update({ status: "failed", error: error.message });
      throw error; // Trigger Cloud Task retry
    }
  }
);
```

## Sources
- [Firebase Functions v2 Task Queue Docs](https://firebase.google.com/docs/functions/task-functions?gen=2nd)
- [Cloud Run Timeout Limits](https://docs.cloud.google.com/functions/docs/configuring/timeout)
- [Gemini SDK Documentation](https://ai.google.dev/gemini-api/docs/quickstart)
