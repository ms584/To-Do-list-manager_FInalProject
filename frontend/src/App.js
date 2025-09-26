import React, { useState, useEffect } from 'react';
import './App.css';

// THIS IS THE LINE YOU WERE LOOKING FOR!
// We use "/api" because our Nginx server will proxy these requests to the backend.
//const API_URL = "/api"; 
// Change this line for local development without Docker
//const API_URL = "http://localhost:8000/api"; 
// to deploy
const API_URL = process.env.REACT_APP_API_URL || "http://localhost/api";

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [error, setError] = useState(null);

  // Function to fetch all tasks from the backend
  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/tasks`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setTasks(data);
      setError(null); // Clear any previous errors
    } catch (error) {
      setError("Could not fetch tasks. Is the backend running?");
      console.error("Fetch error:", error);
    }
  };

  // useEffect hook runs once when the component mounts
  useEffect(() => {
    fetchTasks();
  }, []);

  // Handle adding a new task
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTaskTitle }),
      });
      setNewTaskTitle(''); // Clear input field
      fetchTasks(); // Refresh the task list
    } catch (error) {
      setError("Failed to add task.");
      console.error("Add task error:", error);
    }
  };
  
  // Handle toggling a task's status
  const handleToggleDone = async (taskId) => {
    try {
      await fetch(`${API_URL}/tasks/${taskId}`, { method: 'PUT' });
      fetchTasks();
    } catch (error) {
      setError("Failed to update task status.");
      console.error("Update task error:", error);
    }
  };

  // Handle deleting a task
  const handleDelete = async (taskId) => {
    try {
      await fetch(`${API_URL}/tasks/${taskId}`, { method: 'DELETE' });
      fetchTasks();
    } catch (error) {
      setError("Failed to delete task.");
      console.error("Delete task error:", error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>To-Do List</h1>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleAddTask} className="task-form">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Enter a new task..."
          />
          <button type="submit">Add Task</button>
        </form>
        <ul className="task-list">
          {tasks.length === 0 ? (
            <p>No tasks yet. Add one above!</p>
          ) : (
            tasks.map((task) => (
              <li key={task.id} className={task.done ? 'done' : ''}>
                <span onClick={() => handleToggleDone(task.id)}>{task.title}</span>
                <div className="task-buttons">
                  <button className="delete" onClick={() => handleDelete(task.id)}>❌ Delete</button>
                </div>
              </li>
            ))
          )}
        </ul>
      </header>
    </div>
  );
}

export default App;