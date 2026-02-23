from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class LearningGoal(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class UserProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile'
    )
    skill_level = models.CharField(
        max_length=20,
        choices=[
            ('beginner', 'Beginner'),
            ('intermediate', 'Intermediate'),
            ('advanced', 'Advanced')
        ],
        default='beginner',
    )
    artistic_goal = models.TextField(blank=True)
    time_commitment = models.CharField(
        max_length=50,
        choices=[
            ('casual', 'Casual (1-2 hours/week)'),
            ('regular', 'Regular (3-5 hours/week)'),
            ('intensive', 'Intensive (5+ hours/week)')
        ],
        null=True,
        blank=True,
    )
    preferred_styles = models.JSONField(default=list, blank=True)
    has_completed_pretest = models.BooleanField(default=False)
    has_active_curriculum = models.BooleanField(default=False)

    # New fields from schema
    goal = models.ForeignKey(
        LearningGoal,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users'
    )
    time_availability = models.CharField(max_length=100, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"

    def __str__(self):
        return f"{self.user.username}'s Profile"

    @property
    def is_setup_complete(self):
        return bool(self.artistic_goal and self.skill_level)


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()


class ConceptLibrary(models.Model):
    name = models.CharField(max_length=100, unique=True)
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
    )
    difficulty_level = models.CharField(
        max_length=20,
        choices=[
            ('beginner', 'Beginner'),
            ('intermediate', 'Intermediate'),
            ('advanced', 'Advanced')
        ],
    )
    prerequisites = models.JSONField(default=list, blank=True)
    description = models.TextField()
    learning_objectives = models.JSONField(default=list, blank=True)
    related_concepts = models.JSONField(default=list, blank=True)
    estimated_practice_hours = models.IntegerField(null=True, blank=True)
    common_mistakes = models.JSONField(default=list, blank=True)
    tips_for_improvement = models.JSONField(default=list, blank=True)
    sample_exercise_prompts = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    times_used = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Concept"
        verbose_name_plural = "Concept Library"
        ordering = ['category', 'difficulty_level', 'name']

    def __str__(self):
        return f"{self.name} ({self.difficulty_level})"

    def increment_usage(self):
        self.times_used += 1
        self.save(update_fields=['times_used'])

    @classmethod
    def get_beginner_concepts(cls):
        return cls.objects.filter(difficulty_level='beginner', is_active=True)

    @classmethod
    def get_by_category(cls, category):
        return cls.objects.filter(category=category, is_active=True)

    @classmethod
    def get_concepts_for_skill_level(cls, skill_level):
        if skill_level == 'beginner':
            return cls.objects.filter(difficulty_level='beginner', is_active=True)
        elif skill_level == 'intermediate':
            return cls.objects.filter(difficulty_level__in=['beginner', 'intermediate'], is_active=True)
        else:
            return cls.objects.filter(is_active=True)


class PretestQuestion(models.Model):
    question_text = models.CharField(max_length=500)
    question_type = models.CharField(max_length=50)  # e.g. 'multiple_choice', 'text'

    def __str__(self):
        return self.question_text[:50]


class PretestQuestionOption(models.Model):
    question = models.ForeignKey(
        PretestQuestion,
        on_delete=models.CASCADE,
        related_name='options'
    )
    option_text = models.CharField(max_length=255)

    def __str__(self):
        return self.option_text


class PretestResult(models.Model):
    user = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        related_name='pretest_results'
    )
    question = models.ForeignKey(
        PretestQuestion,
        on_delete=models.CASCADE,
        related_name='results'
    )
    answer = models.CharField(max_length=500)

    def __str__(self):
        return f"{self.user} - {self.question}"


class Section(models.Model):
    user = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        related_name='sections'
    )
    order = models.IntegerField()
    status = models.CharField(max_length=50, default='not_started')  # e.g. 'not_started', 'in_progress', 'complete'

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Section {self.order} - {self.user}"


class Lesson(models.Model):
    section = models.ForeignKey(
        Section,
        on_delete=models.CASCADE,
        related_name='lessons'
    )
    title = models.CharField(max_length=255)
    content = models.TextField()
    image_url = models.CharField(max_length=500, blank=True)
    order = models.IntegerField()

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title


class UserLesson(models.Model):
    user = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        related_name='user_lessons'
    )
    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name='user_lessons'
    )
    status = models.CharField(max_length=50, default='not_started')

    class Meta:
        unique_together = ('user', 'lesson')

    def __str__(self):
        return f"{self.user} - {self.lesson}"


class Assessment(models.Model):
    user = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        related_name='assessments'
    )
    section = models.ForeignKey(
        Section,
        on_delete=models.CASCADE,
        related_name='assessments'
    )
    prompt = models.TextField()

    def __str__(self):
        return f"Assessment for {self.user} - Section {self.section}"


class ReportCard(models.Model):
    user = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        related_name='report_cards'
    )
    assessment = models.ForeignKey(
        Assessment,
        on_delete=models.CASCADE,
        related_name='report_cards'
    )
    feedback = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'assessment')

    def __str__(self):
        return f"ReportCard for {self.user} - {self.assessment}"


class ChatLog(models.Model):
    user = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        related_name='chat_logs'
    )
    context = models.TextField()
    action = models.CharField(max_length=100)
    change_made = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"ChatLog - {self.user} - {self.action}"


# Placeholder models for future use
class Drawings(models.Model):
    name = models.CharField(max_length=100)

class Curriculum(models.Model):
    name = models.CharField(max_length=100)

class ConceptMastery(models.Model):
    name = models.CharField(max_length=100)

class Module(models.Model):
    name = models.CharField(max_length=100)

class PracticeExercise(models.Model):
    name = models.CharField(max_length=100)

class ChatMessage(models.Model):
    name = models.CharField(max_length=100)

class CurriculumModification(models.Model):
    name = models.CharField(max_length=100)

class Milestone(models.Model):
    name = models.CharField(max_length=100)