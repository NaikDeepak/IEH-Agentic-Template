# Phase 05: Seeker Tools - Research

**Researched:** 2026-02-11
**Domain:** AI-driven Career Management & Preparation
**Confidence:** HIGH

## Summary

Phase 05 focuses on empowering job seekers through AI-driven tools: Resume Analysis (ATS scoring), Application Tracking (Kanban), Smart Shortlists, and Skill Gap Analysis. The primary technical challenge is processing various document formats (PDF, DOCX) and providing structured, actionable feedback using Gemini AI.

Key findings indicate that **Gemini 2.0 Flash** (the project's core AI) natively supports PDF analysis through the Google GenAI File API, significantly reducing the need for manual PDF text extraction libraries like `pdf-parse`. For `.docx` files, `mammoth.js` remains the industry standard for clean text extraction. For the Kanban board, the project already includes `@dnd-kit`, which is the recommended React library for performant, accessible drag-and-drop interfaces.

**Primary recommendation:** Use Gemini's native PDF support for resume analysis to preserve layout context, and use `mammoth.js` as a fallback for Word documents.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@google/genai` | ^1.35.0 | AI Logic & Document Analysis | Project standard; native PDF support in 2.0 models. |
| `@dnd-kit/core` | ^6.3.1 | Kanban Drag & Drop | Installed in project; accessible and modular. |
| `mammoth` | ^1.8.0 | DOCX Text Extraction | Converts .docx to clean HTML/Text without XML noise. |
| `Adzuna API` | V1 | Market Data & Salary Insights | Generous free tier; high-quality structured job market data. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `firebase-functions` | ^4.0.0 | Daily Digest & Nudges | For scheduled "Top 5" job alerts. |
| `lucide-react` | ^0.400.0 | UI Icons | Consistent iconography for Kanban and Analysis views. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `pdf-parse` | Gemini Native PDF | Gemini preserves layout context; `pdf-parse` only extracts raw text. |
| `react-beautiful-dnd` | `@dnd-kit` | `dnd-kit` is lighter and better supported for React 18/19. |

**Installation:**
```bash
npm install mammoth @google/genai
```

## Architecture Patterns

### Recommended Project Structure
```
src/features/seeker/
├── components/
│   ├── ResumeAnalyzer/      # Resume upload and feedback UI
│   ├── ApplicationBoard/    # Kanban board components
│   └── SkillGap/           # Skill gap visualization charts
├── services/
│   ├── resumeService.ts    # Document parsing and AI analysis
│   ├── marketService.ts    # Adzuna API integration
│   └── trackerService.ts   # Firestore application tracking logic
└── types/
    └── seeker.types.ts     # Zod schemas for AI responses
```

### Pattern 1: Structured AI Analysis
**What:** Using Gemini `responseSchema` to guarantee JSON output for ATS scores and skill gaps.
**When to use:** Every AI call that generates feedback for the user.
**Example:**
```typescript
// Source: https://github.com/googleapis/js-genai
const response = await model.generateContent({
  contents: "Analyze this resume...",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: {
      type: SchemaType.OBJECT,
      properties: {
        atsScore: { type: SchemaType.NUMBER },
        missingKeywords: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        suggestedChanges: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
      }
    }
  }
});
```

### Anti-Patterns to Avoid
- **Manual Text Extraction for PDFs:** Don't try to parse PDF layout manually; Gemini's vision/multimodal capabilities handle this much better.
- **Client-side API Keys:** Never store the Adzuna API key in the frontend. Proxy all market data requests through Firebase Cloud Functions.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Drag & Drop Logic | Custom event listeners | `@dnd-kit` | Edge cases in mobile touch and keyboard accessibility. |
| DOCX Parsing | Regex on XML | `mammoth` | Word XML is notoriously complex and non-standard. |
| Salary Estimation | Web Scraping | `Adzuna API` | Scraping is fragile; APIs provide structured, normalized data. |

## Common Pitfalls

### Pitfall 1: Large Document Tokens
**What goes wrong:** Uploading very long resumes or multiple files hits Gemini token limits or times out.
**Why it happens:** Model context windows are large but latency increases with input size.
**How to avoid:** Truncate text before sending if not using the native PDF File API, or use `Gemini 2.0 Flash` for its speed and efficiency.

### Pitfall 2: Kanban State Desync
**What goes wrong:** Dragging an item doesn't update the backend, or the UI flickers.
**Why it happens:** Optimistic UI updates not correctly synced with Firestore.
**How to avoid:** Use Firestore `onSnapshot` for real-time sync and `dnd-kit`'s `onDragEnd` for immediate local state updates.

## Code Examples

### PDF Upload to Gemini (Node.js/Cloud Functions)
```typescript
// Source: https://github.com/googleapis/js-genai/blob/main/codegen_instructions.md
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
const uploadResult = await fileManager.uploadFile("path/to/resume.pdf", {
  mimeType: "application/pdf",
  displayName: "User Resume",
});

const result = await model.generateContent([
  {
    fileData: {
      mimeType: uploadResult.file.mimeType,
      fileUri: uploadResult.file.uri
    }
  },
  { text: "Analyze this resume for ATS optimization." }
]);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `pdf-parse` + Prompt | Native PDF Part | 2024 (Gemini 1.5/2.0) | Drastically better extraction of tables and layout. |
| `react-beautiful-dnd` | `@dnd-kit` | 2022-2023 | Better performance and React 18+ support. |

## Open Questions

1. **Adzuna API Coverage**
   - What we know: Great for US/UK/Europe.
   - What's unclear: Quality of salary data for specific Asian or African markets.
   - Recommendation: Add a fallback "Market data unavailable for this region" message.

2. **LinkedIn Import**
   - What we know: LinkedIn does not provide a public "Profile Data" API without partnership.
   - What's unclear: Best compliant way to "import".
   - Recommendation: Guide users to "Save LinkedIn Profile to PDF" and upload that to our Analyzer.

## Sources

### Primary (HIGH confidence)
- `@google/genai` - [Documentation on Response Schema & File API](https://github.com/googleapis/js-genai)
- `@dnd-kit` - [Official Kanban Implementation Guide](https://docs.dndkit.com)
- `mammoth.js` - [Text extraction README](https://github.com/mwilliamson/mammoth.js)

### Secondary (MEDIUM confidence)
- `Adzuna API` - [Developer Documentation for Job Market Stats](https://developer.adzuna.com/)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Project already has dnd-kit and Gemini.
- Architecture: HIGH - Standard feature-based structure.
- Pitfalls: MEDIUM - Based on common LLM integration challenges.

**Research date:** 2026-02-11
**Valid until:** 2026-05-11 (Gemini 2.0 is stable but GenAI landscape moves fast)
