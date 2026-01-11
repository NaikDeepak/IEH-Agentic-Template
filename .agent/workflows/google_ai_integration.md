---
description: "Setup and verify Google GenAI SDK integration with strict Cost/Architecture rules"
---
1. Ensure the correct Google GenAI SDK is installed
// turbo
2. npm install @google/genai
3. Verify that the API key is set in `.env` as `VITE_GOOGLE_AI_API_KEY` (or `API_KEY` appropriately).
4. Create a unified AI service file at `services/ai.ts` if it doesn't exist, strictly following the economy mode rules:
   ```ts
   /**
    * AI Service - Logic Layer
    * Role / Persona: Senior Staff Software Engineer
    * Priority: Efficiency, Cost-Optimization, Reliability
    */
   import { GoogleGenAI } from "@google/genai";

   // 1. Strict Initialization
   const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_AI_API_KEY || process.env.API_KEY });

   // 2. Cost-Optimized Defaults
   // Default: 'gemini-2.0-flash' (Basic Text)
   // Complex: 'gemini-2.0-flash-thinking-exp-01-21' (Reasoning)
   // Image: 'gemini-2.0-flash-image'
   
   // 3. Robust Error Handling Wrapper
   export const generateContentSafe = async (modelName: string, prompt: string) => {
     try {
       const response = await ai.models.generateContent({
         model: modelName,
         contents: prompt,
       });
       return response;
     } catch (error) {
       console.error("AI Generation Failed:", error);
       // Implement exponential backoff or Sentry logging here
       throw error;
     }
   };

   export { ai };
   ```
5. Do NOT use deprecated APIs like `GoogleGenerativeAI`, `getGenerativeModel`, or `generationConfig`.
