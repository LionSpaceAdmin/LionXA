// List of target accounts to monitor and respond to
export const TARGET_ACCOUNTS: {
  [username: string]: {
    tone: string;
    style: string;
    persona: string;
    keywords: string[];
    customPrompt: string;
  };
} = {
  // Example:
  // 'elonmusk': {
  //   tone: 'witty',
  //   style: 'direct',
  //   persona: 'Tech Visionary',
  //   keywords: ['AI', 'Mars', 'Tesla'],
  //   customPrompt: 'Respond as a tech visionary who values innovation.'
  // }
};
