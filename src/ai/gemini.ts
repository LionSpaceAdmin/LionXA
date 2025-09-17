// src/ai/gemini.ts
import { simpleTextGenerationFlow } from './genkit';

/**
 * Sends a prompt to the Gemini model via a Genkit flow and returns the response.
 * @param prompt The text prompt to send to the model.
 * @returns A promise that resolves to the model's text response.
 */
export async function askGemini(prompt: string): Promise<string> {
  try {
    const response = await simpleTextGenerationFlow(prompt);
    return response;
  } catch (error) {
    console.error('Error interacting with Gemini:', error);
    // In case of an error, return a safe, empty response
    return '';
  }
}
