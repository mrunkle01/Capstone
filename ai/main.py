import grading_agentv2
from pathlib import Path

if __name__ == '__main__':
    # Input
    img_path = f'{input("Enter image name: ")}'
    media_type = f'image/{input("Enter image format: ")}'
    assignment = "Draw 8 circles with confident lines. Make sure the circles aren't oval or lopsided."

    img = Path(img_path).read_bytes()

    print("Evaluating...\n")
    grade : grading_agentv2.Grade = grading_agentv2.grade_art(assignment, img, media_type)
    print("Report\n")
    print(grade.report)
    print(f"\nGrade: {grade.letter_grade} {grade.percentage}")
