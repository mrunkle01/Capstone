import base64
import os
import hashlib
import ollama
from pydantic_core import ValidationError
from dotenv import load_dotenv
from pydantic import BaseModel
from ollama import Client, WebSearchResponse, WebFetchResponse, ChatResponse
import chromadb
import datetime

script_dir = os.path.dirname(os.path.abspath(__file__))
personality_path = os.path.join(script_dir, "personality.txt")
lesson_plan_path = os.path.join(script_dir, "lesson_plan_instructions.txt")
art_grading_path = os.path.join(script_dir, "art_grading_instructions.txt")

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
            lesson_string += lessons.to_string() + "\n"
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

    def to_string(self) -> str:
        return ("Intro:\n" + self.intro + "\n" + "Strengths:\n" + self.strengths + "\n" +
                "Weaknesses:\n" + self.weaknesses + "\n" + "Critique:\n" + self.critique + "\n" +
                "Conclusion:\n" + self.conclusion)


class Grade(BaseModel):
    score: float
    requirements: list[Requirement]
    feedback: Feedback
    report_id: str

    def to_string(self) -> str:
        req_string = ""
        for req in self.requirements:
            req_string += req.to_string() + '\n'
        return ("Score: " + str(self.score) + "\n" + self.feedback.to_string() + "\n" +
                req_string + '\n' + self.report_id)


class AtelierClient:
    # One instance per user_id so users don't share message history or block each other.
    # Celery workers are long-lived processes, so these persist for the duration of the worker.
    _instances: dict = {}

    def __new__(cls, user_id_ref: str):
        if user_id_ref not in cls._instances:
            cls._instances[user_id_ref] = super(AtelierClient, cls).__new__(cls)
        return cls._instances[user_id_ref]

    def __init__(self, user_id: str):
        # Guard prevents re-initialization on subsequent calls to AtelierClient(user_id)
        # for an already-cached instance (Python always calls __init__ even when __new__
        # returns an existing object).
        if hasattr(self, '_initialized'):
            return
        self._initialized = True
        self._last_action = None  # set by action tools, read by async_chat

        load_dotenv()
        self.__client = Client(
            host="https://ollama.com",
            headers={'Authorization': 'Bearer ' + os.environ.get('OLLAMA_API_KEY')}
        )
        self.__id_ref = user_id
        self.memory = AgentMemory(self.__id_ref)

        # Action tools let the LLM signal structured intents (LESSON_SWAP, TIME_CHANGE)
        # without regex. The LLM calls these when it understands the user wants an action.
        self.__tool_lookup = {
            'web_search': self.__client.web_search,
            'store_memory': self.memory.store_memory,
            'retrieve_memory': self.memory.retrieve_memory,
            'append_instr_file': self.__append_instr_file,
            'request_lesson_swap': self.request_lesson_swap,
            'request_time_change': self.request_time_change,
        }
        self.__tools = [
            self.memory.store_memory,
            self.memory.retrieve_memory,
            self.__client.web_search,
            self.__append_instr_file,
            self.request_lesson_swap,
            self.request_time_change,
        ]

        with open(personality_path, 'r') as file:
            pers_data = file.read()
        file.close()
        self.__personality = {'role': 'system', 'content': pers_data}
        self.__messages = []
        self.__messages.append(self.__personality)
        self.__messages.append({'role': 'system', 'content': f"The user's username is {user_id}"})
        self.__initialize_context(["Art Interests", "Goals", "Favorite Art", "Career", user_id])
        self.__options = {'temperature': 0.8}
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
                    self.__messages.append({'role': 'tool', 'content': str(result)[:2000 * 4],
                                            'tool_name': tool_call.function.name})
            return True
        else:
            return False

    def __generate(self, model: str, instr, form, use_tools: bool = True) -> ChatResponse:
        self.__messages.append(instr)

        if use_tools:
            final_res = self.__client.chat(model=model, messages=self.__messages, tools=self.__tools,
                                           format=form, options=self.__options)
            if self.__exec_tools(final_res):
                final_res = self.__client.chat(model=model, messages=self.__messages, format=form,
                                               options=self.__options)
        else:
            # Append a one-shot override (not persisted to self.__messages) so the model
            # doesn't try to emit tool calls as text when tools are disabled.
            messages = self.__messages + [{
                'role': 'system',
                'content': 'Respond ONLY with valid JSON matching the provided schema. Do not call any tools, perform web searches, or include any text outside the JSON object.'
            }]
            final_res = self.__client.chat(model=model, messages=messages, tools=[],
                                           format=form, options=self.__options)

        if final_res.message.content:
            self.update_context(final_res.message.content)
            print(final_res.message.content)

        self.__summarize_interaction()
        return final_res

    def __summarize_interaction(self):
        if self.__conv_turns < self.__mem_freq:
            self.__conv_turns += 1
            return
        self.__messages.append({'role': 'user', 'content': f"Summarize the conversation thus far."}) # Feed only the last few messages
        print("Saving summary...")
        res = self.__client.chat(
            model='qwen3.5:397b-cloud',
            messages=self.__messages,
            options=self.__options
        )
        print("Summary\n")
        print(res.message.content)
        self.memory.store_memory([res.message.content], {"type": "conversation_summary"})
        self.__conv_turns = 0

    def request_lesson_swap(self) -> str:
        """
        Call this when the user wants a different version of their current lesson —
        including when they say it is too easy, repetitive, or want a fresh approach.
        The actual swap is handled by backend business logic after this tool fires.
        """
        self._last_action = {"action": "LESSON_SWAP"}
        return "Lesson swap request registered. Tell the user you are arranging a new version of their lesson."

    def request_time_change(self, time_value: str) -> str:
        """
        Call this when the user wants to change their daily practice time.
        Parse the user's intended time and pass one of these exact strings:
        '15-30 min/day', '1 hour/day', '2+ hours/day'.
        """
        self._last_action = {"action": "TIME_CHANGE", "time_value": time_value}
        return f"Time change to {time_value} registered. Tell the user you will confirm the change."

    async def async_chat(self, prompt: str) -> dict:
        """
        Runs a conversational turn and returns both the reply text and any structured
        action the LLM decided to trigger (via request_lesson_swap / request_time_change).
        Returns: { "reply": str, "action": dict | None }
        """
        model = 'qwen3.5:397b-cloud'
        self._last_action = None  # reset so stale actions from previous turns don't leak

        self.__messages.append({'role': 'user', 'content': prompt})
        final_res = self.__client.chat(model=model, messages=self.__messages, tools=self.__tools,
                                       options=self.__options)

        if self.__exec_tools(final_res):
            final_res = self.__client.chat(model=model, messages=self.__messages, options=self.__options)

        if final_res.message.content:
            self.update_context(final_res.message.content)

        self.__summarize_interaction()
        return {"reply": final_res.message.content, "action": self._last_action}

    def update_context(self, context: str):
        self.__messages.append({'role': 'assistant', 'content': context})

    def __fetch_user_info(self, url) -> WebFetchResponse:
        return self.__client.web_fetch(url)

    def __initialize_context(self, queries: list[str], par: list[dict] = None):
        results = self.memory.retrieve_memory(queries, par)
        self.__messages.append({'role': 'system', 'content': str(results)})

    def __append_instr_file(self, instr: str):
        """
        instr: string to append to instructions file
        """
        with open(personality_path, "a") as file:
            file.write(instr)

    def grade_art(self, assignment: str, img: bytes) -> Grade:
        # model = 'qwen3-vl:235b-cloud'
        model = 'qwen3.5:397b-cloud'
        self.__initialize_context([assignment], [{"type": "assessment"}])

        img_final = base64.b64encode(img).decode()

        with open(art_grading_path, 'r') as file:
            file_data = file.read()
        file_data = file_data.replace('{assignment}', assignment)
        file_data = file_data.replace('{ref_note}', '')

        instructions = {'role': 'user', 'content': file_data, 'images': [img_final]}

        last_error = None
        for attempt in range(3):
            try:
                response = self.__generate(model, instructions, Grade.model_json_schema(), use_tools=False)
                return Grade.model_validate_json(response.message.content)
            except Exception as e:
                last_error = e
                print(f"grade_art attempt {attempt + 1} failed: {e}")
        raise last_error

    def grade_art_with_ref(self, assignment: str, img: bytes, ref: bytes):
        # model = 'qwen3-vl:235b-cloud'
        model = 'qwen3.5:397b-cloud'
        self.__initialize_context([assignment], [{"type": "assessment"}])

        img_final = base64.b64encode(img).decode()
        ref_final = base64.b64encode(ref).decode()

        with open(art_grading_path, 'r') as file:
            file_data = file.read()
        file_data = file_data.replace('{assignment}', assignment)
        file_data = file_data.replace(
            '{ref_note}',
            'The FIRST image is the student\'s drawing to be graded. The SECOND image is the reference image provided for comparison. Grade only the first image.'
        )

        instructions = {'role': 'user', 'content': file_data, 'images': [img_final, ref_final]}

        last_error = None
        for attempt in range(3):
            try:
                response = self.__generate(model, instructions, Grade.model_json_schema(), use_tools=False)
                return Grade.model_validate_json(response.message.content)
            except Exception as e:
                last_error = e
                print(f"grade_art_with_ref attempt {attempt + 1} failed: {e}")
        raise last_error

    def generate_lesson_plan(self, topic: str, time_commit: str, skill: str, amount: int = 5) -> LessonPlan:
        model = 'qwen3.5:397b-cloud'
        self.__initialize_context(["User Skill"], [{"skill": topic}])
        self.__initialize_context(["What is the user's goals?"], [{"type": "goal"}])

        with open(lesson_plan_path, 'r') as file:
            file_data = file.read()
        file_data = file_data.replace('{topic}', topic)
        file_data = file_data.replace('{time_commit}', time_commit)
        file_data = file_data.replace('{skill}', skill)
        file_data = file_data.replace('{amount}', str(amount))

        instructions = {'role': 'user', 'content': file_data}
        response = self.__generate(model, instructions, LessonPlan.model_json_schema(), use_tools=False)
        lesson_plan: LessonPlan = LessonPlan.model_validate_json(response.message.content)
        # self.memory.store_memory([lesson_plan.to_string()], {"type": "lesson_plan"})
        # Verify lesson time and assessment points

        return lesson_plan

    def generate_lesson(self, topic: str, time_commit: str, skill: str):
        model = 'qwen3.5:397b-cloud'
        # self.__initialize_context([
        #     {
        #         "query": f"{self.__id_ref}'s skill in {topic}",
        #         "metadata": [{"skill": topic}]
        #     }
        # ])
        # self.__initialize_context([
        #     {
        #         "query": f"What is {self.__id_ref}'s goals?",
        #         "metadata": [{"type": "goal"}]
        #     }
        # ])

        with open(lesson_plan_path, 'r') as file:
            file_data = file.read()
        file_data = file_data.replace('{topic}', topic)
        file_data = file_data.replace('{time_commit}', time_commit)
        file_data = file_data.replace('{skill}', skill)

        instructions = {'role': 'user', 'content': file_data}

        last_error = None
        for attempt in range(3):
            response = self.__generate(model, instructions, LessonPlan.model_json_schema(), use_tools=False)
            try:
                plan = LessonPlan.model_validate_json(response.message.content)
                return plan.lessons[0]
            except (ValidationError, IndexError) as e:
                last_error = e
                print(f"generate_lesson attempt {attempt + 1} failed: {e}")
        raise last_error


class AgentMemory:
    def __init__(self, user: str, directory="./agent_memory"):
        # database creation should be separate from memory, only get database connection
        self.__client = chromadb.PersistentClient(path=directory)
        self.__user_id = user
        self.__collection = self.__client.get_or_create_collection(
            name="agent_memories",
            metadata={"hnsw:space": "cosine"}
        )

    def __generate_id(self, text: str) -> str:
        return hashlib.md5(text.encode()).hexdigest()

    def store_memory(self, texts: list[str], metadata: dict = None) -> str:
        """Store a piece of information in long_term memory
        Args:
            texts: List of text representing memories to store
            metadata: Dictionary of metadata associated with the batch of memory entries
        """
        # handle single string
        # list of metadata associated with texts in same index
        metadata_list = []
        for t in texts:
            def_dict = {"user_id": self.__user_id}
            if metadata:
                for key, value in metadata.items():
                    def_dict[key] = value
            metadata_list.append(def_dict)

        embeddings = ollama.embed(
            model='mxbai-embed-large:latest',
            input=texts
        )

        doc_ids = []
        for t in texts:
            doc_ids.append(self.__generate_id(t))

        self.__collection.add(
            embeddings=embeddings['embeddings'],
            documents=texts,
            metadatas=metadata_list,
            ids=doc_ids
        )

        print(f"Pikaso remembered: {texts}...")
        return f"Remembered {texts}"

    def retrieve_memory(self, queries: list[str], par: list[dict] = None, n_results: int = 20) -> str:
        """Retrieve the n most relevant memories for a query
        Args:
            queries: List of strings list[str] to embed and use to search memory database
            par: List of metadata to filter search results by (query must meet all criteria.) Optional parameter.
            n_results: Amount of results to retrieve from memory

        Returns:
            A string containing results retrieved from memory
        """

        # Error with par = {}
        # Check valid filter
        q_filter = {"user_id": self.__user_id}
        if par:
            q_filter = {"$and": [{"user_id": self.__user_id}]}
            for p in par:
                q_filter["$and"].append(p)

        print(q_filter)

        embeddings = ollama.embed(
            model='mxbai-embed-large:latest',
            input=queries
        )

        results = self.__collection.query(
            query_embeddings=embeddings['embeddings'],
            n_results=n_results,
            where=q_filter,
            include=["documents", "metadatas"]
        )

        memories = ""
        if results['documents']:
            for doc in results['documents'][0]:
                memories += doc + " ."

        print(f"Pikaso recalled: {memories}...")

        return memories
