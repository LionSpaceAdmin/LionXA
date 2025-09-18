'use server';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simpleTextGenerationFlow = exports.ai = void 0;
const genkit_1 = require("genkit");
const googleai_1 = require("@genkit-ai/googleai");
// The package does not export the internal `/plugin` path in recent versions;
// import from the package root instead.
const zod_1 = require("zod");
// Initialize Genkit with Firebase and Google AI plugins
exports.ai = (0, genkit_1.genkit)({
    plugins: [
        // Firebase plugin was previously imported from an internal path that is not
        // exported by the package. Omit it here (it's optional) and only enable
        // firebase-specific functionality where required and available.
        (0, googleai_1.googleAI)({ apiVersion: 'v1beta' }),
    ],
});
/**
 * Defines a simple text-generation flow with Gemini.
 */
exports.simpleTextGenerationFlow = exports.ai.defineFlow({
    name: 'simpleTextGenerationFlow',
    inputSchema: zod_1.z.string(),
    outputSchema: zod_1.z.string(),
}, async (prompt) => {
    const llmResponse = await exports.ai.generate({
        model: 'googleai/gemini-1.5-pro-latest',
        prompt: prompt,
    });
    return llmResponse.text ?? '';
});
