# Gemini SDK Coding Guidelines (@google/genai)

This document provides definitive instructions for using the Google GenAI SDK in this project.

## Core Rules

### Import & Initialization
Always use:
```typescript
import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
```
- **Prohibited**: `GoogleGenerativeAI`, `google.generativeai`, or any deprecated v1-style imports.
- **API Key**: Must come from `process.env.API_KEY`. Do NOT create UI for key entry.

### Model Selection (Economy Mode)
PRIORITIZE COST-EFFICIENCY. Use the cheapest model that satisfies the task.

| Task Type | Recommended Model |
| :--- | :--- |
| **Basic Text** (Q&A, Summarization) | `gemini-2.0-flash` |
| **Complex Logic** (Coding, Math) | `gemini-2.0-flash-thinking-exp-01-21` |
| **Multimodal** (Image/Video Analysis) | `gemini-2.0-flash` |
| **Real-time** (Audio/Video) | `gemini-2.0-flash-exp` |

**Forbidden Models**: `gemini-3-*` (too expensive), `gemini-1.5-*` (legacy).

## API Usage

### Generating Content
Do not define the model first. Use `ai.models.generateContent` directly.

```typescript
const response = await ai.models.generateContent({
  model: 'gemini-2.0-flash', 
  contents: 'Summarize this text...',
});
```

### Prohibited Patterns
- Do NOT use `models.create`, `ai.models.create`, or `genAI.getGenerativeModel`.
- Do NOT use `generationConfig`.
- Use `GenerateContentResponse` instead of `GenerateContentResult`.

## Error Handling
Implement robust handling for 4xx/5xx errors with exponential backoff.
