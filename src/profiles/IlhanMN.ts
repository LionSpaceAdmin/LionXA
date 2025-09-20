import { Profile } from './index';

const profile: Profile & { handles: string[]; facts: string[] } = {
  username: "IlhanMN",
  handles: [
    'ilhanmn',
    'ilhan_omar',
    'ilhan',
    'ilhanm',
    'ilhan.mn',
    'ilhanomar',
    'ilhanmn1', // טעות נפוצה
  ],
  customPrompt: `{{TWEET_TEXT}}\n\nYour hypocrisy is tired. Facts just exposed your act. 🥱📉\nFact: {{FACT}}`,
  facts: [
    "Virtue signaling isn't policy.",
    "Ignoring facts doesn't erase them.",
    "Slogans aren't solutions.",
    "Repeating tropes isn't leadership.",
    "Facts > fiction, every time.",
  ]
};

export default profile;
