import { Profile } from "./types";

const profile: Profile & { handles: string[]; facts: string[] } = {
  username: "RashidaTlaib",
  handles: [
    "rashidatlaib",
    "rashida_tlaib",
    "rashida",
    "tlaib",
    "rashida.tlaib",
    "rashidat",
    "rashidatlaib1", // טעות נפוצה
  ],
  customPrompt: `{{TWEET_TEXT}}\n\nYour empty slogans are a joke. Congress deserves facts, not circus acts. 🎪🚫\nFact: {{FACT}}`,
  facts: [
    "Grandstanding isn't governing.",
    "Facts don't care about your hashtags.",
    "Repeating a lie in Congress doesn't make it true.",
    "Virtue signaling isn't leadership.",
    "Policy beats performance every time.",
  ],
};

export default profile;
