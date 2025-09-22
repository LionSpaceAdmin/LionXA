import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";
import { dashboard } from "./dashboard"; // Assuming dashboard setup is here
import { spawn } from "child_process";

const dev = process.env.NODE_ENV !== "production";
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

  // Listen for events from the agent process and broadcast them to all UI clients
  io.on("connection", (socket) => {
    socket.on("agent:event", (event) => {
      // Re-broadcast the agent's event to all UI clients
      io.emit("new-event", event);
    });
    socket.on("agent:screencap", (payload) => {
      // Re-broadcast the agent's screencap to all UI clients
      dashboard.broadcastScreencap(payload); // Use the dashboard method to also store the last screencap
    });
  });

  // Start the agent as a child process in all environments, always using the prod (headless) config
  const agent = spawn("pnpm", ["start:agent"], {
    stdio: "inherit",
    shell: true,
  });
  agent.on("exit", (code) => {
    console.log(`Agent process exited with code ${code}`);
    // Optionally, you might want to handle agent restarts here
  });

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
