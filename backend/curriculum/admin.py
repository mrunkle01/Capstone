from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import UserProfile, ConceptLibrary

#
# Inline admin for UserProfile
class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile'
    fk_name = 'user'
    fields = (
        'skill_level',
        'artistic_goal',
        'time_commitment',
        'preferred_styles',
        'has_completed_pretest',
        'has_active_curriculum'
    )


# Extend the User admin to show profile inline
class UserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'get_skill_level', 'get_has_curriculum')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'profile__skill_level', 'profile__has_active_curriculum')

    def get_skill_level(self, obj):
        return obj.profile.skill_level

    get_skill_level.short_description = 'Skill Level'

    def get_has_curriculum(self, obj):
        return obj.profile.has_active_curriculum

    get_has_curriculum.short_description = 'Has Curriculum'
    get_has_curriculum.boolean = True


# Unregister the default User admin and register our custom one
admin.site.unregister(User)
admin.site.register(User, UserAdmin)


# ConceptLibrary Admin
@admin.register(ConceptLibrary)
class ConceptLibraryAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'category',
        'difficulty_level',
        'is_active',
        'times_used',
        'estimated_practice_hours'
    )
    list_filter = ('category', 'difficulty_level', 'is_active')
    search_fields = ('name', 'description')
    ordering = ('category', 'difficulty_level', 'name')

    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'category', 'difficulty_level', 'description', 'is_active')
        }),
        ('Learning Structure', {
            'fields': ('prerequisites', 'related_concepts', 'learning_objectives', 'estimated_practice_hours')
        }),
        ('Teaching Guidance', {
            'fields': ('common_mistakes', 'tips_for_improvement', 'sample_exercise_prompts'),
            'classes': ('collapse',)
        }),
        ('Analytics', {
            'fields': ('times_used', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    readonly_fields = ('times_used', 'created_at', 'updated_at')

    # Enable filtering by multiple fields
    list_per_page = 25

    def get_queryset(self, request):
        """Optimize queries"""
        qs = super().get_queryset(request)
        return qs.select_related()

    actions = ['mark_as_active', 'mark_as_inactive', 'reset_usage_count']

    def mark_as_active(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} concept(s) marked as active.')

    mark_as_active.short_description = "Mark selected concepts as active"

    def mark_as_inactive(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} concept(s) marked as inactive.')

    mark_as_inactive.short_description = "Mark selected concepts as inactive"

    def reset_usage_count(self, request, queryset):
        updated = queryset.update(times_used=0)
        self.message_user(request, f'Reset usage count for {updated} concept(s).')

    reset_usage_count.short_description = "Reset usage count to 0"