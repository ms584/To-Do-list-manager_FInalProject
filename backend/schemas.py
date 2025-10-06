from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from documents import TaskPriority
from bson import ObjectId
from beanie import PydanticObjectId

# --- Task Schemas ---
class TaskBase(BaseModel):
    title: str
    done: bool = False
    priority: Optional[TaskPriority] = None
    scheduled_time: Optional[str] = None

class TaskCreate(BaseModel):
    title: str
    priority: Optional[TaskPriority] = None
    scheduled_time: Optional[str] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    done: Optional[bool] = None
    priority: Optional[TaskPriority] = None
    scheduled_time: Optional[str] = None

class TaskResponse(TaskBase):
    id: str

# --- User Schemas ---
class UserResponse(BaseModel):
    id: PydanticObjectId
    email: str
    username: str
    # --- model_config ---
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        json_encoders={PydanticObjectId: str}
    )

# --- Token Schemas ---
class GoogleToken(BaseModel):
    token: str

class Token(BaseModel):
    access_token: str
    token_type: str