import asyncio
import json
import uuid
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from typing import Optional, Dict
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI(
    title="Xagent AI Backend",
    description="Manages the browser agent via an AI-driven LangGraph agent.",
    version="0.2.0",
)

class ConnectionManager:
    """Manages the WebSocket connection and request-response cycles with the browser agent."""
    def __init__(self):
        self.active_connection: Optional[WebSocket] = None
        self.response_futures: Dict[str, asyncio.Future] = {}

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connection = websocket

    def disconnect(self):
        self.active_connection = None
        # Cancel all pending futures on disconnect
        for future in self.response_futures.values():
            if not future.done():
                future.set_exception(ConnectionResetError("Agent disconnected"))
        self.response_futures.clear()

    async def send_command(self, command: dict) -> bool:
        """Sends a fire-and-forget command to the agent."""
        if self.active_connection:
            await self.active_connection.send_text(json.dumps(command))
            return True
        return False

    async def send_command_and_wait(self, command: dict, timeout: int = 30) -> dict:
        """Sends a command to the agent and waits for a specific response."""
        if not self.active_connection:
            raise ConnectionResetError("Agent not connected")

        message_id = str(uuid.uuid4())
        command["message_id"] = message_id

        future = asyncio.get_event_loop().create_future()
        self.response_futures[message_id] = future

        try:
            await self.active_connection.send_text(json.dumps(command))
            # Wait for the response from the agent
            response = await asyncio.wait_for(future, timeout=timeout)
            return response
        except asyncio.TimeoutError:
            raise TimeoutError(f"Did not receive response from agent for message {message_id} within {timeout}s")
        finally:
            # Clean up the future
            self.response_futures.pop(message_id, None)

manager = ConnectionManager()

# Must be imported after manager is created
from .agent_graph import compiled_graph

@app.get("/health")
def health_check():
    """Simple health check endpoint."""
    return {"status": "ok"}

@app.websocket("/ws/agent")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    print("Browser agent connected.")
    try:
        while True:
            data = await websocket.receive_text()
            response = json.loads(data)
            message_id = response.get("message_id")
            if message_id and message_id in manager.response_futures:
                future = manager.response_futures[message_id]
                if not future.done():
                    future.set_result(response)
            else:
                print(f"Received unsolicited status from agent: {data}")
    except (WebSocketDisconnect, ConnectionResetError):
        manager.disconnect()
        print("Browser agent disconnected.")
    except Exception as e:
        manager.disconnect()
        print(f"An error occurred in the agent WebSocket: {e}")

@app.post("/api/agent/command", status_code=200)
async def agent_command(payload: Dict[str, str]):
    """Receives a natural language prompt and invokes the AI agent."""
    prompt = payload.get("prompt")
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")

    if not manager.active_connection:
        raise HTTPException(status_code=503, detail="Agent not connected")

    try:
        # The graph will use the tools, which in turn use the manager
        result = await compiled_graph.ainvoke({"prompt": prompt})
        return {"status": "Agent execution finished", "result": result.get("agent_outcome")}
    except Exception as e:
        print(f"Agent execution error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/agent/prove_connection", status_code=202)
async def prove_connection():
    """Sends a screenshot command to the agent as proof of life."""
    screenshot_command = {"action": "screenshot", "path": "/home/agentuser/proof.png"}
    if not await manager.send_command(screenshot_command):
        raise HTTPException(status_code=503, detail="Agent not connected")
    return {"status": "Screenshot command sent to agent"}

@app.get("/")
def read_root():
    return {"status": "Backend is running", "agent_connected": manager.active_connection is not None}
