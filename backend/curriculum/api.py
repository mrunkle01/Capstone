from ninja import NinjaAPI, File, Form
from ninja.files import UploadedFile
from ninja.security import SessionAuth
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from .tasks import generate_dashboard_task, generate_pretest_dashboard_task, grade_user_art
from .models import UserProfile, ConceptLibrary, Section, Assessment, ReportCard, DashBoard, GradeReport
from .schemas import (RegisterSchema, UpdateProfileSchema, LearningGoalSchema,
                      PretestResultSchema, PretestQuestionSchema,PretestQuestionOptionSchema,
                      SectionSchema, LessonSchema, UserLessonSchema, AssessmentSchema,
                      ReportCardSchema, ChatLogSchema, UserInSchema, LogResultsSchema,
                      ProgressSchema, PretestGenerateSchema)




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

@api.post("/auth/login/", response={200: dict, 400: dict, 401: dict})
def user_login(request, data: UserInSchema):

    if not data.password:
        return 400, {"message": "Password is required"}
    # handles either email or user
    user = authenticate(request, username=data.identifier, password=data.password)

    #logs the user in
    if user is not None:
        login(request, user)
        return 200, {"message": "Login successful"}
    else:
        return 401, {"message": "Invalid credentials"}

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
        "has_curriculum": request.user.profile.has_active_curriculum,
        "time_commitment": request.user.profile.time_commitment or "",
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

@api.post("/gradeImage")
def submit_assessment(request, assignment : str, image: UploadedFile = File(...)):
    image_data = image.read()

    # Save report to DB immediately (score/feedback populated after grading completes)
    user_profile = request.user.profile if request.user.is_authenticated else None
    report = GradeReport.objects.create(
        user=user_profile,
        assignment=assignment,
        image=image_data,
    )

    task = grade_user_art.delay(assignment, image_data, report.id)
    request.session["pending_job_id"] = task.id
    return {"job_id" : task.id, "report_id": report.id}

@api.get("/report/{report_id}", response={200: dict, 404: dict})
def get_report(request, report_id: int):
    import base64
    try:
        report = GradeReport.objects.get(id=report_id)
    except GradeReport.DoesNotExist:
        return 404, {"message": "Report not found"}
    image_b64 = base64.b64encode(bytes(report.image)).decode() if report.image else None
    return 200, {
        "id": report.id,
        "score": report.score,
        "feedback": report.feedback,
        "assignment": report.assignment,
        "image": image_b64,
        "created_at": report.created_at.isoformat(),
    }

@api.post("/gradeImage/status/{job_id}")
def check_submit_assessment(request, job_id: str):
    from celery.result import AsyncResult
    task = AsyncResult(job_id)

    if task.state == "PENDING":
        return {"status" : "pending"}
    elif task.state == "SUCCESS":
        return {"status" : "complete", "data" : task.result}
    elif task.state == "FAILURE":
        return {"status": "error", "error": str(task.result)}
    return {"status": task.state}

@api.get("/generate")
def start_generate(request, topic: str, timeCommit: str, skillLevel: str, amount: int = 3):
    task = generate_dashboard_task.delay(topic, timeCommit, skillLevel, amount)
    return {"job_id": task.id}

@api.post("/generate/pretest")
def start_pretest_generate(request, data: PretestGenerateSchema):
    task = generate_pretest_dashboard_task.delay(
        data.pretest_scores.dict(), data.goal, data.time_commitment
    )

    # Update user profile if authenticated
    if request.user.is_authenticated:
        profile = request.user.profile
        profile.artistic_goal = data.goal
        profile.time_commitment = data.time_commitment
        profile.has_completed_pretest = True
        profile.save()

    return {"job_id": task.id}

@api.get("/generate/status/{job_id}")
def check_generate(request, job_id: str):
    from celery.result import AsyncResult
    task = AsyncResult(job_id)

    if task.state == "PENDING":
        return {"status": "pending"}
    elif task.state == "SUCCESS":
        if request.user.is_authenticated:
            # get_or_create keyed on task_id prevents duplicates without relying on sessions
            existing = DashBoard.objects.filter(task_id=job_id).first()
            if not existing:
                last = DashBoard.objects.filter(user=request.user.profile).order_by('-order').first()
                next_order = (last.order + 1) if last else 1
                DashBoard.objects.create(
                    user=request.user.profile,
                    contents=task.result,
                    progress={},
                    order=next_order,
                    task_id=job_id,
                )
        return {"status": "complete", "data": task.result}
    elif task.state == "FAILURE":
        return {"status": "error", "error": str(task.result)}
    return {"status": task.state}

@api.get("/dashboard/progress", response={200: dict, 401: dict})
def get_progress(request):
    """Returns progress for the latest (current) section"""
    if not request.user.is_authenticated:
        return 401, {"message": "Not authenticated"}
    try:
        db = DashBoard.objects.filter(user=request.user.profile).latest("created_at")
        return 200, db.progress or {}
    except DashBoard.DoesNotExist:
        return 200, {}

@api.put("/dashboard/progress/{section_id}", response={200: dict, 401: dict, 404: dict})
def save_progress(request, section_id: int, data: ProgressSchema):
    """Save progress for a specific section by its dashboard row ID"""
    if not request.user.is_authenticated:
        return 401, {"message": "Not authenticated"}
    try:
        db = DashBoard.objects.get(id=section_id, user=request.user.profile)
        db.progress = data.dict()
        db.save()
        return 200, {"success": True}
    except DashBoard.DoesNotExist:
        return 404, {"message": "Section not found"}

@api.get("/dashboard", response={200: dict, 401: dict, 404: dict})
def dashboard(request):
    if not request.user.is_authenticated:
        return 401, {"message": "Not authenticated"}
    sections = DashBoard.objects.filter(user=request.user.profile).order_by('order')
    if not sections.exists():
        return 404, {"message": "No contents"}
    return 200, {
        "sections": [
            {
                "id": s.id,
                "order": s.order,
                "contents": s.contents,
                "progress": s.progress or {},
            }
            for s in sections if s.contents
        ]
    }

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

#this endpoint grabs the results after a user assessment and updates/saves each skill based on different criteria
@api.post("/logResults")
def log_results(request, results : LogResultsSchema):
    if (results.skill1 == 4):
        request.user.profile.skill_level = UserProfile.skill_levels.get(skill=results.skill1)
    request.user.profile.save()
