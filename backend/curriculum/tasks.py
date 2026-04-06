from celery import shared_task
from .atelier_agent import AtelierClient



@shared_task(bind=True)
def grade_user_art(self, assignment : str, img : bytes, report_id=None):
    client = AtelierClient()

    gradeJSON = client.grade_art(assignment, img)

    score = int(gradeJSON.score * 100)

    # Update the GradeReport row with score + feedback
    if report_id:
        from .models import GradeReport
        GradeReport.objects.filter(id=report_id).update(
            score=score,
            feedback=gradeJSON.feedback,
        )

    return {"score": score, "feedback": gradeJSON.feedback, "report_id": report_id}

@shared_task(bind=True)
def generate_dashboard_task(self, topic, timeCommit, skillLevel, amount=3):  # amount = number of lessons
    client = AtelierClient()
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

# {
#     "section": str,
#     "lessons": [
#         {
#             "title": str,
#             "content": {
#                 "time": int
#                 "skill": str
#                 "directions": str
#                 "exercises": list[str]
#             },
#             "order": int
#         }
#     ],
#     assessment: {
#         "title": str,
#         "content": str,
#         "requirements": [
#                     {
#                         "name": str,
#                         "r_id": str,
#                         "points": int,
#                     }
#         ]
#     },
#    "resources": [
#         {
#             "title": str
#             "url": str
#             "source": str
#         }
#    ]
# }