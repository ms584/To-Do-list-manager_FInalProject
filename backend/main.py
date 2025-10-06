# --- Python Standard Library Imports ---
import csv
from io import StringIO, BytesIO
from datetime import datetime
from typing import List
from contextlib import asynccontextmanager

# --- Third-party Library Imports ---
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import StreamingResponse, Response
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

# --- Local Application/Library Specific Imports ---
from core.db import init_db
from core.security import get_current_user, create_access_token
from documents import User, Task
from schemas import (
    TaskCreate, TaskUpdate, TaskResponse,
    UserResponse, GoogleToken, Token
)
from services import TaskService, AuthService

# --- Lifespan Manager ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handles application startup and shutdown events."""
    await init_db()
    print("--- Database Initialized ---")
    yield
    print("--- Application Shutting Down ---")

# --- App Initialization ---
app = FastAPI(
    title="To-Do List API",
    description="API for the Full-Stack To-Do List Final Project",
    version="1.0.0",
    lifespan=lifespan
)

# --- CORS Middleware ---
origins = ["*"] 
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Dependency Services ---
def get_task_service():
    return TaskService()

def get_auth_service():
    return AuthService()
    
# --- Authentication Endpoints ---
@app.post("/api/auth/google/login", response_model=Token, tags=["Authentication"])
async def login_with_google(
    token_data: GoogleToken,
    auth_service: AuthService = Depends(get_auth_service)
):
    try:
        user = await auth_service.get_or_create_user_from_google_token(token_data.token)
        access_token = create_access_token(data={"sub": user.email})
        return {"access_token": access_token, "token_type": "bearer"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

# --- User Endpoints ---
@app.get("/api/users/me", response_model=UserResponse, tags=["Users"])
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

# --- Task Endpoints ---
@app.get("/api/tasks", response_model=List[TaskResponse], tags=["Tasks"])
async def get_tasks(
    current_user: User = Depends(get_current_user),
    task_service: TaskService = Depends(get_task_service)
):
    return await task_service.get_user_tasks(current_user)

# ... (POST, PUT, DELETE endpoints for tasks are the same) ...
@app.post("/api/tasks", response_model=TaskResponse, status_code=201, tags=["Tasks"])
async def add_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    task_service: TaskService = Depends(get_task_service)
):
    return await task_service.create_user_task(current_user, task_data)

@app.put("/api/tasks/{task_id}", response_model=TaskResponse, tags=["Tasks"])
async def update_task(
    task_id: str,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_user),
    task_service: TaskService = Depends(get_task_service)
):
    updated_task = await task_service.update_user_task(current_user, task_id, task_data)
    if not updated_task:
        raise HTTPException(status_code=404, detail="Task not found or permission denied")
    return updated_task

@app.delete("/api/tasks/{task_id}", status_code=204, tags=["Tasks"])
async def delete_task(
    task_id: str,
    current_user: User = Depends(get_current_user),
    task_service: TaskService = Depends(get_task_service)
):
    success = await task_service.delete_user_task(current_user, task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found or permission denied")
    return None

@app.get("/api/tasks/export", tags=["Tasks"])
async def export_tasks_as_pdf(
    current_user: User = Depends(get_current_user),
    task_service: TaskService = Depends(get_task_service)
):
    """Exports all tasks for the current user as a formatted PDF file."""
    
    tasks = await task_service.get_user_tasks(current_user)
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    
    elements = []

    # --- Document Header ---
    today = datetime.now()
    elements.append(Paragraph("THE TO-DO LIST", styles['h1']))
    elements.append(Paragraph(f"THINGS TO DO TODAY: DAY {today.strftime('%A')} DATE {today.strftime('%d %B %Y')}", styles['Normal']))
    elements.append(Paragraph(f"USER: {current_user.username}", styles['Normal']))
    elements.append(Spacer(1, 24))

    # --- Table Data ---
    data = [['Priority A/B/C?', 'Task', 'Time Needed', 'Done?']]
    for task in tasks:
        priority_text = task.priority.value if task.priority else ''
        time_text = task.scheduled_time if task.scheduled_time else ''
        done_text = "Yes" if task.done else "No"
        task_title_paragraph = Paragraph(task.title, styles['Normal'])
        data.append([priority_text, task_title_paragraph, time_text, done_text])

    # --- Table Creation & Styling ---
    table = Table(data, colWidths=[1.2*72, 3.3*72, 1*72, 0.8*72]) 
    style = TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.grey),
        ('TEXTCOLOR',(0,0),(-1,0),colors.whitesmoke),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,0), 12),
        ('BACKGROUND', (0,1), (-1,-1), colors.beige),
        ('GRID', (0,0), (-1,-1), 1, colors.black)
    ])
    table.setStyle(style)
    
    elements.append(table)
    doc.build(elements)
    
    buffer.seek(0)
    
    return Response(
        content=buffer.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=tasks_{current_user.id}.pdf"}
    )