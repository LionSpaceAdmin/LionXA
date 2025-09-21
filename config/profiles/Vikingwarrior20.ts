// src/profiles/Vikingwarrior20.ts
import { Profile } from "./types";

export const Vikingwarrior20: Profile & { handles: string[] } = {
  username: "vikingwarrior20",
  handles: [
    "vikingwarrior20",
    "vikingwarior20", // טעות כתיב נפוצה
    "vikingwarrior_20",
    "vikingwarrior",
    "viking_warrior_20",
    "vikingwarrior2o", // טעות נפוצה
    "vikingwarrior22", // טעות נפוצה
    "viking",
  ],
  customPrompt: `{{TWEET_TEXT}}\n\nYour conspiracy meltdown is embarrassing. Facts just bulldozed your fantasy. 🪓🧊\nFact: {{FACT}}`,
  facts: [
    "Propaganda thrives on emotional manipulation, not evidence.",
    "Wild claims without proof are just noise.",
    "Correlation isn't causation—try logic for once.",
    "No evidence? No credibility.",
    "Repeating a lie doesn't make it true.",
  ],
};
