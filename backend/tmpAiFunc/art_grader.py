import os
from dotenv import load_dotenv
from ollama import chat
from pydantic import BaseModel


class Grade(BaseModel):
    letter_grade: str
    percentage: float


def grade_art(img: bytes, assignment: str) -> Grade:
    # Environment Setup
    load_dotenv()

    # Model Setup
    model_name = 'qwen3-vl:235b-cloud'

    messages = [
        {'role': 'user', 'content': 'Can you grade this image according to this assigment'},
        {'role': 'user', 'content': "Provide a detailed report on the user's performance against the requirements."},
        {'role': 'user', 'content': 'Also, provide a letter grade, and percentage scored as a float (i.e C, 0.70).'}
    ]

    response = chat(
        model=model_name,
        messages=messages,
        format=Grade.model_json_schema()
    )

    grade : Grade = Grade.model_validate_json(response.message.content)
    return grade

