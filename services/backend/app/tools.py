import asyncio
from typing import Type
from langchain.tools import BaseTool
from pydantic import BaseModel, Field

# Import the global connection manager
from .main import manager

class GoToURLInput(BaseModel):
    """Input for the goto_url tool."""
    url: str = Field(description="The URL to navigate to.")

class BrowserTool(BaseTool):
    name = "goto_url"
    description = "Navigates the browser to a specified URL."
    args_schema: Type[BaseModel] = GoToURLInput

    def _run(self, url: str) -> str:
        """Use the tool synchronously."""
        # This is a synchronous wrapper for the async method
        return asyncio.run(self._arun(url))

    async def _arun(self, url: str) -> str:
        """Use the tool asynchronously."""
        if not isinstance(url, str):
            return "Error: URL must be a string."
        
        print(f"BrowserTool: Navigating to {url}")
        command = {"action": "goto", "url": url}
        
        try:
            # Use the manager to send the command and wait for the response
            response = await manager.send_command_and_wait(command)
            status = response.get("status")
            details = response.get("details")
            if status == "success":
                return f"Successfully navigated to {url}. Details: {details}"
            else:
                return f"Failed to navigate to {url}. Reason: {details}"
        except ConnectionResetError:
            return "Error: Agent is not connected."
        except TimeoutError:
            return "Error: Timed out waiting for a response from the browser agent."
        except Exception as e:
            return f"An unexpected error occurred: {e}"
