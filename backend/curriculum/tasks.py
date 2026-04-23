import os
import asyncio
import datetime
from celery import shared_task
from dotenv import load_dotenv
from ollama import Client
from .atelier_agent_old import AtelierClient, Lesson

_REF_DIR = os.path.join(os.path.dirname(__file__), "ref_images")


_SINGLE_LESSON_PROMPT = """\
Generate one drawing lesson. Return ONLY a JSON object matching this exact schema — no extra keys, no markdown fences:

{{
  "title": "<lesson title>",
  "content": {{
    "time": <integer, minutes>,
    "skill": "{skill}",
    "directions": "<full lesson text, use \\n for line breaks>",
    "exercises": ["<exercise 1>", "<exercise 2>", "<exercise 3>"]
  }},
  "order": 1
}}

Topic: {topic}
Time available: {time_commit}
Skill level: {skill}

The directions field must follow this structure (use \\n between sections):
Introduction: what the lesson covers and why it matters
Core Concepts: key terms and their importance
Lecture: detailed explanation the student can follow
Common Pitfalls: what to avoid and how to fix mistakes
Final Note: encouragement or real-world application

No emojis. No special characters. No keys other than the ones in the schema above.
"""


def _generate_single_lesson(topic: str, time_c: str, skill: str):
    """
    Direct ollama call for one lesson — skips AtelierClient overhead entirely
    (no memory, no personality, no summarization, no ChromaDB embed calls).
    """
    load_dotenv()
    client = Client(
        host="https://ollama.com",
        headers={'Authorization': 'Bearer ' + os.environ.get('OLLAMA_API_KEY', '')},
    )
    prompt = (_SINGLE_LESSON_PROMPT
              .replace('{topic}', topic)
              .replace('{time_commit}', time_c)
              .replace('{skill}', skill))

    response = client.chat(
        model='qwen3.5:397b-cloud',
        messages=[{'role': 'user', 'content': prompt}],
        format=Lesson.model_json_schema(),
        options={'temperature': 0.8},
    )
    return Lesson.model_validate_json(response.message.content)
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


def _handle_lesson_swap(llm_reply: str, user_id: str, context: dict) -> dict:
    """
    Validates the swap request synchronously (fast DB checks only), then fires
    generation as a background task so the user sees the LLM reply immediately.
    """
    from django.utils import timezone
    from .models import ChatLog, DashBoard, UserProfile

    try:
        profile = UserProfile.objects.get(user__username=user_id)
    except UserProfile.DoesNotExist:
        return {"reply": "I couldn't find your profile.", "action": None}

    # --- Rule 1: rate limit ---
    cutoff = timezone.now() - datetime.timedelta(hours=24)
    recent = ChatLog.objects.filter(
        user=profile, action="LESSON_SWAP", created_at__gte=cutoff
    ).first()
    if recent:
        resets_at = (recent.created_at + datetime.timedelta(hours=24)).strftime("%I:%M %p")
        return {
            "reply": f"You've already swapped a lesson today. Your next swap is available at {resets_at}.",
            "action": {"type": "LESSON_SWAP", "status": "denied",
                       "reason": f"Rate limited — resets at {resets_at}.", "data": {}},
        }

    # --- Rule 2: find the active section ---
    section_id = context.get("current_section_id")
    if section_id:
        try:
            db = DashBoard.objects.get(id=section_id, user=profile)
        except DashBoard.DoesNotExist:
            return {"reply": "I couldn't find your current section.", "action": None}
    else:
        all_sections = DashBoard.objects.filter(user=profile).order_by("order")
        db = next(
            (s for s in all_sections if not (s.progress or {}).get("assessmentScore")),
            all_sections.last(),
        )
        if not db:
            return {"reply": "You don't have an active section yet. Complete the pretest to get started.", "action": None}

    progress = db.progress or {}
    completed = progress.get("completedLessons", 0)
    active_order = completed + 1

    requested_order = context.get("current_lesson_id")
    if requested_order and requested_order != active_order:
        return {
            "reply": f"I can only swap your active lesson (lesson {active_order}). Completed and future lessons can't be changed.",
            "action": {"type": "LESSON_SWAP", "status": "denied",
                       "reason": "Only the current active lesson can be swapped.", "data": {}},
        }

    lessons = db.contents.get("Lessons", [])
    current_lesson = next((l for l in lessons if l.get("order") == active_order), None)
    if not current_lesson:
        return {"reply": "I couldn't identify your current lesson.", "action": None}

    topic = current_lesson.get("title", "the current topic")
    skill = profile.skill_level
    time_c = profile.time_commitment or profile.time_availability or "1 hour"

    # Write the ChatLog now to lock the rate limit slot before generation starts
    ChatLog.objects.create(
        user=profile,
        context=context,
        action="LESSON_SWAP",
        change_made=f"Swapped lesson {active_order} for variation on: {topic}",
    )

    # Fire generation in the background — user gets the reply instantly
    gen_task = _lesson_swap_generate.delay(db.id, active_order, topic, time_c, skill)

    return {
        "reply": llm_reply,
        "action": {"type": "LESSON_SWAP", "status": "approved", "reason": "",
                   "data": {"lesson_order": active_order, "generation_job_id": gen_task.id}},
    }


@shared_task
def _lesson_swap_generate(dashboard_id: int, active_order: int, topic: str, time_c: str, skill: str):
    """Background task: generates the replacement lesson and patches DashBoard."""
    from .models import DashBoard

    try:
        new_lesson = _generate_single_lesson(topic, time_c, skill)
    except Exception as e:
        print(f"_lesson_swap_generate failed: {e}")
        return

    new_lesson_data = {
        "title": new_lesson.title,
        "content": {
            "time": new_lesson.content.time,
            "skill": new_lesson.content.skill,
            "directions": new_lesson.content.directions,
            "exercises": list(new_lesson.content.exercises),
        },
        "order": active_order,
    }

    try:
        db = DashBoard.objects.get(id=dashboard_id)
    except DashBoard.DoesNotExist:
        return

    updated_lessons = [
        new_lesson_data if l.get("order") == active_order else l
        for l in db.contents.get("Lessons", [])
    ]
    db.contents = {**db.contents, "Lessons": updated_lessons}
    db.save(update_fields=["contents"])


def _handle_time_change(llm_reply: str, time_value: str) -> dict:
    """
    Returns a pending_confirmation envelope so the frontend can show a confirm card.
    The actual profile update happens via POST /api/chat/confirm.
    If time_value is empty the LLM already asked for clarification — pass through.
    """
    if not time_value:
        return {"reply": llm_reply, "action": None}
    return {
        "reply": f"I'd like to update your daily practice time to {time_value}. This takes effect when your next section begins. Confirm?",
        "action": {"type": "TIME_CHANGE", "status": "pending_confirmation", "reason": "",
                   "data": {"time_value": time_value}},
    }


_SWAP_KEYWORDS = {"swap", "change", "different", "new lesson", "switch", "replace", "redo", "another lesson"}


def _precheck_swap_rate_limit(user_id: str, message: str) -> dict | None:
    """
    Returns a denial dict immediately if the user is rate-limited for LESSON_SWAP
    and the message looks like a swap request — skipping all LLM calls.
    Returns None if the normal flow should continue.
    """
    msg_lower = message.lower()
    if not any(kw in msg_lower for kw in _SWAP_KEYWORDS):
        return None

    from django.utils import timezone
    from .models import ChatLog, UserProfile

    try:
        profile = UserProfile.objects.get(user__username=user_id)
    except UserProfile.DoesNotExist:
        return None

    cutoff = timezone.now() - datetime.timedelta(hours=24)
    recent = ChatLog.objects.filter(
        user=profile, action="LESSON_SWAP", created_at__gte=cutoff
    ).first()
    if not recent:
        return None

    resets_at = (recent.created_at + datetime.timedelta(hours=24)).strftime("%I:%M %p")
    return {
        "reply": f"You've already swapped a lesson today. Your next swap is available at {resets_at}.",
        "action": {"type": "LESSON_SWAP", "status": "denied",
                   "reason": f"Rate limited — resets at {resets_at}.", "data": {}},
    }


@shared_task(bind=True)
def chat_task(self, message: str, user_id: str, context: dict = None):
    """
    Sends the message to the user's AtelierClient instance.
    The LLM calls request_lesson_swap() or request_time_change() tool functions
    when it detects those intents; _last_action carries the structured result back.

    LESSON_SWAP → _handle_lesson_swap (rate limit + DB patch)
    TIME_CHANGE → _handle_time_change (pending_confirmation for frontend)
    Otherwise   → conversational reply passed through unchanged
    """
    context = context or {}

    # Fast path: deny rate-limited swap requests before any LLM calls
    early_denial = _precheck_swap_rate_limit(user_id, message)
    if early_denial:
        return early_denial

    client = AtelierClient(user_id)
    chat_result = asyncio.run(client.async_chat(message))
    reply = chat_result["reply"]
    action_data = chat_result.get("action")

    if action_data:
        if action_data.get("action") == "LESSON_SWAP":
            return _handle_lesson_swap(reply, user_id, context)
        if action_data.get("action") == "TIME_CHANGE":
            return _handle_time_change(reply, action_data.get("time_value", ""))

    return {"reply": reply, "action": None}


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