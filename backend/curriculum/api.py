from ninja import NinjaAPI, File, Form
from ninja.files import UploadedFile
from ninja.security import SessionAuth
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from .atelier_agent import grade_art, generate_lesson_plan
from .models import UserProfile, ConceptLibrary, Section, Assessment, ReportCard
from .schemas import (RegisterSchema, UpdateProfileSchema, LearningGoalSchema,
                      PretestResultSchema, PretestQuestionSchema,PretestQuestionOptionSchema,
                      SectionSchema, LessonSchema, UserLessonSchema, AssessmentSchema,
                      ReportCardSchema, ChatLogSchema, UserInSchema)




import re

api = NinjaAPI()

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


@api.get("/profile")
def get_current_profile(request):
    """Get current user's profile"""
    return {
        "username": request.user.username,
        "skill_level": request.user.profile.skill_level,
        "artistic_goal": request.user.profile.artistic_goal,
        "has_curriculum": request.user.profile.has_active_curriculum
    }

@api.get("/profile/all")
def get_all_profiles(request):
    """Get all user profiles"""
    return [
        {
            "username": u.user.username,
            "skill_level": u.skill_level,
            "artistic_goal": u.artistic_goal,
            "has_curriculum": u.has_active_curriculum
        }
        for u in UserProfile.objects.all()
    ]

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

@api.get("/sectionDemo")
def generate_section_demo(request):
    
    topic = "Manga"
    section = generate_lesson_plan(topic)

    sectionJSON = { "Section" : section.section,
                "Lessons" : [
                             {"title" : lesson.title,
                              "content" : lesson.content,
                              "order" : lesson.order} #MARK: I touched this to make is lesson.order instead of lesson.int

                             for lesson in section.lessons],

               "Assessment" : {"title" : section.assessment.title,
                               "content" : section.assessment.content,
                               "requirements" : [{"name" : requirement.name,
                                                 "points" : requirement.points}
                                                 for requirement in section.assessment.requirements]
                               }
               }

    return sectionJSON


#TODO
@api.get("/dashboard")
def load_dashboard(request):
    return 0


#TODO
#design get request endpoint to allow AI to grab user skill for purposes of modifying lesson plan

#TODO
#design a put request endpoint to allow the AI to update the user skill level afterthe  modifying lesson plan