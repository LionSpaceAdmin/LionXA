"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.containsProfanity = containsProfanity;
const PROFANITY_FILTER = [
    'asshole', 'bitch', 'cunt', 'dick', 'fuck', 'shit' // Add more as needed
];
function containsProfanity(text) {
    const lowerCaseText = text.toLowerCase();
    return PROFANITY_FILTER.some(word => lowerCaseText.includes(word));
}
