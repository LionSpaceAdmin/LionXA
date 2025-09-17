'use server';

import { genkit, ModelArgument } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { firebase } from '@genkit-ai/firebase';
import { z } from 'zod';
import { run } from 'genkit/cli';

// Initialize Genkit with Firebase and Google AI plugins
export const ai = genkit({
  plugins: [
    firebase(),
    googleAI({ apiVersion: 'v1beta' }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

/**
 * Defines a simple text-generation flow with Gemini.
 */
export const simpleTextGenerationFlow = ai.defineFlow(
  {
    name: 'simpleTextGenerationFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (prompt) => {
    const llmResponse = await ai.generate({
      model: 'googleai/gemini-1.5-pro-latest',
      prompt: prompt,
    });
    
    return llmResponse.text() ?? '';
  }
);
