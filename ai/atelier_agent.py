import base64
import os
from pydantic_core import ValidationError
from dotenv import load_dotenv
from pydantic import BaseModel
from ollama import Client, WebSearchResponse, WebFetchResponse

# Atelier Agent Properties

personality = [
        {'role': 'system', 'content': """You are a critical but supportive assistant in personal growth and 
            self-teaching. Don't be a sycophant, give useful criticism. Encourage improvement by explaining weaknesses 
            and how to approach them. The domain of learning for now is art. So, be prepared to analyze art in great 
            detail. When assigning work for the user, make sure it doesn't require materials they don't have. You can 
            use the tool function get_user_materials() to do so. You should also use the tool function search_web to 
            supplement your knowledge and provide better assistance.
        """},
    ]

options = {
    'temperature': 0.8
}


# Atelier Agent Methods
def get_personality():
    temp = []
    for value in personality:
        temp.append(value)
    return temp


def chat(prompt):
    pass
    # Get user info and retrieve memory

    # Web search

    # # Handle Tool Calls
    # info = []
    # for call in response.message.tool_calls:
    #     func = tools.get(call.function.name)
    #     if func:
    #         # Try Catch
    #         result = func(**call.function.arguments)
    #         info.append({'role': 'tool', 'tool_name': call.function.name, 'content': str(result)})
    #
    # prompt += info
    #
    # informed_response = con.client.chat(
    #     model,
    #     messages=prompt, format=LessonPlan.model_json_schema(),
    #     tools=[get_user_materials],
    #     think=True, options=options)

    # Do error checking and retry

class AtelierConnection():
    client: Client

    def __init__(self):
        load_dotenv()
        self.client = Client(
            host="https://ollama.com",
            headers={'Authorization': 'Bearer ' + os.environ.get('OLLAMA_API_KEY')}
        )

    def fetch_user_info(self, url) -> WebFetchResponse:
        return self.client.web_fetch(url)


class Lesson(BaseModel):
    title: str
    content: str
    order: int


class Requirement(BaseModel):
    name: str
    points: int

    def to_string(self) -> str:
        return self.name + " " + str(self.points) + " pts."


class Assessment(BaseModel):
    title: str
    content: str
    requirements: list[Requirement]

    def to_string(self) -> str:
        req_string = ""
        for req in self.requirements:
            req_string += req.to_string() + '/n'
        return self.title + "/n" + self.content + req_string


class LessonPlan(BaseModel):
    section: str
    lessons: list[Lesson]
    assessment: Assessment


class Grade(BaseModel):
    score: float
    feedback: str
    report_id: str


def get_user_materials() -> str:
    # Replace with call to api later
    return "Pencil and paper"


tools = {
    "get_user_materials": get_user_materials,
}


def grade_art(assignment: str, img: bytes) -> Grade:
    con = AtelierConnection()
    model = 'qwen3-vl:235b-cloud'

    img_final = base64.b64encode(img).decode()

    with open('art_grading_instructions', 'r') as file:
        file_data = file.read()

    file_data = file_data.replace('{assignment}', assignment)

    print(file_data)

    instructions = {'role': 'user', 'content': file_data, 'images': [img_final]}

    prompt = get_personality()
    prompt.append(instructions)

    # Move chat logic to agent and inject prompt and format
    response = con.client.chat(model, messages=prompt, format=Grade.model_json_schema(), think=True, options=options)
    print(response.message.thinking)
    grade: Grade = Grade.model_validate_json(response.message.content)
    return grade


def generate_lesson_plan(topic: str, time_commit : str, skill : str) -> LessonPlan:
    con = AtelierConnection()

    model = 'qwen3-vl:235b-cloud'

    with open('lesson_plan_instructions', 'r') as file:
        file_data = file.read()

    file_data = file_data.replace('{topic}', topic)
    file_data = file_data.replace('{time_commit}', time_commit)
    file_data = file_data.replace('{skill}', skill)

    print(file_data)

    instructions = {'role': 'user', 'content': file_data}

    prompt = get_personality()
    prompt.append(instructions)

    response = con.client.chat(
        model,
        messages=prompt, format=LessonPlan.model_json_schema(),
        think=True, options=options)
    print(response.message.thinking)

    lesson_plan: LessonPlan = None

    try:
        lesson_plan: LessonPlan = LessonPlan.model_validate_json(response.message.content)
    except ValidationError:
        print("Invalid JSON")
    except:
        print("Unknown Exception")

    return lesson_plan
