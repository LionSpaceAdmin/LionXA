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

                            message_id = command.get("message_id")
                            response = {"message_id": message_id} # Start response with the message_id

                            action = command.get("action")
                            
                            if action == "goto":
                                url = command.get("url")
                                if url:
                                    await page.goto(url)
                                    response.update({"status": "success", "action": "goto", "details": f"Navigated to {url}"})
                                else:
                                    response.update({"status": "error", "action": "goto", "details": "Missing URL"})
                            elif action == "screenshot":
                                path = command.get("path", "/tmp/screenshot.png")
                                await page.screenshot(path=path)
                                response.update({"status": "success", "action": "screenshot", "details": f"Screenshot saved to {path}"})
                            else:
                                response.update({"status": "error", "action": "unknown", "details": f"Unknown action: {action}"})

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
