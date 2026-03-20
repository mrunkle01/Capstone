from ninja import NinjaAPI, File, Form
from ninja.files import UploadedFile
from ninja.security import SessionAuth
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from celery import shared_task
from .atelier_agent import grade_art, generate_lesson_plan
from .models import UserProfile, ConceptLibrary, Section, Assessment, ReportCard
from .schemas import (RegisterSchema, UpdateProfileSchema, LearningGoalSchema,
                      PretestResultSchema, PretestQuestionSchema,PretestQuestionOptionSchema,
                      SectionSchema, LessonSchema, UserLessonSchema, AssessmentSchema,
                      ReportCardSchema, ChatLogSchema, UserInSchema)




import re
import uuid
import threading

api = NinjaAPI()

# In-memory job store for async AI generation
# Keys: job_id (str), Values: {"status": "pending"|"complete"|"error", "result": dict|None, "error": str|None}
jobs = {}

#/api before every call

#add this to each endpoint you only want functional when the user is logged in
@api.get("/protected", auth=SessionAuth())
def protected_view(request):
    return {"user": request.user.username, "message": "You have access"}

@api.get('/')
def home():
    return "App is working"

@api.post("/auth/register")
def register(request, data: RegisterSchema):
    """Create new user with profile"""
    # Create user
    user = User.objects.create_user(
        username=data.username,
        email=data.email,
        password=data.password
    )

    # Update profile (auto-created by signal)
    user.profile.skill_level = data.skill_level
    user.profile.artistic_goal = data.artistic_goal
    user.profile.save()

    return {
        "success": True,
        "user_id": user.id,
        "username": user.username,
        "message": "User created successfully"
    }

@api.post("/auth/login/")
def user_login(request, data: UserInSchema):

    if not data.password:
        return {"message": "Password is required"}, 400
    # handles either email or user
    user = authenticate(request, username=data.identifier, password=data.password)

    #logs the user in
    if user is not None:
        login(request, user)
        return {"message": "Login successful"}
    else:
        return {"message": "Invalid credentials"}, 401

@api.post("/auth/logout/")
def user_logout(request):
    logout(request)
    return {"message": "User logged out"}


@api.get("/profile")
def get_current_profile(request):
    """Get current user's profile"""
    return {
        "username": request.user.username,
        "skill_level": request.user.profile.skill_level,
        "artistic_goal": request.user.profile.artistic_goal,
        "has_curriculum": request.user.profile.has_active_curriculum
    }

@api.put("/profile")
def update_profile(request, data: UpdateProfileSchema):
    """Update user profile"""
    request.user.profile.skill_level = data.skill_level
    request.user.profile.artistic_goal = data.artistic_goal
    request.user.profile.time_commitment = data.time_commitment
    request.user.profile.save()
    return {
        "success": True,
        "message": "User updated successfully"
    }


@api.get("/concepts")
def list_concepts(request, difficulty: str = None):
    """List available concepts, optionally filtered by difficulty"""
    if difficulty:
        concepts = ConceptLibrary.objects.filter(
            difficulty_level=difficulty,
            is_active=True
        )
    else:
        concepts = ConceptLibrary.objects.filter(is_active=True)

    return [
        {
            "name": c.name,
            "category": c.category,
            "difficulty": c.difficulty_level,
            "description": c.description
        }
        for c in concepts
    ]


@api.get("/concepts/{concept_name}")
def get_concept_details(request, concept_name: str):
    """Get detailed information about a specific concept"""
    concept = ConceptLibrary.objects.get(name=concept_name)
    return {
        "name": concept.name,
        "category": concept.category,
        "difficulty": concept.difficulty_level,
        "description": concept.description,
        "prerequisites": concept.prerequisites,
        "learning_objectives": concept.learning_objectives,
        "tips": concept.tips_for_improvement,
        "sample_exercises": concept.sample_exercise_prompts
    }

# @api.post("/assess/{section_id}")
# def submit_assessment(request, section_id: int, assignment: str, image: UploadedFile = File(...)):
#     image_data = image.read()
#
#     from ai.grading_agentv2 import grade_art
#     result = grade_art(assignment, image_data)
#
#     score = int(result.score * 100)
#
#     # Save to DB
#     section = Section.objects.get(id=section_id)
#     assessment = Assessment.objects.create(
#         user=request.user.profile,
#         section=section,
#         prompt="Image grading assessment"
#     )
#     report = ReportCard.objects.create(
#         user=request.user.profile,
#         assessment=assessment,
#         feedback={"raw": result.feedback, "score": score}
#     )
#
#     return {"score": score, "feedback": result.feedback, "report_id": report.id}

@api.post("/imageTest")
def submit_assessment(request, image: UploadedFile = File(...)):
    image_data = image.read()

    assignment = "Draw a basic sketch demonstrating line, shape, and shading."


    result = grade_art(assignment, image_data)


    score = int(result.score * 100)

    return {"score": score, "feedback": result.feedback, "report_id": result.report_id}

#Celery implementation of async task

@shared_task(bind=True)
def generate_dashboard_task(self, topic, timeCommit, skillLevel):
    section = generate_lesson_plan(topic, timeCommit, skillLevel)
    return {
        "Section": section.section,
        "Lessons": [{"title": l.title, "content": l.content, "order": l.order} for l in section.lessons],
        "Assessment": {
            "title": section.assessment.title,
            "content": section.assessment.content,
            "requirements": [{"name": r.name, "points": r.points} for r in section.assessment.requirements]
        }
    }

@api.get("/generate")
def start_generate(request, topic: str, timeCommit: str, skillLevel: str):
    task = generate_dashboard_task.delay(topic, timeCommit, skillLevel)
    return {"job_id": task.id}  # Celery gives you this for free


@api.get("/generate/status/{job_id}")
def check_generate(request, job_id: str):
    from celery.result import AsyncResult
    task = AsyncResult(job_id)

    if task.state == "PENDING":
        return {"status": "pending"}
    elif task.state == "SUCCESS":
        return {"status": "complete", "data": task.result}
    elif task.state == "FAILURE":
        return {"status": "error", "error": str(task.result)}

    return {"status": task.state}

# # Async generate — returns job_id immediately, poll /generate/status/{job_id} for result
# # This avoids Railway's 60s proxy keep-alive timeout
#
# def _run_job(job_id, topic, timeCommit, skillLevel):
#     try:
#         section = generate_lesson_plan(topic, timeCommit, skillLevel)
#         jobs[job_id] = {"status": "complete", "data": {
#             "Section": section.section,
#             "Lessons": [{"title": l.title, "content": l.content, "order": l.order} for l in section.lessons],
#             "Assessment": {"title": section.assessment.title, "content": section.assessment.content,
#                            "requirements": [{"name": r.name, "points": r.points} for r in section.assessment.requirements]}
#         }}
#     except Exception as e:
#         print("Generate job failed:", e)
#         jobs[job_id] = {"status": "error", "error": str(e)}

# @api.get("/generate")
# def start_generate(request, topic: str, timeCommit: str, skillLevel: str):
#     job_id = str(uuid.uuid4())
#     jobs[job_id] = {"status": "pending"}
#     threading.Thread(target=_run_job, args=(job_id, topic, timeCommit, skillLevel)).start()
#     return {"job_id": job_id}
#
# @api.get("/generate/status/{job_id}")
# def check_generate(request, job_id: str):
#     job = jobs.get(job_id)
#     if not job:
#         return api.create_response(request, {"error": "Job not found"}, status=404)
#     return job

# Original synchronous endpoint (works locally, times out on Railway)
# @api.get("/generate")
# def generate_dashboard(request, topic : str, timeCommit : str, skillLevel: str):
#     section = generate_lesson_plan(topic, timeCommit, skillLevel)
#     request.user.profile.time_commitment = timeCommit
#     request.user.profile.skill_level = skillLevel
#     request.user.profile.artistic_goal = topic
#     request.user.profile.save()
#     sectionJSON = { "Section" : section.section,
#                 "Lessons" : [{"title" : lesson.title, "content" : lesson.content,
#                               "order" : lesson.order} for lesson in section.lessons],
#                "Assessment" : {"title" : section.assessment.title, "content" : section.assessment.content,
#                                "requirements" : [{"name" : requirement.name, "points" : requirement.points}
#                                                  for requirement in section.assessment.requirements]}
#                }
#     return sectionJSON

#TODO
#make /generate save the dashboard object that is created into the database for the current user, then
#create a /dashboard endpoint that fetches the relevant object from the database

#design get request endpoint to allow AI to grab user skill for purposes of modifying lesson plan
@api.get("/skill")
def get_skill(request):
    return request.user.profile.skill_level

#design a put request endpoint to allow the AI to update the user skill level after the  modifying lesson plan
@api.put("/skill")
def update_skill(request, skillLevel: str):
    request.user.profile.skill_level = skillLevel
    request.user.profile.save()

#make an endpoint that receives topic, time commitment, skill level, anything that gets saved to profile
@api.put("/userInfo")
def update_user_info(request, userInfo: UpdateProfileSchema):
    request.user.profile.time_commitment = userInfo.time_commitment
    request.user.profile.skill_level = userInfo.skill_level
    request.user.profile.artistic_goal = userInfo.artistic_goal
    request.user.profile.save()
