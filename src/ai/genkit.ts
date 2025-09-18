'use server';

import { genkit, ModelArgument } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
// The package does not export the internal `/plugin` path in recent versions;
// import from the package root instead.
import { z } from 'zod';

// Initialize Genkit with Firebase and Google AI plugins
export const ai = genkit({
  plugins: [
    // Firebase plugin was previously imported from an internal path that is not
    // exported by the package. Omit it here (it's optional) and only enable
    // firebase-specific functionality where required and available.
    googleAI({ apiVersion: 'v1beta' }),
  ],
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
    
    return llmResponse.text ?? '';
  }
);
