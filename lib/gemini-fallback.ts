import { GoogleGenAI } from '@google/genai';

// Resilient Model Fallback Ladder
export const MODEL_FALLBACK_LADDER = [
  'gemini-3.6-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-3.7-flash',
] as const;

let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not configured');
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

export interface FallbackGenerateOptions {
  systemInstruction?: string;
  temperature?: number;
  contents: any;
}

export interface FallbackGenerateResult {
  text: string;
  modelUsed: string;
  attemptedModels: string[];
}

/**
 * Standard Helper Implementation for Gemini resilient fallback ladder
 */
export async function generateContentWithFallback(
  options: FallbackGenerateOptions
): Promise<FallbackGenerateResult> {
  const ai = getAIClient();
  const attemptedModels: string[] = [];
  let lastError: any = null;

  for (const model of MODEL_FALLBACK_LADDER) {
    try {
      attemptedModels.push(model);

      const response = await ai.models.generateContent({
        model,
        contents: options.contents,
        config: {
          systemInstruction: options.systemInstruction,
          temperature: options.temperature ?? 0.7,
        },
      });

      const responseText = response.text || '';
      if (responseText) {
        return {
          text: responseText,
          modelUsed: model,
          attemptedModels,
        };
      }
    } catch (error: any) {
      lastError = error;
      console.warn(`[Gemini Fallback Ladder] Model ${model} encountered an error:`, error?.message || error);

      // Check if error is potentially recoverable or if we should proceed down the ladder
      const errorMessage = (error?.message || '').toLowerCase();
      const status = error?.status || error?.statusCode;
      const isRecoverable =
        status === 429 ||
        status === 503 ||
        status === 500 ||
        status === 404 ||
        errorMessage.includes('quota') ||
        errorMessage.includes('rate') ||
        errorMessage.includes('unavailable') ||
        errorMessage.includes('not found') ||
        errorMessage.includes('overloaded');

      if (!isRecoverable && attemptedModels.length === 1) {
        // If it's a non-standard error, still try the next fallback model to be resilient
        continue;
      }
    }
  }

  throw new Error(
    `All Gemini fallback models exhausted (${attemptedModels.join(' -> ')}). Last error: ${
      lastError?.message || 'Unknown generation failure'
    }`
  );
}
