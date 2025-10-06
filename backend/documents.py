from beanie import Document, PydanticObjectId
from pydantic import Field, BaseModel
from typing import List, Optional
from enum import Enum
import uuid

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
    tasks: List[Task] = []

    class Settings:
        name = "users"