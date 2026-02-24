import os
from dotenv import load_dotenv
from pydantic import BaseModel
from ollama import chat


class Grade(BaseModel):
    report: str
    letter_grade: str
    percentage: float


def grade_art(assignment: str, img: bytes, media_type: str) -> Grade:
    # Environment Setup
    load_dotenv()

    # Model Setup
    model_name = 'llama3.2'

    messages = [
        {'role': 'user', 'content': 'Can you grade this image according to this assigment'},
        {'role': 'system', 'content': "You are a supportive but critical assistant in the user's self-teaching art experience. Provide a detailed report on the user's performance against the requirements. Also, provide a letter grade, and percentage scored as a float (i.e C, 0.70)."}
    ]

    response = chat(
        model=model_name,
        format=Grade.model_json_schema()
    )

    grade : Grade = Grade.model_validate_json(response.message.content)
    return grade
