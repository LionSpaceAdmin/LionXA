import { Profile } from "../../src/profiles/types";

const profile: Profile & { handles: string[]; facts: string[] } = {
  username: "SuppressedNws",
  handles: [
    "suppressednws",
    "suppressednews",
    "suppressed_nws",
    "suppressed_news",
    "suppnews",
    "supp_nws",
    "suppressednws1", // טעות נפוצה
  ],
  customPrompt: `{{TWEET_TEXT}}\n\nYour "hidden truth" is recycled trash. Facts just took out your garbage. 🗑️🔍\nFact: {{FACT}}`,
  facts: [
    "Reposting rumors doesn't make them true.",
    "If your facts were real, you wouldn't need to hide them.",
    "Echo chambers aren't evidence.",
    "Conspiracies collapse under real scrutiny.",
    "Truth isn't afraid of sunlight.",
  ],
};

export default profile;
