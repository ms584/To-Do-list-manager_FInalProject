import json
import os
import uuid
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# --- Data Models (for validation and clarity) ---
class Task(BaseModel):
    id: str
    title: str
    done: bool

class CreateTask(BaseModel):
    title: str

# --- App Setup ---
app = FastAPI()

# Allow our frontend (running on a different port/domain) to access this API
origins = ["*"]  # For development, allow all. For production, restrict this.
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Data Handling ---
# Create a dedicated directory for data inside the container
DATA_DIR = "/data"
FILENAME = os.path.join(DATA_DIR, "tasks.json")

# Ensure the data directory exists when the app starts
os.makedirs(DATA_DIR, exist_ok=True)

def load_tasks() -> List[Task]:
    if not os.path.exists(FILENAME):
        return []
    try:
        with open(FILENAME, "r") as f:
            data = json.load(f)
            return [Task(**item) for item in data]
    except (json.JSONDecodeError, TypeError):
        return []

def save_tasks(tasks: List[Task]):
    with open(FILENAME, "w") as f:
        json.dump([task.model_dump() for task in tasks], f, indent=4)

# --- API Endpoints ---
@app.get("/api/tasks", response_model=List[Task])
def get_tasks():
    """Retrieve all tasks."""
    return load_tasks()

@app.post("/api/tasks", response_model=Task, status_code=201)
def add_task(task_in: CreateTask):
    """Add a new task."""
    tasks = load_tasks()
    new_task = Task(id=str(uuid.uuid4()), title=task_in.title, done=False)
    tasks.append(new_task)
    save_tasks(tasks)
    return new_task

@app.put("/api/tasks/{task_id}", response_model=Task)
def update_task_status(task_id: str):
    """Mark a task as done."""
    tasks = load_tasks()
    task = next((t for t in tasks if t.id == task_id), None)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.done = not task.done  # Toggle status
    save_tasks(tasks)
    return task

@app.delete("/api/tasks/{task_id}", status_code=204)
def delete_task(task_id: str):
    """Delete a task."""
    tasks = load_tasks()
    if not any(t for t in tasks if t.id == task_id):
        raise HTTPException(status_code=404, detail="Task not found")
    
    updated_tasks = [t for t in tasks if t.id != task_id]
    save_tasks(updated_tasks)
    return None