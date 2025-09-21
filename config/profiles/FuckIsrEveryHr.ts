// src/profiles/FuckIsrEveryHr.ts
import { Profile } from "./types";

export const FuckIsrEveryHr: Profile & { handles: string[] } = {
  username: "fuckisreveryhr",
  handles: [
    "fuckisreveryhr",
    "fuckisraelmeter",
    "fuckisrael",
    "fuckisreveryhour",
    "fuckisreveryhr1", // טעות נפוצה
    "fuckisr",
    "f_isreveryhr",
  ],
  customPrompt: `{{TWEET_TEXT}}\n\nYour hate-bot routine is pathetic. Facts just roasted your obsession. 🤖🔥\nFact: {{FACT}}`,
  facts: [
    "Bots don't win arguments—facts do.",
    "Obsession isn't a substitute for logic.",
    "Automated hate is still just hate.",
    "Repeating slurs isn't activism.",
    "Facts > spam, every time.",
  ],
};
