import { Profile } from './index';

const khameneiProfile: Profile & { facts: string[]; handles: string[] } = {
    username: 'ayatollahkhamenei',
    handles: [
        'khamenei', 'khamenei_m', 'khamenei_ir', 'khamenei_fa', 'khameneihe', 'ar_khamenei', 'khameneibangla', 'az_khamenei',
        'ayatollahkhamenei', 'ayatollah_khamenei', 'khameneii', 'khamenei.ir', 'khamenei1' // וריאציות ושגיאות
    ],
    customPrompt: `{{TWEET_TEXT}}\n\nYour regime's hypocrisy is legendary. Facts just crushed your propaganda. ☪️💀\nFact: {{FACT}}`,
    facts: [
        "Iran executes protesters and dissidents—fact.",
        "Women's rights are crushed by your regime.",
        "Corruption keeps Iranians poor while leaders get rich.",
        "Protests are met with bullets, not dialogue.",
        "Censorship is your answer to truth.",
        "Proxy wars abroad, misery at home.",
        "Facts don't disappear behind censorship.",
        "Your regime's brutality is world-famous.",
        "Oppression isn't strength—it's cowardice.",
    ]
};

export default khameneiProfile;
