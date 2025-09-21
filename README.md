# AI Browser Agent Infrastructure

This project contains a multi-container AI browser agent infrastructure, orchestrated with Docker Compose.

## How to Run

To start the entire stack, run the following command from the root of the project:

```bash
docker-compose up --build
```

## Services

- **Frontend:** A React application served by Nginx, available at `http://localhost:8080`.
- **Backend:** A FastAPI application, available at `http://localhost:8000`.
- **Browser Agent:** A Playwright-based agent running in a virtual framebuffer.
- **Guacamole:** A remote desktop gateway, available at `http://localhost:8081`. Use `guacadmin` for both username and password.

## How to Test the Agent Communication

1. Start all services by running `docker-compose up --build` in your terminal.

2. Wait for the logs to show that the `browser-agent` has successfully connected to the `backend` WebSocket.

3. Open a new terminal.

4. Send a command to the agent by running the following `curl` command:

   ```bash
   curl -X POST -H "Content-Type: application/json" -d '{"prompt": "Navigate to https://www.wikipedia.org"}' http://localhost:8000/api/agent/command
   ```

5. **Verify the result visually:** Open your web browser and navigate to the Guacamole interface at `http://localhost:8081`. You should see the browser inside the agent's container navigate to Wikipedia.

6. Check the terminal logs for both the `backend` and `browser-agent` services to see the command being sent, executed, and the status being reported back.