from dotenv import load_dotenv
from ollama import chat
from pydantic import BaseModel


class Grade(BaseModel):
    letter_grade: str
    percentage: float


def grade_art(img, assignment) -> str:
    # Environment Setup
    load_dotenv()

    # Model Setup
    model_name = 'llama3.2'

    messages = [
        {'role': 'user', 'content': 'Can you grade this image according to this assignment', 'images': [img]},
        {'role': 'user', 'content': assignment},
        {'role': 'user', 'content': "Provide a detailed report on the user's performance against the requirements."},
        {'role': 'user', 'content': 'Also, provide a letter grade, and percentage scored as a float (i.e C, 0.70).'},
        {'role': 'user', 'content': 'Provide the previous in json format'}
    ]

    response = chat(
        model=model_name,
        messages=messages,
    )

    return response.message.content

