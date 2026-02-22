import os
from pathlib import Path
from dotenv import load_dotenv
from pydantic_ai import Agent, BinaryContent, settings
from pydantic_ai.models.openai import OpenAIChatModel
from pydantic_ai.providers.ollama import OllamaProvider
from pydantic import BaseModel


class Grade(BaseModel):
    letter_grade : str
    percentage : float


def grade_art():
    # Environment Setup
    load_dotenv()
    BASE_URL = os.environ.get('OLLAMA_BASE_URL')

    # Model Setup
    model_name = 'qwen3-vl:235b-cloud'
    ollama_model = OpenAIChatModel(
        model_name=model_name,
        provider=OllamaProvider(base_url=BASE_URL)
    )
    model_settings = (settings.ModelSettings
    (
        temperature=0.8
    ))

    # Input
    img_path = f'./{input("Enter image name: ")}'
    media_type=f'image/{input("Enter image format: ")}'
    assignment = "Draw 8 circles with confident lines. Make sure the circles aren't oval or lopsided."

    img = Path(img_path).read_bytes()

    system_prompt = """
    You are a supportive but critical assistant in the user's self-teaching art experience
    """

    messages = [
        'Can you grade this image according to this assigment',
        BinaryContent(data=img, media_type=media_type),
        assignment
    ]

    agent = Agent(
        model=ollama_model,
        system_prompt=system_prompt,
        instructions=(
            "Provide a detailed report on the user's performance against the requirements."
            "Also, provide a letter grade, and percentage scored as a float (i.e C, 0.70)."
        ),
        model_settings=model_settings
    )

    print(agent.run_sync(messages).output)