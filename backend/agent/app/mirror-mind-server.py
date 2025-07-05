#!/usr/bin/env python3

import getpass
import os
import time
import uuid

from dotenv import load_dotenv
from uagents_adapter import LangchainRegisterTool, cleanup_uagent

from mirror_mind_agent import MirrorMindAgent

load_dotenv()

from dotenv import load_dotenv

load_dotenv()

if not os.environ.get("ANTHROPIC_API_KEY") and not os.environ.get("OPENAI_API_KEY"):
    os.environ["ANTHROPIC_API_KEY"] = getpass.getpass("Anthropic API Key:\n")

if not os.environ.get("AGENTVERSE_API_KEY"):
    os.environ["AGENTVERSE_API_KEY"] = getpass.getpass("Agent Verse API Key:\n")

# Get API token for Agentverse
API_TOKEN = os.environ["AGENTVERSE_API_KEY"]

if not API_TOKEN:
    raise ValueError("Please set AGENTVERSE_API_KEY environment variable")

mirror_mind_agent = MirrorMindAgent()

# Register the LangGraph agent via uAgent
tool = LangchainRegisterTool()
uid_suf = str(uuid.uuid1())[:5]
agent_info = tool.invoke(
    {
        "agent_obj": mirror_mind_agent.return_langgraph_agent_func(),
        "name": "mirror_mind_gamma_" + uid_suf,
        "port": 8080,
        "seed": "mirrormind.server.demo." + uid_suf,
        "description": "A LangGraph-based Tavily-powered search agent",
        "api_token": API_TOKEN,
        "endpoint": "http://0.0.0.0:8080/submit",
        # "mailbox": True,
        "publish_agent_details": True,
    }
)

print(f"✅ Registered LangGraph agent: {agent_info}")

# Keep the agent alive
try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    print("🛑 Shutting down LangGraph agent...")
    cleanup_uagent("langgraph_tavily_agent")
    print("✅ Agent stopped.")
