from django.contrib.auth import get_user_model

User = get_user_model()

class UsernameOrEmailBackend:
    def authenticate(self, request, username=None, password=None, **kwargs):
        # Try to fetch the user by username first, then email
        user = User.objects.filter(username=username).first() or \
               User.objects.filter(email=username).first()

        if user and user.check_password(password):
            return user
        return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None