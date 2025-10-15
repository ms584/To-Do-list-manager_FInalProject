from beanie import Document, PydanticObjectId
from pydantic import Field, BaseModel
from typing import List, Optional
from enum import Enum
import uuid
from datetime import date
from pymongo import IndexModel

class TaskPriority(str, Enum):
    A = "A"
    B = "B"
    C = "C"

class Task(BaseModel): 
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    done: bool = False
    priority: Optional[TaskPriority] = None
    scheduled_time: Optional[str] = None

class User(Document):
    email: str = Field(..., unique=True)
    username: str
    # tasks: List[Task] = []

    class Settings:
        name = "users"

class DailyLog(Document):
    day: date
    user_id: PydanticObjectId
    tasks: List[Task] = []

    class Settings:
        name = "daily_logs"
        indexes = [
            IndexModel(
                [("user_id", 1), ("day", 1)],
                name="user_day_unique_index",
                unique=True
            )
        ]