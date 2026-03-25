from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.schemas.user import UpdateProfileRequest


class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def update_profile(self, user: User, body: UpdateProfileRequest) -> User:
        if body.first_name is not None:
            user.first_name = body.first_name.strip()
        if body.last_name is not None:
            user.last_name = body.last_name.strip()
        if body.profile_image is not None:
            user.profile_image = body.profile_image
        return user
