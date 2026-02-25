import grading_agentv2
from pathlib import Path


def assessment(assignment: str, img: bytes):
    print("Evaluating...\n")
    grade: grading_agentv2.Grade = grading_agentv2.grade_art(assignment, img)
    print("Score\n")
    print(grade.score)
    print("\nFeedback\n")
    print(grade.feedback)
    print("\nReport ID\n")
    print(grade.report_id)


if __name__ == '__main__':
    # Input
    img_path = "circles.png"
    assignment = "Draw 8 circles with confident lines. Make sure the circles aren't oval or lopsided."
    img = Path(img_path).read_bytes()

    assessment(assignment, img)

    img_path = "circles_again.png"
    img = Path(img_path).read_bytes()

    assessment(assignment, img)

    img_path = "value_shading.jpg"
    assignment = """
    Complete the value shading excercise, filling in the squares with shading several shading techniques. 
    Blending, cross-hatching, stippling, and scumbling 
    """
    img = Path(img_path).read_bytes()

    assessment(assignment, img)

    img_path = "eye_drawing.jpg"
    assignment = """
        Demonstrate and understanding of shading and basic anatomy of the eye to complete a render of an eye
        """
    img = Path(img_path).read_bytes()

    assessment(assignment, img)


