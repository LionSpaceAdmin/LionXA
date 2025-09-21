import os
from typing import TypedDict, Annotated, List
from langchain_core.messages import BaseMessage, AnyMessage
from langchain_core.pydantic_v1 import BaseModel
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI

from .tools import BrowserTool

# Ensure the OPENAI_API_KEY is set
if not os.getenv("OPENAI_API_KEY"):
    raise ValueError("OPENAI_API_KEY environment variable not set")

class AgentState(TypedDict):
    """The state of the agent."""
    prompt: str
    agent_outcome: Annotated[List[AnyMessage], lambda x, y: x + y]

# Initialize the tool and the LLM
tools = [BrowserTool()]
llm = ChatOpenAI(model="gpt-4-turbo-preview", temperature=0).bind_tools(tools)

def agent_node(state: AgentState):
    """The primary node that decides the next action."""
    outcome = llm.invoke(state["prompt"])
    return {"agent_outcome": [outcome]}

def tool_node(state: AgentState):
    """This node executes the tools called by the agent."""
    tool_calls = state["agent_outcome"][-1].tool_calls
    tool_outputs = []
    for tool_call in tool_calls:
        tool_output = tools[0].invoke(tool_call["args"])
        tool_outputs.append(
            {
                "tool_call_id": tool_call["id"],
                "output": tool_output,
            }
        )
    return {"agent_outcome": tool_outputs}

def should_continue(state: AgentState) -> str:
    """Determines whether to continue the loop or end."""
    if state["agent_outcome"][-1].tool_calls:
        return "continue"
    return "end"

# Define the graph
graph = StateGraph(AgentState)
graph.add_node("agent", agent_node)
graph.add_node("tools", tool_node)

graph.set_entry_point("agent")

graph.add_conditional_edges(
    "agent",
    should_continue,
    {
        "continue": "tools",
        "end": END,
    },
)

graph.add_edge("tools", "agent")

# Compile the graph into a runnable object
compiled_graph = graph.compile()
