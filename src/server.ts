
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';
import { dashboard } from './dashboard'; // Assuming dashboard setup is here
import { spawn } from 'child_process';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const port = process.env.PORT || 3000;

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server);

  // Integrate dashboard WebSocket logic
  dashboard.start(io);

  // Start the agent as a child process
  if (process.env.NODE_ENV === 'production') {
    const agent = spawn('pnpm', ['start:agent:prod'], { stdio: 'inherit', shell: true });
    agent.on('exit', (code) => {
      console.log(`Agent process exited with code ${code}`);
    });
  }

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
