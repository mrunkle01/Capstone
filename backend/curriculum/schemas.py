from ninja import Schema
from typing import Optional

class UserInSchema(Schema):
    identifier : str
    password: Optional[str] = None

class RegisterSchema(Schema):
    username: str
    email: str
    password: str
    skill_level: str = "beginner"
    artistic_goal: str = ""


class UpdateProfileSchema(Schema):
    skill_level: str
    artistic_goal: str
    time_commitment: str


class LearningGoalSchema(Schema):
    name: str


class PretestQuestionOptionSchema(Schema):
    id: int
    option_text: str


class PretestQuestionSchema(Schema):
    id: int
    question_text: str
    question_type: str
    options: list[PretestQuestionOptionSchema] = []


class PretestResultSchema(Schema):
    question_id: int
    answer: str


class SectionSchema(Schema):
    id: int
    order: int
    status: str


class LessonSchema(Schema):
    id: int
    title: str
    content: str
    image_url: str
    order: int


class UserLessonSchema(Schema):
    lesson_id: int
    status: str


class AssessmentSchema(Schema):
    id: int
    section_id: int
    prompt: str


class ReportCardSchema(Schema):
    assessment_id: int
    feedback: dict
    created_at: str


class ChatLogSchema(Schema):
    id: int
    context: str
    action: str
    change_made: str
    created_at: str


class LogResultsSchema(Schema):
    linework : float
    form : float
    perspective : float
    anatomy: float
    shading: float
    composition: float
    value: float

class ProgressSchema(Schema):
    completedLessons: int = 0
    assessmentReportId: Optional[int] = None
    assessmentScore: Optional[int] = None


class PretestScoresSchema(Schema):
    gesture: dict
    lifeDrawing: dict
    stillLife: dict
    thumbnail: dict


class PretestGenerateSchema(Schema):
    pretest_scores: PretestScoresSchema
    goal: str
    time_commitment: str
