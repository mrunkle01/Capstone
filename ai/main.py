import atelier_agent
import asyncio
from atelier_agent import AtelierClient
from pathlib import Path


def write_plan_to_file(lesson_plan: atelier_agent.LessonPlan):
    with open(lesson_plan.assessment.title + ".txt", "w", encoding="utf-8") as f:
        f.write(lesson_plan.section + "\n")
        f.write("Lessons\n")
        for lesson in lesson_plan.lessons:
            f.write(lesson.title + "\n")
            f.write(str(lesson.content.time) + " minutes\n")
            f.write(lesson.content.skill + "\n")
            f.write(lesson.content.directions + "\n")
            f.write("Exercises\n")
            for ex in lesson.content.exercises:
                f.write(ex + "\n")
        f.write("\n")
        f.write("\nAssessment\n")
        f.write(lesson_plan.assessment.title + "\n")
        f.write(lesson_plan.assessment.content + "\n")
        for req in lesson_plan.assessment.requirements:
            f.write(req.name + "\n")
            f.write(req.r_id + "\n")
            f.write(str(req.points) + "\n")
        f.write("\nResources\n")
        for res in lesson_plan.resources:
            f.write(res.title + "\n")
            f.write(res.url + "\n")
            f.write(res.source + "\n")


def write_grade_to_file(grade: atelier_agent.Grade):
    with open(grade.report_id + ".txt", "w", encoding="utf-8") as f:
        f.write("Score: " + str(grade.score * 100) + "\n")
        f.write(grade.feedback + "\n")
        f.write("Requirements\n")
        for req in grade.requirements:
            f.write(req.to_string() + "\n")


def main():
    client = AtelierClient()
    print(client.inst)

    img = Path("eye_drawing.jpg").read_bytes()
    assignment = """
    Demonstrate an understanding of the anatomy of the eye and your ability to use value to render its form.
    Requirements:
    Form - 5pts
    Anatomy - 3pts
    Value - 3pts 
    """
    grade: atelier_agent.Grade = client.grade_art(assignment, img)
    write_grade_to_file(grade)

    lesson_plan: atelier_agent.LessonPlan = client.generate_lesson_plan("Figure Drawing", "1hr", "Novice")
    write_plan_to_file(lesson_plan)

    lesson_plan: atelier_agent.LessonPlan = client.generate_lesson_plan("Figure Drawing", "1hr", "Intermediate")
    write_plan_to_file(lesson_plan)


if __name__ == '__main__':
    main()
