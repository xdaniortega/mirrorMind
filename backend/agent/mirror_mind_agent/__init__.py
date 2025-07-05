import getpass

from IPython.display import Image, display

from langchain.chat_models import init_chat_model
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI

import os

from typing import Annotated
from typing_extensions import TypedDict

class State(TypedDict):
    # Messages have the type "list". The `add_messages` function
    # in the annotation defines how this state key should be updated
    # (in this case, it appends messages to the list, rather than overwriting them)
    messages: Annotated[list, add_messages]

class MirrorMindAgent:
    graph = None

    def __init__(self):
        graph_builder = StateGraph(State)

        llm = init_chat_model("anthropic:claude-3-5-sonnet-latest") if os.environ.get("ANTHROPIC_API_KEY") else init_chat_model("openai:chatgpt-o4")

        def chatbot(state: State):
            return {"messages": [llm.invoke(state["messages"])]}

        # The first argument is the unique node name
        # The second argument is the function or object that will be called whenever
        # the node is used.
        graph_builder.add_node("chatbot", chatbot)

        graph_builder.add_edge(START, "chatbot")

        graph_builder.add_edge("chatbot", END)

        self.graph = graph_builder.compile()

    def drawAgent(self):
        display(Image(graph.get_graph().draw_mermaid_png()))

    def return_langgraph_agent_func(self):
        # Wrap LangGraph agent into a function for UAgent
        def langgraph_agent_func(query):
            # Handle input if it's a dict with 'input' key
            if isinstance(query, dict) and 'input' in query:
                query = query['input']

            messages = {"messages": [HumanMessage(content=query)]}
            final = None
            for output in self.graph.stream(messages):
                final = list(output.values())[0]  # Get latest
            return final["messages"][-1].content if final else "No response"
        return langgraph_agent_func
