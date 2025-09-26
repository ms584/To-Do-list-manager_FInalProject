from fastapi.testclient import TestClient
import os
import json
from main import app, FILENAME

# Create a TestClient instance
client = TestClient(app)

# --- Test Setup & Teardown ---
def setup_function():
    """Create a clean tasks.json before each test."""
    if os.path.exists(FILENAME):
        os.remove(FILENAME)

def teardown_function():
    """Clean up tasks.json after each test."""
    if os.path.exists(FILENAME):
        os.remove(FILENAME)

# --- Tests ---
def test_get_tasks_empty():
    response = client.get("/api/tasks")
    assert response.status_code == 200
    assert response.json() == []

def test_add_task():
    response = client.post("/api/tasks", json={"title": "Test adding a task"})
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test adding a task"
    assert data["done"] is False
    assert "id" in data

    # Verify it was saved
    response_get = client.get("/api/tasks")
    assert len(response_get.json()) == 1

def test_delete_task():
    # First, add a task to delete
    add_response = client.post("/api/tasks", json={"title": "Task to be deleted"})
    task_id = add_response.json()["id"]

    # Now, delete it
    delete_response = client.delete(f"/api/tasks/{task_id}")
    assert delete_response.status_code == 204 # 204 means No Content

    # Verify it's gone
    get_response = client.get("/api/tasks")
    assert get_response.json() == []

def test_update_task():
    # Add a task
    add_response = client.post("/api/tasks", json={"title": "Task to update"})
    task_id = add_response.json()["id"]

    # Update it (mark as done)
    update_response = client.put(f"/api/tasks/{task_id}")
    assert update_response.status_code == 200
    assert update_response.json()["done"] is True

    # Verify the change
    get_response = client.get("/api/tasks")
    assert get_response.json()[0]["done"] is True