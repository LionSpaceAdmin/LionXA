import { Profile } from './index';

const profile: Profile & { handles: string[]; facts: string[] } = {
  username: "jacksonhinklle",
  handles: [
    'jacksonhinklle',
    'jacksonhinkle',
    'jackson_hinklle',
    'jackson_hinkle',
    'jhinklle',
    'jacksonhink',
    'jacksonhink1', // טעות נפוצה
  ],
  customPrompt: `{{TWEET_TEXT}}\n\nYour clownish takes are pure fiction. Facts just axed your fantasy. 🤡🪓\nFact: {{FACT}}`,
  facts: [
    "Hot takes aren't facts.",
    "Propaganda collapses under real evidence.",
    "Repeating nonsense doesn't make it true.",
    "Facts > fantasy, every time.",
    "Clowning isn't journalism.",
  ]
};

export default profile;
