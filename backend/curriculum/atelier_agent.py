import base64
import os
from pydantic_core import ValidationError
from dotenv import load_dotenv
from pydantic import BaseModel
from ollama import Client, WebSearchResponse, WebFetchResponse, ChatResponse

script_dir = os.path.dirname(os.path.abspath(__file__))
personality_path = os.path.join(script_dir, "personality.txt")
lesson_plan_path = os.path.join(script_dir, "lesson_plan_instructions.txt")
art_grading_path = os.path.join(script_dir, "art_grading_instructions.txt")

class LessonContent(BaseModel):
    time: int
    skill: str  # Enum maybe?
    directions: str
    exercises: list[str]  # Exercise their own object maybe


class Lesson(BaseModel):
    title: str
    content: LessonContent
    order: int


class Requirement(BaseModel):
    name: str
    r_id: str
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


class Resource(BaseModel):
    title: str
    url: str
    source: str


class LessonPlan(BaseModel):
    section: str
    lessons: list[Lesson]
    assessment: Assessment
    resources: list[Resource]


class Grade(BaseModel):
    score: float
    requirements: list[Requirement]
    feedback: str
    report_id: str


class AtelierClient:
    def __new__(cls):
        if not hasattr(cls, '__inst'):
            cls.inst = super(AtelierClient, cls).__new__(cls)
        return cls.inst

    def __init__(self):
        # Create client
        load_dotenv()
        self.__client = Client(
            host="https://ollama.com",
            headers={'Authorization': 'Bearer ' + os.environ.get('OLLAMA_API_KEY')}
        )
        # Establish AI properties
        self.__available_tools = {'web_search': self.__client.web_search}
        self.__tools = [self.__client.web_search]
        with open(personality_path, 'r') as file:
            pers_data = file.read()
        print(pers_data)
        self.__personality = {'role': 'system', 'content': pers_data}
        self.__messages = []
        self.__messages.append(self.__personality)
        self.__options = {
            'temperature': 0.8
        }

    def __generate(self, model: str, instr, form) -> ChatResponse:
        self.__messages.append(instr)

        print("Initial Response\n")
        res = self.__client.chat(model=model, messages=self.__messages, tools=self.__tools,
                                 think=True, options=self.__options)

        if res.message.tool_calls:
            print("Tool Calls: ", res.message.tool_calls)
            for tool_call in res.message.tool_calls:
                func = self.__available_tools.get(tool_call.function.name)
                if func:
                    args = tool_call.function.arguments
                    result = func(**args)
                    print('Result: ', str(result)[:200]+'...')
                    self.__messages.append({'role': 'tool', 'content': str(result)[:2000 * 4],
                                            'tool_name': tool_call.function.name})

        print("Informed Response\n")

        informed_res = self.__client.chat(model=model, messages=self.__messages, format=form,
                                          think=False, options=self.__options)
        print(informed_res.message.thinking)
        print(informed_res.message.content)
        return informed_res

    def __fetch_user_info(self, url) -> WebFetchResponse:
        return self.__client.web_fetch(url)

    def grade_art(self, assignment: str, img: bytes) -> Grade:
        # model = 'qwen3-vl:235b-cloud'
        model = 'qwen3.5:397b-cloud'

        img_final = base64.b64encode(img).decode()

        with open(art_grading_path, 'r') as file:
            file_data = file.read()

        file_data = file_data.replace('{assignment}', assignment)

        print(file_data)

        instructions = {'role': 'user', 'content': file_data, 'images': [img_final]}

        response = self.__generate(model, instructions, Grade.model_json_schema())

        grade: Grade = Grade.model_validate_json(response.message.content)

        return grade

    def generate_lesson_plan(self, topic: str, time_commit: str, skill: str, amount: int = 5) -> LessonPlan:
        model = 'qwen3.5:397b-cloud'

        with open(lesson_plan_path, 'r') as file:
            file_data = file.read()

        file_data = file_data.replace('{topic}', topic)
        file_data = file_data.replace('{time_commit}', time_commit)
        file_data = file_data.replace('{skill}', skill)
        file_data = file_data.replace('{amount}', str(amount))

        print(file_data)

        instructions = {'role': 'user', 'content': file_data}

        response = self.__generate(model, instructions, LessonPlan.model_json_schema())

        lesson_plan: LessonPlan = LessonPlan.model_validate_json(response.message.content)

        # Verify lesson time and assessment points

        return lesson_plan


