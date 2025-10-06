from typing import List, Optional
from documents import User, Task
from schemas import TaskCreate, TaskUpdate

class UserRepository:
    @staticmethod
    async def get_by_email(email: str) -> Optional[User]:
        return await User.find_one(User.email == email)

    @staticmethod
    async def create(user: User) -> User:
        return await user.insert()