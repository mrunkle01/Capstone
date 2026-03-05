import atelier_agent
from pathlib import Path


def assessment(assignment: str, img: bytes):
    print("Evaluating...\n")
    grade: atelier_agent.Grade = atelier_agent.grade_art(assignment, img)
    print("Score\n")
    print(grade.score)
    print("\nFeedback\n")
    print(grade.feedback)
    print("\nReport ID\n")
    print(grade.report_id)


def main():
    # # Input
    # img_path = "circles.png"
    # assignment = "Draw 8 circles with confident lines. Make sure the circles aren't oval or lopsided."
    # img = Path(img_path).read_bytes()
    #
    # assessment(assignment, img)
    #
    # img_path = "circles_again.png"
    # img = Path(img_path).read_bytes()
    #
    # assessment(assignment, img)
    #
    # img_path = "value_shading.jpg"
    # assignment = """
    #     Complete the value shading excercise, filling in the squares with shading several shading techniques.
    #     Blending, cross-hatching, stippling, and scumbling
    #     """
    # img = Path(img_path).read_bytes()
    #
    # assessment(assignment, img)
    #
    # img_path = "../Capstone/frontend/eye_drawing.jpg"
    # assignment = """
    #         Demonstrate and understanding of shading and basic anatomy of the eye to complete a render of an eye
    #         """
    # img = Path(img_path).read_bytes()
    #
    # assessment(assignment, img)

    lesson_plan: atelier_agent.LessonPlan = atelier_agent.generate_lesson_plan("Linework")
    print(lesson_plan.section)
    print("Lessons")
    for lesson in lesson_plan.lessons:
        print(lesson.title)
        print(lesson.content)
        print(lesson.order)
    print("\nAssessment")
    print(lesson_plan.assessment.title)
    print(lesson_plan.assessment.content)
    for req in lesson_plan.assessment.requirements:
        print(req.name)
        print(req.points)

    assignment = lesson_plan.assessment.to_string()
    image_path = input("Image Name: ")
    img = Path(image_path).read_bytes()
    assessment(assignment, img)


if __name__ == '__main__':
    main()




