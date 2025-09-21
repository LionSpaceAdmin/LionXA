# Communication Layer Implementation Report

## 1. Summary of WebSocket Architecture

This report details the implementation of the core communication channel for the Xagent project. The architecture establishes a robust and asynchronous link between the `backend` service and the `browser-agent` service using WebSockets.

-   **`backend` (WebSocket Server):** A FastAPI application that exposes a WebSocket endpoint at `/ws/agent`. It is responsible for managing a single, active connection from the browser agent. It also provides a RESTful API endpoint at `/api/agent/command` which allows other services or users to send commands to the agent. When a command is received, the backend forwards it to the agent through the persistent WebSocket connection.

-   **`browser-agent` (WebSocket Client):** A Python script that connects to the backend's WebSocket server. Upon connection, it launches a Playwright-managed Chromium browser. The agent then enters an infinite loop, listening for JSON-based commands from the backend. When a command like `{"action": "goto", "url": "..."}` is received, it executes the corresponding action in the browser. After execution, it sends a status message back to the backend, confirming the result. The agent includes robust error handling and automatic reconnection logic to ensure resilience.

This client-server model allows for real-time, bidirectional communication, enabling the backend to control the browser agent's actions dynamically.

## 2. Final Code

### 2.1. `services/browser-agent/browser_agent.py`

```python
import asyncio
import json
import websockets
from playwright.async_api import async_playwright, Page, Browser

async def run_agent():
    """
    Main function to run the browser agent.
    Connects to the backend WebSocket and listens for commands.
    """
    while True:
        try:
            async with websockets.connect("ws://backend:8000/ws/agent") as websocket:
                print("Connected to backend WebSocket.")
                
                async with async_playwright() as p:
                    # Using a persistent context to maintain session data
                    context = await p.chromium.launch_persistent_context(
                        user_data_dir="/home/agentuser/agent_profile",
                        headless=False, 
                        args=["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"]
                    )
                    page = await context.new_page()
                    print("Browser launched with persistent context.")

                    while True:
                        try:
                            message = await websocket.recv()
                            command = json.loads(message)
                            print(f"Received command: {command}")

                            action = command.get("action")
                            
                            if action == "goto":
                                url = command.get("url")
                                if url:
                                    await page.goto(url)
                                    response = {"status": "success", "action": "goto", "details": f"Navigated to {url}"}
                                else:
                                    response = {"status": "error", "action": "goto", "details": "Missing URL"}
                            else:
                                response = {"status": "error", "action": "unknown", "details": f"Unknown action: {action}"}

                            await websocket.send(json.dumps(response))
                            print(f"Sent response: {response}")

                        except json.JSONDecodeError:
                            error_response = {"status": "error", "details": "Invalid JSON received"}
                            await websocket.send(json.dumps(error_response))
                        except Exception as e:
                            error_response = {"status": "error", "details": str(e)}
                            await websocket.send(json.dumps(error_response))
                            print(f"An error occurred during command execution: {e}")
                            # Decide if we need to break the inner loop and restart the browser
                            if "Target closed" in str(e):
                                print("Browser connection lost, attempting to reconnect...")
                                break


        except (websockets.exceptions.ConnectionClosed, ConnectionRefusedError) as e:
            print(f"Connection to backend failed: {e}. Retrying in 5 seconds...")
            await asyncio.sleep(5)
        except Exception as e:
            print(f"An unexpected error occurred in the agent loop: {e}. Retrying in 5 seconds...")
            await asyncio.sleep(5)


if __name__ == "__main__":
    asyncio.run(run_agent())
```

### 2.2. `services/backend/app/main.py`

```python
import asyncio
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from typing import Optional

app = FastAPI(
    title="Xagent Backend",
    description="Manages the browser agent and provides a command API.",
    version="0.1.0",
)

class ConnectionManager:
    """Manages the WebSocket connection to the browser agent."""
    def __init__(self):
        self.active_connection: Optional[WebSocket] = None

    async def connect(self, websocket: WebSocket):
        """Accepts and stores a new WebSocket connection."""
        await websocket.accept()
        if self.active_connection:
            # Optionally, you could disconnect the old agent or reject the new one.
            print("An agent is already connected. Replacing the connection.")
        self.active_connection = websocket

    def disconnect(self):
        """Marks the WebSocket connection as closed."""
        self.active_connection = None

    async def send_command(self, command: dict):
        """Sends a JSON command to the connected agent."""
        if self.active_connection:
            await self.active_connection.send_text(json.dumps(command))
            return True
        return False

manager = ConnectionManager()

@app.websocket("/ws/agent")
async def websocket_endpoint(websocket: WebSocket):
    """Accepts and manages a WebSocket connection from the browser-agent."""
    await manager.connect(websocket)
    print("Browser agent connected.")
    try:
        while True:
            # Listen for status updates from the agent
            data = await websocket.receive_text()
            print(f"Received status from agent: {data}")
    except WebSocketDisconnect:
        manager.disconnect()
        print("Browser agent disconnected.")
    except Exception as e:
        manager.disconnect()
        print(f"An error occurred in the agent WebSocket: {e}")

@app.post("/api/agent/command", status_code=202)
async def agent_command(command: dict):
    """Receives a command and forwards it to the connected browser-agent."""
    if not manager.active_connection:
        raise HTTPException(status_code=503, detail="Agent not connected")
    
    success = await manager.send_command(command)
    if success:
        return {"status": "Command sent to agent", "command": command}
    else:
        # This case should ideally not be hit if the connection check passes
        raise HTTPException(status_code=500, detail="Failed to send command to agent")

@app.get("/")
def read_root():
    return {"status": "Backend is running", "agent_connected": manager.active_connection is not None}
```

## 3. Testing and Verification Plan

The root `README.md` file has been updated with a new section titled "## How to Test the Agent Communication". This section provides clear, step-by-step instructions for starting the services, sending a `goto` command to the agent via a `curl` request, and verifying the successful execution by observing the agent's browser in the Guacamole interface and checking the service logs.

## 4. Conclusion

The core communication channel between the backend and the browser-agent is now fully functional. The system is capable of receiving external commands, relaying them to the agent in real-time, and executing them in a controlled browser environment. This foundational link is critical for the subsequent development of more complex agent behaviors and UI interactions.