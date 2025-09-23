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
  const regex = new RegExp(`\\b(${PROFANITY_FILTER.join('|')})\\b`, 'i');
  return regex.test(lowerCaseText);
}
