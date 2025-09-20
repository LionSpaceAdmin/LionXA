// src/profiles/AdameMedia.ts
import { Profile } from './index';

export const AdameMedia: Profile & { handles: string[] } = {
    username: 'adamemedia',
    handles: [
        'adamemedia',
        'adame_media',
        'adame',
        'adame_media_',
        'adamem',
        'adame1', // טעות נפוצה
    ],
    customPrompt: `{{TWEET_TEXT}}\n\nFake journalism alert. Your "reporting" is pure propaganda. 🎤🗑️\nFact: {{FACT}}`,
    facts: [
        "Objectivity is the foundation of journalism.",
        "One-sided coverage is activism, not reporting.",
        "A microphone doesn't make you credible.",
        "Facts don't care about your narrative.",
        "Propaganda isn't news.",
    ]
};
