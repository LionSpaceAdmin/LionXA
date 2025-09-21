// src/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from './config.ts';

// --- Constants & Types ---
const DEFAULT_MODEL = "gemini-1.5-flash"; // Fast and efficient Gemini model
const FALLBACK_MODEL = "gemini-1.5-pro"; // More capable but slower model for fallback
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const SYSTEM_PROMPT = `
You are an AI agent that responds in English to anti-Israel tweets. 
Be sharp, concise, factual, and occasionally humiliating. 
Do not use hashtags or emojis. 
Always respond as if speaking from a powerful, unapologetic pro-Israel voice.
Aim for very short, impactful replies (1-2 sentences). Vary your tone and phrasing to avoid sounding repetitive.
`;

// --- API Initialization ---
const DRY_RUN = process.env.DRY_RUN === "1";
if (!config.gemini.apiKey && !DRY_RUN) {
  throw new Error("Gemini API key is not configured");
}

const genAI: GoogleGenerativeAI | null = config.gemini.apiKey
  ? new GoogleGenerativeAI(config.gemini.apiKey)
  : null;

// --- Response Validation ---
function validateResponse(text: string): string {
  // Enforce character limit only; no emojis/hashtags decoration per policy
  if (text.length > 280) {
    text = text.slice(0, 277) + "...";
  }
  return text;
}

// --- Public API ---

/**
 * Sends a prompt to the Gemini API and returns the generated response.
 * Includes automatic retry with fallback model and response validation.
 * @param prompt The user's prompt (e.g., the content of a tweet).
 * @param modelName The model to use for the completion (defaults to gemini-1.5-flash).
 * @returns The text content of the AI's response, or null if an error occurred.
 */
export async function askGemini(
  prompt: string,
  modelName: string = DEFAULT_MODEL,
): Promise<string | null> {
  if (DRY_RUN || !config.gemini.apiKey) {
    const text = `Simulated reply: ${prompt.slice(0, 80)}`;
    return validateResponse(text);
  }
  let retries = 0;
  let currentModel = modelName;

  while (retries < MAX_RETRIES) {
    try {
      console.log(
        `[Gemini] Attempting with model: ${currentModel} (attempt ${retries + 1}/${MAX_RETRIES})`,
      );

      const model = genAI!.getGenerativeModel({
        model: currentModel,
        generationConfig: {
          temperature: 0.5, // More consistent responses
          maxOutputTokens: 150, // Allow longer responses
          topP: 0.8,
          topK: 40,
        },
      });

      // Create the full prompt with system instructions
      const fullPrompt = `${SYSTEM_PROMPT}\n\nUser's tweet: ${prompt}\n\nYour response:`;

      const result = await model.generateContent(fullPrompt);
      const response = result.response;
      const text = response.text();

      if (!text || text.trim().length === 0) {
        throw new Error("Empty response from Gemini");
      }

      console.log(
        `[Gemini] Successfully generated response with ${currentModel}`,
      );
      return validateResponse(text.trim());
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(
        `[Gemini] Error with ${currentModel} (attempt ${retries + 1}):`,
        errorMessage,
      );

      // If model not available or quota exceeded, try fallback model
      if (
        (errorMessage?.includes("model") || errorMessage?.includes("quota")) &&
        currentModel === DEFAULT_MODEL
      ) {
        console.log(`[Gemini] Falling back to ${FALLBACK_MODEL}`);
        currentModel = FALLBACK_MODEL;
      }

      retries++;

      if (retries < MAX_RETRIES) {
        console.log(`[Gemini] Retrying in ${RETRY_DELAY}ms...`);
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      }
    }
  }

  console.error(`[Gemini] Failed after ${MAX_RETRIES} attempts`);
  return null;
}

// Export for backwards compatibility (maintaining the same interface)
export const askGPT = askGemini;
