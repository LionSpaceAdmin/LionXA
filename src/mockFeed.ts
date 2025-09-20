import { dashboard, logGeminiCall, logReplyPosted, logTweetProcessed, logError, logSessionInit } from './dashboard';

async function main() {
  await dashboard.start();
  logSessionInit();

  const users = ['alice', 'bob', 'charlie', 'dana'];

  setInterval(() => {
    const u = users[Math.floor(Math.random() * users.length)];
    logTweetProcessed(u, 'Example tweet content lorem ipsum dolor sit amet.');
  }, 1500);

  setInterval(() => {
    const ok = Math.random() > 0.2;
    logGeminiCall('gemini-1.5-flash', Math.floor(Math.random() * 1500) + 200, ok);
    if (ok) {
      logReplyPosted('agent', 'Short, punchy reply', true);
    } else {
      logError('Simulated failure');
    }
  }, 2500);
}

main().catch(console.error);

