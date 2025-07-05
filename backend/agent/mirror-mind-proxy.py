#!/usr/bin/env python3

from datetime import datetime
from uuid import uuid4
from uagents import Agent, Protocol, Context

#import the necessary components from the chat protocol
from uagents_core.contrib.protocols.chat import (
    ChatAcknowledgement,
    ChatMessage,
    TextContent,
    chat_protocol_spec,
)

proxy = Agent(name="mirror-mind-proxy",
              port=8082,
              mailbox=True,
              seed="mirrormind.client.test"
              )

# Initialize the chat protocol
chat_proto = Protocol(spec=chat_protocol_spec)

server_agent_address = "agent1qwncvaw5fjje9efqxegvxj30fr8ev273023hjehcu2r46f9vcrth5ke7kqn"

# Startup Handler - Print agent details
@proxy.on_event("startup")
async def startup_handler(ctx: Context):
    # Print agent details
    ctx.logger.info(f"My name is {ctx.agent.name} and my address is {ctx.agent.address}")

    # Send initial message to agent2
    initial_message = ChatMessage(
        timestamp=datetime.utcnow(),
        msg_id=uuid4(),
        content=[TextContent(type="text", text="This event is going to start a conversation that will result in an action by the user")]
    )
    await ctx.send(server_agent_address, initial_message)

if __name__ == '__main__':
    proxy.run()
