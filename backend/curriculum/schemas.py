from ninja import Schema
from typing import Optional


class RegisterSchema(Schema):
    username: str
    email: str
    password: str
    skill_level: str = "beginner"
    artistic_goal: str = ""


class UpdateProfileSchema(Schema):
    id: int
    skill_level: str
    artistic_goal: str
    time_commitment: str


class LearningGoalSchema(Schema):
    id: int
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