import base64
import os
from dotenv import load_dotenv
from pydantic import BaseModel
from ollama import Client


class Grade(BaseModel):
    score: float
    feedback: str
    report_id: str


def grade_art(assignment: str, img: bytes) -> Grade:
    # Model Setup
    load_dotenv()
    client = Client(
        host="https://ollama.com",
        headers={'Authorization': 'Bearer ' + os.environ.get('OLLAMA_API_KEY')}
    )

    model = 'qwen3-vl:235b-cloud'

    img_final = base64.b64encode(img).decode()

    messages = [
        {'role': 'user', 'content': "You are a supportive but critical assistant in personal growth for self-learners"},
        {'role': 'user', 'content': "Can you grade my performance drawing this image according to the following assignment", 'images': [img_final]},
        {'role': 'user', 'content': assignment},
        {'role': 'user', 'content': "Follow this json schema: {score:float,feedback:str,report_id:str}"},
        {'role': 'user', 'content': "Score is a percentage of 100 as a decimal (i.e 0.60 for 60%.)"},
        {'role': 'user', 'content': "Report id is a short string representation (i.e val_01_report)"}
    ]

    response = client.chat(model, messages=messages, format=Grade.model_json_schema())
    grade: Grade = Grade.model_validate_json(response.message.content)
    return grade
