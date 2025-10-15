from typing import List, Optional
from documents import User, Task, DailyLog
from schemas import TaskCreate, TaskUpdate
from google.oauth2 import id_token
from google.auth.transport import requests
from core.config import settings
from core.security import create_access_token
from datetime import date
from beanie import PydanticObjectId

class TaskService:
    @staticmethod
    async def get_tasks_for_day(user_id: PydanticObjectId, day: date) -> List[Task]:
        daily_log = await DailyLog.find_one(DailyLog.user_id == user_id, DailyLog.day == day)
        if not daily_log:
            return []
        sorted_tasks = sorted(daily_log.tasks, key=lambda t: (t.priority.value if t.priority else 'Z', t.scheduled_time or '99:99'))
        return sorted_tasks

    @staticmethod
    async def add_task_to_day(user_id: PydanticObjectId, day: date, task_data: TaskCreate) -> Task:
        new_task = Task(**task_data.model_dump())
        daily_log = await DailyLog.find_one(
            DailyLog.user_id == user_id,
            DailyLog.day == day
        )

        if daily_log:
            daily_log.tasks.append(new_task)
        else:
            daily_log = DailyLog(
                user_id=user_id,
                day=day,
                tasks=[new_task]
            )
        await daily_log.save()
        
        return new_task

    @staticmethod
    async def update_user_task(user_id: PydanticObjectId, day: date, task_id: str, task_data: TaskUpdate) -> Optional[Task]:
        daily_log = await DailyLog.find_one(DailyLog.user_id == user_id, DailyLog.day == day)
        if not daily_log: return None
        task_to_update = next((t for t in daily_log.tasks if t.id == task_id), None)
        if not task_to_update: return None
        update_data = task_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(task_to_update, key, value)
        await daily_log.save()
        return task_to_update

    @staticmethod
    async def delete_user_task(user_id: PydanticObjectId, day: date, task_id: str) -> bool:
        daily_log = await DailyLog.find_one(DailyLog.user_id == user_id, DailyLog.day == day)
        if not daily_log: return False
        initial_len = len(daily_log.tasks)
        daily_log.tasks = [t for t in daily_log.tasks if t.id != task_id]
        if len(daily_log.tasks) < initial_len:
            await daily_log.save()
            return True
        return False

class AuthService:
    @staticmethod
    async def get_or_create_user_from_google_token(google_token: str) -> User:
        try:
            id_info = id_token.verify_oauth2_token(google_token, requests.Request(), settings.GOOGLE_CLIENT_ID)
            email = id_info['email']
            username = id_info.get('name', 'No Name')
        except ValueError:
            raise ValueError("Invalid Google Token")
        user = await User.find_one(User.email == email)
        if not user:
            user = User(email=email, username=username)
            await user.insert()
        return user