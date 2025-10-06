from typing import List
from documents import User, Task
from schemas import TaskCreate, TaskUpdate
from google.oauth2 import id_token
from google.auth.transport import requests
from core.config import settings
from core.security import create_access_token
import uuid

class TaskService:
    @staticmethod
    async def get_user_tasks(user: User) -> List[Task]:
        return user.tasks

    @staticmethod
    async def create_user_task(user: User, task_data: TaskCreate) -> Task:
        # Use model_dump() to get all data from the request
        new_task = Task(**task_data.model_dump())
        user.tasks.append(new_task)
        await user.save()
        return new_task

    @staticmethod
    async def update_user_task(user: User, task_id: str, task_data: TaskUpdate) -> Task:
        task_to_update = next((t for t in user.tasks if t.id == task_id), None)
        if not task_to_update:
            return None
        
        # Use model_dump() with exclude_unset=True to only update provided fields
        update_data = task_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(task_to_update, key, value)
            
        await user.save()
        return task_to_update

    @staticmethod
    async def delete_user_task(user: User, task_id: str) -> bool:
        initial_len = len(user.tasks)
        user.tasks = [t for t in user.tasks if t.id != task_id]
        if len(user.tasks) < initial_len:
            await user.save()
            return True
        return False

class AuthService:
    @staticmethod
    async def get_or_create_user_from_google_token(google_token: str) -> User:
        try:
            id_info = id_token.verify_oauth2_token(
                google_token, requests.Request(), settings.GOOGLE_CLIENT_ID
            )
            email = id_info['email']
            username = id_info.get('name', 'No Name')
        except ValueError:
            raise ValueError("Invalid Google Token")

        user = await User.find_one(User.email == email)
        if not user:
            user = User(email=email, username=username)
            await user.insert()
        
        return user