from ninja import Schema

class RegisterSchema(Schema):
    username: str
    email: str
    password: str
    skill_level: str = "beginner"
    artistic_goal: str = ""


class UpdateProfileSchema(Schema):
    id: int
    skill_level: str
    artistic_goal: str
    time_commitment: str