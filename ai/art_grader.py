import base64
import httpx
import os
from pathlib import Path
from dotenv import load_dotenv
from pydantic_ai import Agent, BinaryContent

load_dotenv()
model = "qwen3-vl:235b-cloud"
img_path = f'./{input("Enter image name")}'
assignment = input("Describe the assignment")



# Raw bytes if fine for local but cloud requires base64
img = base64.b64encode(Path(img_path).read_bytes()).decode()

agent = Agent(model)

messages = [
    {
        'system': 'You are a supportive but critical companion in self-teaching.',
        'role': 'user',
        'content': assignment,
        'images': [img],
    }
]

async def main():
    async with agent.run_stream(messages)