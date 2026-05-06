import base64
import os
import hashlib
import ollama
from pydantic_core import ValidationError
from dotenv import load_dotenv
from pydantic import BaseModel
from ollama import Client, WebFetchResponse, ChatResponse, ResponseError
import chromadb
import datetime


class LessonContent(BaseModel):
    time: int
    skill: str
    directions: str
    exercises: list[str]

    def to_string(self):
        exercises_string = ""
        for exercise in self.exercises:
            exercises_string += exercise + "\n"
        return ("Time: " + str(self.time) + "\n" + "Skill: " + self.skill + "\n" +
                "Directions: " + self.directions + "\n" + exercises_string)


class Lesson(BaseModel):
    title: str
    content: LessonContent
    order: int

    def to_string(self):
        return self.title + "\n" + self.content.to_string() + "\n" + str(self.order)


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
            req_string += req.to_string() + '\n'
        return self.title + "\n" + self.content + '\n' + req_string


class Resource(BaseModel):
    title: str
    url: str
    source: str

    def to_string(self):
        return self.title + " | " + self.source + " | " + self.url


class LessonPlan(BaseModel):
    section: str
    lessons: list[Lesson]
    assessment: Assessment
    resources: list[Resource]

    def to_string(self):
        lesson_string = ""
        for lessons in self.lessons:
            lesson_string += lessons.to_string() + "\n\n"
        resources_string = ""
        for resource in self.resources:
            resources_string += resource.to_string() + "\n"
        return (self.section + "\n" + lesson_string + "\n" +
                self.assessment.to_string() + "\n" + resources_string)


class Feedback(BaseModel):
    intro: str
    strengths: str
    weaknesses: str
    critique: str
    conclusion: str

    # For debugging, not formatted correctly
    def to_string(self) -> str:
        return ("Intro:\n" + self.intro + "\n" + "Strengths:\n" + self.strengths + "\n" +
                "Weaknesses:\n" + self.weaknesses + "\n" + "Critique:\n" + self.critique + "\n" + "Conclusion:\n" +
                self.conclusion)


class Grade(BaseModel):
    score: float
    requirements: list[Requirement]
    feedback: Feedback
    report_id: str

    def to_string(self) -> str:
        req_string = ""
        for req in self.requirements:
            req_string += req.to_string() + '\n'
        return ("Score: " + str(self.score) + "\n" + self.feedback.to_string() + "\n" + req_string + '\n' +
                self.report_id)


class Memory(BaseModel):
    text: str
    metadata: list[str]


class NoResponseError(Exception):
    """
    Exception raised when there is no response returned from agent
    """
    def __init__(self, message):
        super().__init__(message)

    def __str__(self):
        return f"{self.message})"


def get_current_date() -> str:
    """
    Get current date and time
    :return: the current date and time
    """
    return str(datetime.datetime.now())


class AtelierClient:
    def __new__(cls, user_id_ref: str):
        if not hasattr(cls, '__inst'):
            cls.inst = super(AtelierClient, cls).__new__(cls)
        return cls.inst

    def __init__(self, user_id: str):
        # Create client
        load_dotenv()
        self.__client = Client(
            host="https://ollama.com",
            headers={'Authorization': 'Bearer ' + os.environ.get('OLLAMA_API_KEY')}
        )
        self.__id_ref = user_id
        self.memory = AgentMemory(self.__id_ref)
        # Establish AI properties
        self.__tool_lookup = {'web_search': self.__client.web_search, 'store_memory': self.memory.store_memory,
                              'retrieve_memory': self.memory.retrieve_memory,
                              'get_current_date': get_current_date,
                              'append_instr_file': self.__append_instr_file}
        self.__tools = [self.memory.store_memory, self.memory.retrieve_memory, self.__client.web_search,
                        self.__append_instr_file, get_current_date]
        with open('personality.txt', 'r') as file:
            pers_data = file.read()
        file.close()
        self.__personality = {'role': 'system', 'content': pers_data}
        self.__messages = []
        self.__messages.append(self.__personality)
        self.__messages.append({'role': 'system', 'content': f"The user's username is {user_id}"}) # Replace with user info fetch
        self.__options = {
            'temperature': 0.8,
        }
        self.__conv_turns = 0
        self.__mem_freq = 5

    def __del__(self):
        # self.__summarize_interaction()
        print("Closing Client")

    def __exec_tools(self, res: ChatResponse) -> bool:
        if res.message.tool_calls:
            print("Tool Calls: ", res.message.tool_calls)
            for tool_call in res.message.tool_calls:
                func = self.__tool_lookup.get(tool_call.function.name)
                if func:
                    args = tool_call.function.arguments
                    result = func(**args)
                    print('Result: ', str(result)[:200]+'...')
                    self.__messages.append({'role': 'tool', 'content': str(result)[:2000 * 4] + " " +
                                            get_current_date(), 'tool_name': tool_call.function.name})
            return True
        else:
            return False

    def __generate(self, model: str, instr, form) -> ChatResponse:
        try:
            self.__messages.append(instr)
            final_res = self.__client.chat(model=model, messages=self.__messages, tools=self.__tools, format=form,
                                 think=True, options=self.__options)
            print(final_res.message.thinking)
            if self.__exec_tools(final_res):
                final_res = self.__client.chat(model=model, messages=self.__messages, format=form, think=True,
                                              options=self.__options)
            print(final_res.message.thinking)

            if final_res.message.content:
                self.update_context(final_res.message.content)
                print(final_res.message.content)

            self.__summarize_interaction()
            return final_res
        except ResponseError as e:
            print("Response Error")

    def __summarize_interaction(self):
        if self.__conv_turns < self.__mem_freq:
            self.__conv_turns += 1
            return
        self.__messages.append({'role': 'user', 'content': f"Summarize the conversation thus far."})
        # Clear messages after initial system prompt and replace it with summary
        print("Saving summary...")
        res = self.__client.chat(
            model='kimi-k2.6:cloud',
            messages=self.__messages,
            options=self.__options
        )
        print("Summary\n")
        print(res.message.content)
        self.memory.store_memory([{'text': res.message.content, 'metadata': {"type": "conversation_summary"}}])
        self.__conv_turns = 0

    async def async_chat(self, prompt: str):
        model = 'kimi-k2.6:cloud'
        self.__messages.append({'role': 'user', 'content': prompt})
        final_res = self.__client.chat(model=model, messages=self.__messages, tools=self.__tools,
                                       think=True, options=self.__options)
        print(final_res.message.thinking)
        if self.__exec_tools(final_res):
            final_res = self.__client.chat(model=model, messages=self.__messages, think=True, options=self.__options)
        print(final_res.message.thinking)
        if final_res.message.content:
            self.update_context(final_res.message.content)

        self.__summarize_interaction()
        return final_res

    def update_context(self, context: str):
        self.__messages.append({'role': 'assistant', 'content': context})

    def __initialize_context(self, queries: list[dict], amount: int = 5):
        results = self.memory.retrieve_memory(queries, amount)
        self.__messages.append({'role': 'system', 'content': str(results)})

    def __append_instr_file(self, instr: str):
        """
        instr: string to append to instructions file
        """
        with open("additional_instructions.txt", "a") as file:
            file.write(instr)

    def grade_art(self, assignment: str, img: bytes, ref: bytes = None, skill: str = "") -> Grade:
        # model = 'qwen3-vl:235b-cloud'
        model = 'kimi-k2.6:cloud'

        self.__initialize_context([
            {
                "query": assignment,
                "metadata": [{"type": "assessment"}, {"skill": skill}]
            }
        ])

        img_final = base64.b64encode(img).decode()
        ref_final = ref

        with open('art_grading_instructions.txt', 'r') as file:
            file_data = file.read()
        file_data = file_data.replace('{assignment}', assignment)

        instructions = {}
        if ref_final:
            ref_final = base64.b64encode(ref).decode()
            instructions = {'role': 'user', 'content': file_data, 'images': [img_final, ref_final]}
        else:
            instructions = {'role': 'user', 'content': file_data, 'images': [img_final]}
        response = self.__generate(model, instructions, Grade.model_json_schema())
        # No response error
        try:
            grade: Grade = Grade.model_validate_json(response.message.content)
            self.memory.store_memory([{"text": f"Assignment:\n {assignment} \n Grade:\n {grade.to_string()}",
                                       "metadata": {"type": "assessment", "skill": skill}}])
            return grade
        except ValidationError as e:
            print(e)

    def generate_lesson_plan(self, topic: str, time_commit: str, skill: str, amount: int = 5) -> LessonPlan:
        model = 'kimi-k2.6:cloud'
        self.__initialize_context([
            {
                "query": f"{self.__id_ref}'s skill in {topic}",
                "metadata": [{"skill": topic}]
            }
        ])
        self.__initialize_context([
            {
                "query": f"What is {self.__id_ref}'s goals?",
                "metadata": [{"type": "goal"}]
            }
        ])

        with open('lesson_plan_instructions.txt', 'r') as file:
            file_data = file.read()
        file_data = file_data.replace('{topic}', topic)
        file_data = file_data.replace('{time_commit}', time_commit)
        file_data = file_data.replace('{skill}', skill)
        file_data = file_data.replace('{amount}', str(amount))

        instructions = {'role': 'user', 'content': file_data}
        response = self.__generate(model, instructions, LessonPlan.model_json_schema())
        try:
            lesson_plan: LessonPlan = LessonPlan.model_validate_json(response.message.content)
            self.memory.store_memory([{"text": lesson_plan.to_string(), "metadata": {"type": "lesson_plan",
                                                                                     "skill": topic}}])
            # Verify lesson time and assessment points
            return lesson_plan
        except ValidationError as e:
            print(e)

    def generate_lesson(self, topic: str, time_commit: str, skill: str) -> Lesson:
        model = 'kimi-k2.6:cloud'
        self.__initialize_context([
            {
                "query": f"{self.__id_ref}'s skill in {topic}",
                "metadata": [{"skill": topic}]
            }
        ])
        self.__initialize_context([
            {
                "query": f"What is {self.__id_ref}'s goals?",
                "metadata": [{"type": "goal"}]
            }
        ])

        with open('lesson_plan_instructions.txt', 'r') as file:
            file_data = file.read()
        file_data = file_data.replace('{topic}', topic)
        file_data = file_data.replace('{time_commit}', time_commit)
        file_data = file_data.replace('{skill}', skill)

        instructions = {'role': 'user', 'content': file_data}
        response = self.__generate(model, instructions, Lesson.model_json_schema())
        try:
            lesson: Lesson = Lesson.model_validate_json(response.message.content)
            self.memory.store_memory([{"text": lesson.to_string(), "metadata": {"type": "lesson", "skill": topic}}])
            return lesson
        except ValidationError as e:
            print(e)

    def modify_lesson(self, lesson: str, mod: str) -> Lesson:
        model = 'kimi-k2.6:cloud'
        instr = {"role": "user", "content": f"Can you modify this lesson \n{lesson}\n based on this suggestion: {mod}."
                                            f"And make sure you remember that you did."}
        response = self.__generate(model, instr, Lesson.model_json_schema())
        try:
            lesson: Lesson = Lesson.model_validate_json(response.message.content)
            return lesson
        except ValidationError as e:
            print(e)


class AgentMemory:
    def __init__(self, user: str, directory="./agent_memory"):
        # database creation should be separate from memory, only get database connection
        self.__client = chromadb.HttpClient(host='localhost', port=8000)
        self.__user_id = user
        self.__collection = self.__client.get_or_create_collection(
            name="agent_memories",
            metadata={"hnsw:space": "cosine"}
        )

    def __generate_id(self, text: str) -> str:
        return hashlib.md5(text.encode()).hexdigest()

    def store_memory(self, memories: list[dict]) -> str:
        """Store a piece of information in long_term memory
        Args:
            memories: List of dictionaries representing memories to store in the format:
             [
                {
                    text: "thinknot likes pizza",
                    metadata: {"type": "user_preference", "topic": "food"}
                },
                {
                    text: "thinknot no longer likes pizza"
                    metadata: {"type": "user_preference", "topic": "food"}
                },
            ]
        :returns
            Text confirmation of memories stored
        """
        # Find some way to validate memory

        texts = ""
        date = get_current_date()
        for mem in memories:
            mem['metadata']['user_id'] = self.__user_id
            mem['metadata']['datetime'] = date
            embeddings = ollama.embed(
                model='mxbai-embed-large:latest',
                input=mem['text']
            )
            self.__collection.add(
                embeddings=embeddings['embeddings'],
                documents=mem["text"],
                metadatas=mem['metadata'],
                ids=self.__generate_id(mem['text'])
            )
            texts += mem['text'] + " " + str(date) + " "

        print(f"Pikaso remembered: {texts}...")
        return f"Remembered {texts}"

    def retrieve_memory(self, queries: list[dict], n_results: int = 5) -> str:
        """Retrieve the n most relevant memories for a set of queries
        Args:
            queries: List of dictionaries representing memories to retrieve in the format:
             [
                {
                    query: "Does thinknot like pizza?",
                    metadata: [{"type": "user_preference"}, {"topic": "food"}]
                }
            ]
            n_results: Amount of results to retrieve from memory for each query

        Returns:
            A string containing results retrieved from memory
        """

        memories = ""
        for q in queries:
            print(q)
            # if q.get('query) == None throw error
            embeddings = ollama.embed(
                model='mxbai-embed-large:latest',
                input=q['query']
            )
            q_filter = {'user_id': self.__user_id}
            if q.get("metadata"):
                q_filter = {"$and": [{'user_id': self.__user_id}]}
                for data in q['metadata']:
                    q_filter["$and"].append(data)
            result = self.__collection.query(
                query_embeddings=embeddings['embeddings'],
                n_results=n_results,
                where=q_filter,
                include=['documents', 'metadatas']
            )
            if result['documents']:
                for i in range(len(result['documents'][0])):
                    memories += f"{result['documents'][0][i]} {str(result['metadatas'][0][i])}..."
            if memories == "":
                memories = "Nothing recalled"

        # Remove duplicates

        print(f"Pikaso recalled: {memories}")

        return memories

