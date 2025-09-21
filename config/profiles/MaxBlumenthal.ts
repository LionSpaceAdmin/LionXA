import { Profile } from "./types";

const profile: Profile & { handles: string[]; facts: string[] } = {
  username: "maxblumenthal",
  handles: [
    "maxblumenthal",
    "max_blumenthal",
    "thegrayzonenews",
    "maxb",
    "maxblum",
    "maxblumental", // טעות נפוצה
    "blumenthal",
  ],
  customPrompt: `{{TWEET_TEXT}}\n\nYour "investigation" is a clown show. Facts just wiped your spin. 🕵️‍♂️💩\nFact: {{FACT}}`,
  facts: [
    "Cherry-picking sources isn't journalism.",
    "Ignoring facts doesn't erase them.",
    "Propaganda isn't investigation.",
    "Real journalists welcome scrutiny.",
    "Bias isn't a substitute for evidence.",
  ],
};

export default profile;
