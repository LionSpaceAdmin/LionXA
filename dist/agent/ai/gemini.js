"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.askGemini = askGemini;
// src/ai/gemini.ts
const genkit_1 = require("./genkit");
/**
 * Sends a prompt to the Gemini model via a Genkit flow and returns the response.
 * @param prompt The text prompt to send to the model.
 * @returns A promise that resolves to the model's text response.
 */
async function askGemini(prompt) {
    try {
        const response = await (0, genkit_1.simpleTextGenerationFlow)(prompt);
        return response;
    }
    catch (error) {
        console.error('Error interacting with Gemini:', error);
        // In case of an error, return a safe, empty response
        return '';
    }
}
