"""
Seed script for ConceptLibrary
Run this with: python manage.py shell < seed_concepts.py
Or create as a management command
"""

from django.core.management.base import BaseCommand
from curriculum.models import ConceptLibrary


class Command(BaseCommand):
    help = 'Seeds the ConceptLibrary with initial art concepts'

    def handle(self, *args, **kwargs):
        concepts = [
            # FUNDAMENTALS
            {
                "name": "basic_shapes",
                "category": "fundamentals",
                "difficulty_level": "beginner",
                "description": "Understanding and drawing basic geometric shapes (circles, squares, triangles) as building blocks for complex forms",
                "prerequisites": [],
                "related_concepts": ["construction", "form"],
                "learning_objectives": [
                    "Draw accurate circles, squares, and triangles",
                    "Understand how shapes combine to form complex objects",
                    "Use shapes as construction guidelines"
                ],
                "estimated_practice_hours": 3,
                "common_mistakes": [
                    "Drawing lopsided circles",
                    "Not practicing with consistent proportions",
                    "Skipping construction lines"
                ],
                "tips_for_improvement": [
                    "Practice drawing shapes from different angles",
                    "Use construction lines before committing",
                    "Draw lightly at first, darken later"
                ],
                "sample_exercise_prompts": [
                    "Draw 10 perfect circles without tracing",
                    "Break down a coffee mug into basic shapes",
                    "Draw a house using only squares and triangles"
                ]
            },
            {
                "name": "line_control",
                "category": "fundamentals",
                "difficulty_level": "beginner",
                "description": "Developing steady hand control and confident line work",
                "prerequisites": [],
                "related_concepts": ["hatching", "gesture"],
                "learning_objectives": [
                    "Draw straight lines without a ruler",
                    "Create smooth, confident curves",
                    "Control line weight and pressure"
                ],
                "estimated_practice_hours": 5,
                "common_mistakes": [
                    "Using short, scratchy strokes instead of confident lines",
                    "Gripping pencil too tightly",
                    "Drawing too slowly"
                ],
                "tips_for_improvement": [
                    "Draw from your shoulder, not your wrist",
                    "Practice quick, confident strokes",
                    "Fill pages with parallel lines daily"
                ],
                "sample_exercise_prompts": [
                    "Draw 50 parallel straight lines",
                    "Create smooth curves connecting two points",
                    "Practice varying line weight in a single stroke"
                ]
            },
            {
                "name": "perspective",
                "category": "fundamentals",
                "difficulty_level": "intermediate",
                "description": "Understanding how to create depth and dimension using vanishing points and horizon lines",
                "prerequisites": ["basic_shapes", "line_control"],
                "related_concepts": ["construction", "spatial_reasoning", "composition"],
                "learning_objectives": [
                    "Understand 1-point, 2-point, and 3-point perspective",
                    "Place objects correctly in perspective space",
                    "Use vanishing points to create depth"
                ],
                "estimated_practice_hours": 10,
                "common_mistakes": [
                    "Forgetting to establish horizon line",
                    "Inconsistent vanishing points",
                    "Mixing different perspective systems in one drawing"
                ],
                "tips_for_improvement": [
                    "Always start with horizon line and vanishing points",
                    "Practice with simple boxes before complex objects",
                    "Study photographs to identify perspective in real scenes"
                ],
                "sample_exercise_prompts": [
                    "Draw a cube in 1-point perspective",
                    "Create a city street in 2-point perspective",
                    "Draw a tall building from ground level in 3-point perspective"
                ]
            },
            {
                "name": "shading",
                "category": "fundamentals",
                "difficulty_level": "beginner",
                "description": "Using value (light and dark) to show form, volume, and lighting on objects",
                "prerequisites": ["basic_shapes"],
                "related_concepts": ["light_source", "values", "contrast", "form"],
                "learning_objectives": [
                    "Identify light source and cast shadows",
                    "Create smooth value gradients",
                    "Understand core shadow, highlight, and reflected light"
                ],
                "estimated_practice_hours": 8,
                "common_mistakes": [
                    "Shading without considering light source",
                    "Making everything too dark or too light",
                    "Not blending values smoothly"
                ],
                "tips_for_improvement": [
                    "Always establish light source first",
                    "Practice value scales (0-10)",
                    "Squint to see values more clearly"
                ],
                "sample_exercise_prompts": [
                    "Shade a sphere with light from the left",
                    "Draw a cylinder showing form shadow",
                    "Create a value scale from white to black in 10 steps"
                ]
            },
            {
                "name": "proportions",
                "category": "fundamentals",
                "difficulty_level": "intermediate",
                "description": "Understanding and maintaining accurate size relationships between different parts of a subject",
                "prerequisites": ["basic_shapes"],
                "related_concepts": ["measurement", "observation", "anatomy"],
                "learning_objectives": [
                    "Measure proportions using comparative techniques",
                    "Maintain consistent proportions throughout a drawing",
                    "Identify and correct proportion errors"
                ],
                "estimated_practice_hours": 6,
                "common_mistakes": [
                    "Drawing what you think you see instead of what's actually there",
                    "Not measuring relationships between parts",
                    "Starting details before establishing overall proportions"
                ],
                "tips_for_improvement": [
                    "Use your pencil as a measuring tool",
                    "Compare sizes: 'the head is 3x the width of the nose'",
                    "Block in basic shapes first"
                ],
                "sample_exercise_prompts": [
                    "Draw a still life using comparative measurement",
                    "Copy a photograph maintaining exact proportions",
                    "Draw your hand, measuring each finger's length"
                ]
            },

            # FIGURE DRAWING
            {
                "name": "gesture_drawing",
                "category": "figure_drawing",
                "difficulty_level": "intermediate",
                "description": "Capturing the essence, movement, and energy of a pose quickly",
                "prerequisites": ["line_control", "proportions"],
                "related_concepts": ["anatomy", "rhythm", "movement"],
                "learning_objectives": [
                    "Capture a pose in 30-60 seconds",
                    "Identify the line of action",
                    "Express movement and weight"
                ],
                "estimated_practice_hours": 15,
                "common_mistakes": [
                    "Getting caught up in details too early",
                    "Not identifying the main action line",
                    "Drawing stiffly without flow"
                ],
                "tips_for_improvement": [
                    "Start with the line of action",
                    "Use flowing, continuous lines",
                    "Practice with timed sessions (30s, 1min, 2min)"
                ],
                "sample_exercise_prompts": [
                    "Draw 10 gesture poses in 30 seconds each",
                    "Capture a running figure showing movement",
                    "Draw a dancer emphasizing the line of action"
                ]
            },
            {
                "name": "anatomy",
                "category": "anatomy",
                "difficulty_level": "advanced",
                "description": "Understanding human body structure, bones, and muscles for accurate figure drawing",
                "prerequisites": ["proportions", "basic_shapes", "gesture_drawing"],
                "related_concepts": ["construction", "form", "planes"],
                "learning_objectives": [
                    "Understand basic skeletal structure",
                    "Identify major muscle groups",
                    "Draw figures with anatomical accuracy"
                ],
                "estimated_practice_hours": 40,
                "common_mistakes": [
                    "Memorizing anatomy without understanding function",
                    "Overcomplicating with too much muscle detail",
                    "Not studying from real references"
                ],
                "tips_for_improvement": [
                    "Study simplified anatomy first",
                    "Practice drawing bones and muscles separately",
                    "Use reference images extensively"
                ],
                "sample_exercise_prompts": [
                    "Draw a skeleton from different angles",
                    "Sketch major muscle groups on a figure",
                    "Draw hands showing bone structure"
                ]
            },

            # COMPOSITION
            {
                "name": "composition",
                "category": "composition",
                "difficulty_level": "intermediate",
                "description": "Arranging elements within a frame to create visual interest and guide the viewer's eye",
                "prerequisites": ["basic_shapes"],
                "related_concepts": ["balance", "focal_point", "rule_of_thirds"],
                "learning_objectives": [
                    "Apply rule of thirds",
                    "Create visual hierarchy",
                    "Balance elements in a composition"
                ],
                "estimated_practice_hours": 8,
                "common_mistakes": [
                    "Centering everything",
                    "Cluttering the composition",
                    "No clear focal point"
                ],
                "tips_for_improvement": [
                    "Use thumbnail sketches to plan",
                    "Study compositions in master paintings",
                    "Consider negative space"
                ],
                "sample_exercise_prompts": [
                    "Create 3 thumbnail compositions of the same scene",
                    "Draw a landscape using rule of thirds",
                    "Arrange 5 objects to create visual balance"
                ]
            },

            # COLOR THEORY
            {
                "name": "color_theory",
                "category": "color_theory",
                "difficulty_level": "intermediate",
                "description": "Understanding color relationships, harmony, and how to use color effectively",
                "prerequisites": ["values"],
                "related_concepts": ["hue", "saturation", "temperature"],
                "learning_objectives": [
                    "Understand color wheel relationships",
                    "Create color harmony using schemes",
                    "Mix colors to achieve desired hues"
                ],
                "estimated_practice_hours": 12,
                "common_mistakes": [
                    "Using too many colors",
                    "Ignoring color temperature",
                    "Not considering value when choosing colors"
                ],
                "tips_for_improvement": [
                    "Limit palette to 3-5 colors",
                    "Study color in nature and master paintings",
                    "Practice mixing colors systematically"
                ],
                "sample_exercise_prompts": [
                    "Create a color wheel from primary colors",
                    "Paint the same scene in warm vs cool color schemes",
                    "Mix and paint a value scale in a single hue"
                ]
            },

            # TECHNIQUE
            {
                "name": "hatching",
                "category": "technique",
                "difficulty_level": "beginner",
                "description": "Creating value and texture using parallel lines",
                "prerequisites": ["line_control"],
                "related_concepts": ["cross_hatching", "shading", "texture"],
                "learning_objectives": [
                    "Create smooth hatching with parallel lines",
                    "Control density for different values",
                    "Use hatching to show form"
                ],
                "estimated_practice_hours": 4,
                "common_mistakes": [
                    "Lines not parallel enough",
                    "Inconsistent spacing",
                    "Lines too dark or too light"
                ],
                "tips_for_improvement": [
                    "Practice making parallel lines daily",
                    "Vary spacing to create different values",
                    "Follow the form with your hatching direction"
                ],
                "sample_exercise_prompts": [
                    "Shade a sphere using only hatching",
                    "Create a value gradient using hatching density",
                    "Draw fabric folds using cross-hatching"
                ]
            },
            {
                "name": "values",
                "category": "fundamentals",
                "difficulty_level": "beginner",
                "description": "Understanding the range from light to dark and how to control it",
                "prerequisites": [],
                "related_concepts": ["shading", "contrast", "form"],
                "learning_objectives": [
                    "Identify values in reference images",
                    "Create full value range in drawings",
                    "Use values to create depth and dimension"
                ],
                "estimated_practice_hours": 6,
                "common_mistakes": [
                    "Not using the full value range",
                    "Making midtones too similar",
                    "Overusing pure black and white"
                ],
                "tips_for_improvement": [
                    "Practice value scales regularly",
                    "Squint to simplify values",
                    "Compare values to each other, not in isolation"
                ],
                "sample_exercise_prompts": [
                    "Create a 10-step value scale",
                    "Draw an object using only 5 values",
                    "Convert a color photo to black and white drawing"
                ]
            },
            {
                "name": "construction",
                "category": "fundamentals",
                "difficulty_level": "intermediate",
                "description": "Building complex forms from simple shapes and understanding underlying structure",
                "prerequisites": ["basic_shapes", "perspective"],
                "related_concepts": ["form", "perspective", "anatomy"],
                "learning_objectives": [
                    "Break down complex objects into basic forms",
                    "Build 3D forms from 2D shapes",
                    "Understand underlying structure before adding details"
                ],
                "estimated_practice_hours": 8,
                "common_mistakes": [
                    "Jumping to details without construction",
                    "Not thinking in 3D",
                    "Erasing construction lines too early"
                ],
                "tips_for_improvement": [
                    "Always start with basic shapes",
                    "Draw through forms (show hidden edges)",
                    "Keep construction lines light"
                ],
                "sample_exercise_prompts": [
                    "Construct a car from basic boxes and cylinders",
                    "Build a human figure from simple forms",
                    "Draw everyday objects showing construction lines"
                ]
            },
        ]

        created_count = 0
        updated_count = 0

        for concept_data in concepts:
            concept, created = ConceptLibrary.objects.update_or_create(
                name=concept_data['name'],
                defaults=concept_data
            )

            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created concept: {concept.name}')
                )
            else:
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'Updated concept: {concept.name}')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'\nSeeding complete! Created {created_count} new concepts, updated {updated_count} existing concepts.'
            )
        )
        self.stdout.write(
            self.style.SUCCESS(
                f'Total concepts in library: {ConceptLibrary.objects.count()}'
            )
        )