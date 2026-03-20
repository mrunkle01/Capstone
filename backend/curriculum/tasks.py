from celery import shared_task
from .atelier_agent import generate_lesson_plan

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