#!/usr/bin/env python3

from datetime import datetime
from uuid import uuid4
from uagents import Agent, Protocol, Context, Model

#import the necessary components from the chat protocol
from uagents_core.contrib.protocols.chat import (
    ChatAcknowledgement,
    ChatMessage,
    TextContent,
    chat_protocol_spec,
)

# Define your models
class Request(Model):
    text: str

class Response(Model):
    timestamp: int
    text: str
    agent_address: str

proxy = Agent(name="mirror-mind-proxy",
              port=8082,
              mailbox=True,
              seed="mirrormind.client.test"
              )

# Initialize the chat protocol
chat_proto = Protocol(spec=chat_protocol_spec)

server_agent_address = "agent1qdwsgvgc7sx2qswce7vgl6gl3x4cs0yjkk55r4xyu2wd4t25a0d5vjp58np"

# Startup Handler - Print agent details
@proxy.on_event("startup")
async def startup_handler(ctx: Context):
    # Print agent details
    ctx.logger.info(f"My name is {ctx.agent.name} and my address is {ctx.agent.address}")

    # Send initial message to agent2
    initial_message = ChatMessage(
        timestamp=datetime.utcnow(),
        msg_id=uuid4(),
        content=[TextContent(type="text", text="This event is going to start a conversation")]
    )
    await ctx.send(server_agent_address, initial_message)

@proxy.on_message(model = ChatMessage)
async def message_handler(ctx: Context, sender : str, msg: ChatMessage):
    ctx.logger.info(f'I have received a message from {sender}.')
    ctx.logger.info(f'I have received a message {msg.content}.')


# POST endpoint example
@proxy.on_rest_post("/chat", Request, Response)
async def handle_post(ctx: Context, req: Request) -> Response:
    ctx.logger.info(f"Received post request {req.text}")

    chat_message = ChatMessage(
        timestamp=datetime.utcnow(),
        msg_id=uuid4(),
        content=[TextContent(type="text", text=req.text)]
    )
    await ctx.send(server_agent_address, chat_message)


if __name__ == '__main__':
    proxy.run()
