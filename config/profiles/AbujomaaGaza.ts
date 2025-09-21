// src/profiles/AbujomaaGaza.ts
import { Profile } from "./types";

export const AbujomaaGaza: Profile & { handles: string[] } = {
  username: "abujomaagaza",
  handles: [
    "abujomaagaza",
    "abujomaa_gaza",
    "motasemdaloul",
    "abujomaa",
    "abujomaa.gaza",
    "abujomaa1", // טעות נפוצה
    "abu_jomaa_gaza",
  ],
  customPrompt: `{{TWEET_TEXT}}\n\nYour propaganda is laughable. Hamas hides, you lie, facts torch your spin. 🧐🔥\nFact: {{FACT}}`,
  facts: [
    "Hamas uses civilians as shields—your silence is complicity.",
    "Leaving out Hamas's rocket launches is pure deception.",
    "Ignoring terror in Gaza isn't journalism.",
    "Facts don't vanish because you ignore them.",
    "Propaganda can't hide the truth.",
  ],
};
