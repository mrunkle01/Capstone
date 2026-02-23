from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class UserProfile(models.Model):
    """
    Extended user profile for art learning platform.
    Automatically created when a User is created via signal.
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile'
    )

    # Skill level assessment
    skill_level = models.CharField(
        max_length=20,
        choices=[
            ('beginner', 'Beginner'),
            ('intermediate', 'Intermediate'),
            ('advanced', 'Advanced')
        ],
        default='beginner',
        help_text="User's current artistic skill level"
    )

    # User's artistic goals and preferences
    artistic_goal = models.TextField(
        help_text="What the user wants to achieve (e.g., 'improve portraits', 'learn anime style')",
        blank=True
    )

    time_commitment = models.CharField(
        max_length=50,
        choices=[
            ('casual', 'Casual (1-2 hours/week)'),
            ('regular', 'Regular (3-5 hours/week)'),
            ('intensive', 'Intensive (5+ hours/week)')
        ],
        null=True,
        blank=True,
        help_text="How much time user can dedicate to learning"
    )

    # Preferred art styles (optional)
    preferred_styles = models.JSONField(
        default=list,
        blank=True,
        help_text="List of preferred art styles (e.g., ['realistic', 'anime', 'abstract'])"
    )

    # Profile completion tracking
    has_completed_pretest = models.BooleanField(
        default=False,
        help_text="Whether user has completed initial assessment"
    )

    has_active_curriculum = models.BooleanField(
        default=False,
        help_text="Whether user has an AI-generated curriculum"
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"

    def __str__(self):
        return f"{self.user.username}'s Profile"

    @property
    def is_setup_complete(self):
        """Check if user has completed initial profile setup"""
        return bool(self.artistic_goal and self.skill_level)


# Signal to automatically create UserProfile when User is created
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Create UserProfile automatically when a new User is created"""
    if created:
        UserProfile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """Save UserProfile when User is saved"""
    instance.profile.save()


class ConceptLibrary(models.Model):
    """
    Master library of art concepts that AI can draw from when generating curricula.
    This is pre-seeded and serves as the knowledge base for curriculum generation.
    """
    # Basic info
    name = models.CharField(
        max_length=100,
        unique=True,
        help_text="Unique concept name (e.g., 'perspective', 'shading', 'anatomy')"
    )

    category = models.CharField(
        max_length=50,
        choices=[
            ('fundamentals', 'Fundamentals'),
            ('figure_drawing', 'Figure Drawing'),
            ('composition', 'Composition'),
            ('color_theory', 'Color Theory'),
            ('anatomy', 'Anatomy'),
            ('technique', 'Technique'),
            ('style', 'Style'),
            ('advanced', 'Advanced Concepts')
        ],
        help_text="Broad category this concept belongs to"
    )

    # Difficulty and prerequisites
    difficulty_level = models.CharField(
        max_length=20,
        choices=[
            ('beginner', 'Beginner'),
            ('intermediate', 'Intermediate'),
            ('advanced', 'Advanced')
        ],
        help_text="Skill level required to learn this concept"
    )

    prerequisites = models.JSONField(
        default=list,
        blank=True,
        help_text="List of concept names that should be learned before this one (e.g., ['basic_shapes', 'line_control'])"
    )

    # Descriptions for AI and users
    description = models.TextField(
        help_text="Detailed description of what this concept teaches"
    )

    learning_objectives = models.JSONField(
        default=list,
        blank=True,
        help_text="List of specific learning objectives (e.g., ['Draw objects in 1-point perspective', 'Identify vanishing points'])"
    )

    # Relationships to other concepts
    related_concepts = models.JSONField(
        default=list,
        blank=True,
        help_text="List of related concept names that complement this one (e.g., ['light_source', 'values', 'contrast'])"
    )

    # Metadata for AI curriculum generation
    estimated_practice_hours = models.IntegerField(
        null=True,
        blank=True,
        help_text="Estimated hours needed to achieve proficiency"
    )

    common_mistakes = models.JSONField(
        default=list,
        blank=True,
        help_text="Common mistakes learners make with this concept"
    )

    tips_for_improvement = models.JSONField(
        default=list,
        blank=True,
        help_text="Tips and tricks for mastering this concept"
    )

    # Example prompts for practice
    sample_exercise_prompts = models.JSONField(
        default=list,
        blank=True,
        help_text="Example exercise prompts AI can use or modify (e.g., ['Draw a cube in 2-point perspective', 'Shade a sphere with light from the left'])"
    )

    # Admin/tracking
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this concept is currently available for curriculum generation"
    )

    times_used = models.IntegerField(
        default=0,
        help_text="Number of times this concept has been included in curricula (for analytics)"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Concept"
        verbose_name_plural = "Concept Library"
        ordering = ['category', 'difficulty_level', 'name']

    def __str__(self):
        return f"{self.name} ({self.difficulty_level})"

    def increment_usage(self):
        """Increment usage counter when concept is included in curriculum"""
        self.times_used += 1
        self.save(update_fields=['times_used'])

    @classmethod
    def get_beginner_concepts(cls):
        """Get all beginner-level concepts"""
        return cls.objects.filter(difficulty_level='beginner', is_active=True)

    @classmethod
    def get_by_category(cls, category):
        """Get all concepts in a specific category"""
        return cls.objects.filter(category=category, is_active=True)

    @classmethod
    def get_concepts_for_skill_level(cls, skill_level):
        """Get appropriate concepts for a given skill level"""
        if skill_level == 'beginner':
            return cls.objects.filter(
                difficulty_level='beginner',
                is_active=True
            )
        elif skill_level == 'intermediate':
            return cls.objects.filter(
                difficulty_level__in=['beginner', 'intermediate'],
                is_active=True
            )
        else:  # advanced
            return cls.objects.filter(is_active=True)


    class Drawings(models.Model):
        name = models.CharField(
            max_length=100
        )
    class Curriculum(models.Model):
        name = models.CharField(
            max_length=100
        )
    class ConceptMastery(models.Model):
        name = models.CharField(
            max_length=100
        )
    #later on
    class Module(models.Model):
        name = models.CharField(
            max_length=100
        )
    class PracticeExercise(models.Model):
        name = models.CharField(
            max_length=100
        )
    class ChatMessage(models.Model):
        name = models.CharField(
            max_length=100
        )
    class CurriculumModification(models.Model):
        name = models.CharField(
            max_length=100
        )
    class Milestone(models.Model):
        name = models.CharField(
            max_length=100
        )
    class LearningGoal(models.Model):
        name = models.CharField(
            max_length=100
        )