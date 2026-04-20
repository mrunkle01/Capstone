import os
import asyncio
from celery import shared_task
from .atelier_agent import AtelierClient

_REF_DIR = os.path.join(os.path.dirname(__file__), "ref_images")
_REF_IMAGE_MAP = {
    "gesture":     os.path.join(_REF_DIR, "gesture-figure.jpg"),
    "lifeDrawing": os.path.join(_REF_DIR, "gesture-figure.jpg"),
    "stillLife":   os.path.join(_REF_DIR, "still-life.JPG"),
    "thumbnail":   os.path.join(_REF_DIR, "Example-thumbnails.jpg"),
}


@shared_task(bind=True)
def grade_user_art(self, assignment: str, img: bytes, report_id=None, ref_key=None):
    client = AtelierClient("system")

    ref_path = _REF_IMAGE_MAP.get(ref_key) if ref_key else None
    if ref_path and os.path.exists(ref_path):
        with open(ref_path, "rb") as f:
            ref_bytes = f.read()
        gradeJSON = client.grade_art_with_ref(assignment, img, ref_bytes)
    else:
        gradeJSON = client.grade_art(assignment, img)

    score = int(gradeJSON.score * 100)
    feedback_dict = gradeJSON.feedback.model_dump()

    # Update the GradeReport row with score + feedback
    if report_id:
        from .models import GradeReport
        GradeReport.objects.filter(id=report_id).update(
            score=score,
            feedback=feedback_dict,
        )

    requirements = [{"name": r.name, "r_id": r.r_id, "points": r.points} for r in gradeJSON.requirements]

    return {"score": score, "feedback": feedback_dict, "report_id": report_id, "requirements": requirements}

@shared_task(bind=True)
def generate_pretest_dashboard_task(self, pretest_scores, goal, time_commitment):
    # Derive skill level from the average of all 4 grading scores (each 0-100)
    scores = [
        pretest_scores.get('gesture', {}).get('score', 0),
        pretest_scores.get('lifeDrawing', {}).get('score', 0),
        pretest_scores.get('stillLife', {}).get('score', 0),
        pretest_scores.get('thumbnail', {}).get('score', 0),
    ]



    print(f"[Pretest Scores] Gesture: {scores[0]} | Life Drawing: {scores[1]} | Still Life: {scores[2]} | Thumbnail: {scores[3]}")

    avg = sum(scores) / len(scores) if scores else 0

    if avg >= 90:
        skill = 'expert'
    elif avg >= 85:
        skill = 'advanced-expert'
    elif avg >= 80:
        skill = 'advanced'
    elif avg >= 70:
        skill = 'intermediate-advanced'
    elif avg >= 50:
        skill = 'intermediate'
    elif avg >= 30:
        skill = 'beginner-intermediate'
    else:
        skill = 'beginner'

    client = AtelierClient("system")
    sectionJSON = client.generate_lesson_plan(goal, time_commitment, skill, 3)
    return {
        "skill_level": skill,
        "Section": sectionJSON.section,
        "Lessons": [{"title": l.title, "content": {"time": l.content.time,
                                                    "skill": l.content.skill,
                                                    "directions": l.content.directions,
                                                    "exercises": [e for e in l.content.exercises]},
                     "order": l.order} for l in sectionJSON.lessons],
        "Assessment": {
            "title": sectionJSON.assessment.title,
            "content": sectionJSON.assessment.content,
            "requirements": [{"name": r.name, "r_id": r.r_id, "points": r.points} for r in sectionJSON.assessment.requirements]
        },
        "resources": [{"title": res.title, "url": res.url, "source": res.source} for res in sectionJSON.resources]
    }

#Create task that grabs a newly generated lesson from the ai. this will be called by the chat bot
@shared_task(bind=True)
def generate_new_lesson(self, topic, timeCommit, skillLevel, amount=1):
    client = AtelierClient("system")
    lessonJSON = client.generate_lesson(topic, timeCommit, skillLevel, amount)
    return {
        "title": lessonJSON.title,
        "content": {
            "time": lessonJSON.content.time,
            "skill": lessonJSON.content.skill,
            "directions": lessonJSON.content.directions,
            "exercises" : [e for e in lessonJSON.content.exercises]
        },
        "order": lessonJSON.content.order
    }


@shared_task(bind=True)
def chat_task(self, message: str, user_id: str):
    """
    Sends a user message to the Atelier AI and returns the assistant reply.

    Each user gets their own AtelierClient instance (keyed by user_id), so:
    - Conversation history is isolated per user
    - Two users can chat simultaneously without blocking each other

    async_chat is declared async but uses the synchronous Ollama client
    internally, so asyncio.run() is safe here.

    If you want persistent cross-session memory, the AgentMemory (ChromaDB)
    inside AtelierClient already stores summaries — no extra work needed.
    """
    client = AtelierClient(user_id)
    result = asyncio.run(client.async_chat(message))
    return {"reply": result.message.content}


@shared_task(bind=True)
def generate_dashboard_task(self, topic, timeCommit, skillLevel, amount=3):  # amount = number of lessons
    client = AtelierClient("system")
    sectionJSON = client.generate_lesson_plan(topic, timeCommit, skillLevel, amount)
    return {
        "Section": sectionJSON.section,
        "Lessons": [{"title": l.title, "content": {"time" : l.content.time,
                                                   "skill" : l.content.skill,
                                                   "directions" : l.content.directions,
                                                   "exercises" : [e for e in l.content.exercises]},
                     "order": l.order} for l in sectionJSON.lessons],
        "Assessment": {
            "title": sectionJSON.assessment.title,
            "content": sectionJSON.assessment.content,
            "requirements": [{"name": r.name, "r_id" : r.r_id, "points": r.points} for r in sectionJSON.assessment.requirements]
        },
        "resources" : [{"title" : res.title, "url" : res.url, "source" : res.source} for res in sectionJSON.resources]
    }