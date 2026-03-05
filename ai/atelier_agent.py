import base64
import os

from dotenv import load_dotenv
from pydantic import BaseModel
from ollama import Client

personality = [
    {'role': 'system', 'content': """You are a critical but supportive assistant in personal growth and self-teaching. 
    Don't be a sycophant, give useful criticism. Encourage improvement by explaining weaknesses and how to approach 
    them. The domain of learning for now is art. So, be prepared to analyze art in great detail. When assigning work for
    the user, make sure it doesn't require materials they don't have. You can use the tool function get_user_materials()
    to do so."""},
]

options = {
    'temperature': 0.8
}


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
    "get_user_materials": get_user_materials
}


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
        {'role': 'user', 'content': "Can you grade my performance drawing this image according to the following assignment", 'images': [img_final]},
        {'role': 'user', 'content': assignment},
        {'role': 'user', 'content': """Follow this json schema: 
        {
            score:float,
            feedback:str,
            report_id:str
        }"""},
        {'role': 'user', 'content': "Score is a percentage of 0-100 represented by a float (i.e 0.5 for 50% and 1.0 for 100%"},
        {'role': 'user', 'content': "Report id is a short string representation (i.e val_01_report)"}
    ]

    prompt = personality + messages

    response = client.chat(model, messages=prompt, format=Grade.model_json_schema(), think=True, options=options)
    print(response.message.thinking)
    grade: Grade = Grade.model_validate_json(response.message.content)
    return grade


def generate_lesson_plan(topic: str) -> LessonPlan:
    # Model Setup
    load_dotenv()
    client = Client(
        host=os.environ.get('OLLAMA_BASE_URL'),
        headers={'Authorization': 'Bearer ' + os.environ.get('OLLAMA_API_KEY')}
    )

    model = 'qwen3-vl:235b-cloud'

    messages = [
        {'role': 'user', 'content': """Can you generate a lesson plan with three lessons on the following topic 
        with clear directions for me to exercise my skills. 
        """},
        {'role': 'user', 'content': topic},
        {'role': 'user', 'content': """
            Lesson Structure:
                - Introduction: Define the subtopics of the lesson and their importance.
                - Core Concepts: Key elements of the lesson exercises.
                - Exercises: A series of progressive exercises with clear instructions, materials needed, and techniques.
                - Common Pitfalls: What to avoid and how to correct.
                - Final Note: Up to you. Give encouragement; motivate me to practice and improve. Or you can give examples on art where this topic applies
        """},
        {'role': 'user', 'content': """Name the lesson plan after the topic. Give it three lessons each with a title 
        based on its content, descriptive content based on the lesson structure above, and its order in the lesson plan.
        """},
        {'role': 'user', 'content': """Finally, create a assessment for me to demonstrate proficiency in the skills honed
        by these lessons. It should be more creative than the exercises, more interesting than drills, but manageable
        for my current skills (Beginner for now). Give the assessment a title, clear directions in its content, and a list
        of requirements to be met, the point total of each. The points of each req will be added to a total for grading
        at a later time."""},
        {'role': 'user', 'content': """Follow this json schema: 
        {
            section: str,
            lessons: [
                {
                    title: str,
                    content: str,
                    order: int
                }
            ],
            assessment: {
                title: str,
                content: str,
                requirements: [
                    {
                        name: str,
                        points: int,
                    }
                ]
            }
        }
        """}
    ]

    prompt = personality + messages

    response = client.chat(
        model,
        messages=prompt, format=LessonPlan.model_json_schema(),
        tools=[get_user_materials],
        think=True, options=options)
    print(response.message.thinking)
    print(response.message.tool_calls)
    # Handle Tool Calls
    info = []
    for call in response.message.tool_calls:
        func = tools.get(call.function.name)
        result = func(**call.function.arguments)
        info.append({'role': 'tool', 'tool_name': call.function.name, 'content': str(result)})

    prompt += info

    informed_response = client.chat(
        model,
        messages=prompt, format=LessonPlan.model_json_schema(),
        tools=[get_user_materials],
        think=True, options=options)

    print(response.message.thinking)

    lesson_plan: LessonPlan = LessonPlan.model_validate_json(informed_response.message.content)
    return lesson_plan
