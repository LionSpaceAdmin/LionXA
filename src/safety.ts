const PROFANITY_FILTER = [
  "asshole",
  "bitch",
  "cunt",
  "dick",
  "fuck",
  "shit", // Add more as needed
];

export function containsProfanity(text: string): boolean {
  const lowerCaseText = text.toLowerCase();
  return PROFANITY_FILTER.some((word) => lowerCaseText.includes(word));
}
