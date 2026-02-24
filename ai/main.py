import base64

import art_grader
from pathlib import Path

if __name__ == '__main__':
    # Pass in the path to the image
    path = input('Please enter the path to the image: ')

    assignment = "Draw 8 perfect circles"

    # You can also pass in base64 encoded image data
    img = base64.b64encode(Path(path).read_bytes()).decode()
    # or the raw bytes
    # img = Path(path).read_bytes()

    print("Evaluating...\n")
    print(art_grader.grade_art(img, assignment))
