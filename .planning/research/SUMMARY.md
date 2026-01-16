# Project Research Summary

**Project:** IEH (AI Job Board)
**Domain:** AI Recruitment / Semantic Search
**Researched:** 2026-01-16
**Confidence:** HIGH

## Executive Summary

Research confirms that the 2026 standard for AI job boards has shifted from simple semantic search to **autonomous agents** and **explainable AI (XAI)**. The recommended technical approach leverages the "Golden Stack" of **Firebase Genkit** and **Vercel AI SDK**, utilizing Firestore's native vector search to avoid external dependencies.

The critical path involves handling heavy AI workloads (resume parsing, scoring) asynchronously using **Cloud Tasks** and **Firebase Functions v2** to prevent timeouts. A major focus must be placed on **Regulatory Compliance** (NYC AEDT, EU AI Act), making an "Explainability Engine" a mandatory component, not just a feature.

Key risks include **PII leakage** to LLM providers and **proxy bias**. Mitigation strategies involving local PII masking and adversarial testing are essential foundation steps before any scoring logic is implemented.

## Key Findings

### Recommended Stack

The 2026 "Golden Stack" for React/Firebase avoids manual RAG plumbing.

**Core technologies:**
- **Firebase Genkit:** Standardizes backend AI flows and RAG.
- **Vercel AI SDK:** Handles frontend streaming and UI state.
- **Firestore Vector Search:** Native vector storage, removing need for Pinecone.
- **Cloud Tasks:** Orchestrates long-running AI jobs.

### Expected Features

**Must have (table stakes):**
- **Explainable Scoring:** "Why did I match?" (Regulatory requirement).
- **Semantic Search:** Understanding context beyond keywords.
- **PII Masking:** Automated redaction before AI processing.

**Should have (competitive):**
- **Career Agents:** Autonomous market monitoring for candidates.
- **Skill Gap Analysis:** "You need React to fit this role."

**Defer (v2+):**
- **Video Analysis:** High regulatory risk.

### Architecture Approach

Use an **Async Worker Pattern** to handle heavy AI loads.

**Major components:**
1. **API Gateway:** Accepts requests, enqueues tasks (Firebase Functions).
2. **Cloud Tasks:** Manages retries and rate limiting.
3. **AI Workers:** Executes parsing/scoring (Gen 2 Functions, High Memory).
4. **Firestore:** Stores state and vector embeddings.

### Critical Pitfalls

1. **Bias via Proxy Variables:** AI finding correlations in zip codes/schools. *Mitigation: Adversarial testing & Impact Ratio auditing.*
2. **PII Leakage:** Sending raw data to LLMs. *Mitigation: Local pre-processing/masking.*
3. **Token Cost Explosion:** Scoring every resume with GPT-4. *Mitigation: Funnel approach (Embeddings -> Small Model -> Large Model).*

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation & Ingestion Pipeline
**Rationale:** Must solve PII leakage and Async architecture before processing any data.
**Delivers:** Cloud Tasks setup, Genkit initialization, PII masking worker.
**Addresses:** PII Leakage Pitfall.
**Implements:** Async Worker Architecture.

### Phase 2: Semantic Matching Engine
**Rationale:** The core value proposition. Needs the foundation from Ph1.
**Delivers:** Firestore Vector Search, Genkit RAG flows, Job/Candidate embeddings.
**Uses:** Firebase Genkit, Firestore Vector Search.

### Phase 3: Explainability & Scoring
**Rationale:** Cannot ship scoring without explainability due to regulations.
**Delivers:** Scoring logic with "Why" generation, Bias auditing tools.
**Addresses:** Explainability requirement, Bias Pitfall.

### Phase 4: Agentic Features
**Rationale:** The "v2" differentiator.
**Delivers:** Career Agents, Skill Gap Analysis.
**Uses:** Vercel AI SDK (Streaming UI).

### Phase Ordering Rationale
- **Security First:** PII masking and Async architecture must exist before we handle sensitive user data.
- **Compliance Integrated:** Explainability is built alongside scoring, not bolted on later.
- **Cost Optimization:** The funnel architecture (Ph2/3) prevents cost explosion before scaling.

### Research Flags
- **Phase 3:** Likely needs deeper research on specific "Impact Ratio" calculation algorithms for compliance.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Genkit/Vercel SDK is the clear standard. |
| Features | HIGH | Regulatory requirements drive the feature set. |
| Architecture | HIGH | Async pattern is standard for serverless. |
| Pitfalls | HIGH | Well-documented compliance risks. |

**Overall confidence:** HIGH

## Sources
- Firebase Genkit Documentation
- Vercel AI SDK Docs
- NYC AEDT Law Requirements
- Firebase Functions Task Queue Docs
- EU AI Act Compliance Guide

---
*Research completed: 2026-01-16*
*Ready for roadmap: yes*
