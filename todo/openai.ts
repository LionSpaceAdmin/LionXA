// src/openai.ts
import { OpenAI } from "openai";
import { config } from "./config"; // Import the central config

// --- Constants & Types ---
const DEFAULT_MODEL = "gpt-4-1106-preview"; // Latest GPT-4 Turbo model
const FALLBACK_MODEL = "gpt-3.5-turbo-1106"; // Fallback to latest GPT-3.5 if needed
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
if (!config.openai.apiKey) {
    throw new Error('OpenAI API key is not configured');
}

const openai = new OpenAI({ apiKey: config.openai.apiKey });

// --- Response Validation ---
function validateResponse(text: string): string {
    // Enforce character limit
    if (text.length > 280) {
        text = text.slice(0, 277) + "...";
    }
    
    // Add random emoji (30% chance)
    if (Math.random() < 0.3) {
        const emojis = ["😏", "🤔", "🙄", "😶", "🤨", "😬", "🤷‍♂️", "🤦‍♂️", "🎯", "💡", "⚡️", "🔥"];
        text = `${emojis[Math.floor(Math.random() * emojis.length)]} ${text}`;
    }
    
    return text;
}

// --- Public API ---

/**
 * Sends a prompt to the OpenAI Chat API and returns the generated response.
 * Includes automatic retry with fallback model and response validation.
 * @param prompt The user's prompt (e.g., the content of a tweet).
 * @param model The model to use for the completion (defaults to gpt-4).
 * @returns The text content of the AI's response, or null if an error occurred.
 */
export async function askGPT(prompt: string, model: string = DEFAULT_MODEL): Promise<string | null> {
  let retries = 0;
  let currentModel = model;

  while (retries < MAX_RETRIES) {
    try {
      console.log(`[OpenAI] Attempting with model: ${currentModel} (attempt ${retries + 1}/${MAX_RETRIES})`);
      
      const chatCompletion = await openai.chat.completions.create({
        model: currentModel,
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.5, // More consistent responses
        max_tokens: 150,  // Allow longer responses
        n: 1,
        presence_penalty: 0.1, // Slight penalty for repetitive content
        frequency_penalty: 0.1, // Slight penalty for repetitive words
      });

      const response = chatCompletion.choices[0]?.message?.content;

      if (!response) {
        throw new Error("Empty response from OpenAI");
      }

      console.log(`[OpenAI] Successfully generated response with ${currentModel}`);
      return response.trim();

    } catch (error: any) {
      console.error(`[OpenAI] Error with ${currentModel} (attempt ${retries + 1}):`, error.message);
      
      // If model not available, try fallback model
      if (error.message?.includes("model") && currentModel === DEFAULT_MODEL) {
        console.log(`[OpenAI] Falling back to ${FALLBACK_MODEL}`);
        currentModel = FALLBACK_MODEL;
      }
      
      retries++;
      
      if (retries < MAX_RETRIES) {
        console.log(`[OpenAI] Retrying in ${RETRY_DELAY}ms...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    }
  }

  console.error(`[OpenAI] Failed after ${MAX_RETRIES} attempts`);
  return null;
}
