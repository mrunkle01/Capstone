import os
from dotenv import load_dotenv
from pydantic_ai import Agent, BinaryContent, settings
from pydantic_ai.models.openai import OpenAIChatModel
from pydantic_ai.providers.ollama import OllamaProvider
from pydantic import BaseModel

BASE_URL = os.environ.get('OLLAMA_BASE_URL')


class Grade(BaseModel):
    report: str
    letter_grade: str
    percentage: float


def grade_art(assignment: str, img: bytes, media_type: str) -> Grade:
    # Environment Setup
    load_dotenv()

    # Model Setup
    model_name = 'gemma3:27b-cloud'
    ollama_model = OpenAIChatModel(
        model_name=model_name,
        provider=OllamaProvider(base_url=BASE_URL)
    )
    model_settings = (settings.ModelSettings
    (
        temperature=0.8
    ))

    messages = [
        'Can you grade this image according to this assigment',
        BinaryContent(data=img, media_type=media_type),
        assignment
    ]

    agent = Agent(
        model=ollama_model,
        instructions=(
            "You are a supportive but critical assistant in the user's self-teaching art experience"
            "Provide a detailed report on the user's performance against the requirements."
            "Also, provide a letter grade, and percentage scored as a float (i.e C, 0.70)."
        ),
        model_settings=model_settings
    )

    result = agent.run_sync(messages)
    # grade : Grade = Grade(result.output, 'C', 0.7)
    return Grade()
