import React, { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import './App.css';

// 1. API CONFIGURATION & INTERCEPTOR
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost/api",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. AUTHENTICATION CONTEXT
const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const response = await api.get('/users/me');
          setUser(response.data);
        } catch (error) {
          console.error("Failed to fetch user. Token might be invalid.", error);
          logOut();
        }
      } else {
        setUser(null);
      }
    };
    fetchUser();
  }, [token]);

  const loginAction = async (googleToken) => {
    try {
      const response = await api.post('/auth/google/login', { token: googleToken });
      const newToken = response.data.access_token;
      setToken(newToken);
      localStorage.setItem('token', newToken);
      const origin = location.state?.from?.pathname || '/app';
      navigate(origin);
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  const logOut = () => {
    setToken(null);
    localStorage.removeItem('token');
    navigate('/login');
  };
  
  return (
    <AuthContext.Provider value={{ token, user, loginAction, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. PAGE COMPONENTS
function LoginPage() {
  const { loginAction } = useContext(AuthContext);

  const handleSuccess = (credentialResponse) => {
    if (credentialResponse.credential) {
      loginAction(credentialResponse.credential);
    }
  };
  
  return (
    <div className="App">
      <header className="App-header">
        <h1>To-Do List Manager</h1>
        <p>Please log in to continue</p>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => {
            console.log('Login Failed');
          }}
        />
      </header>
    </div>
  );
}

function ToDoListPage() {
  const { logOut, user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newPriority, setNewPriority] = useState('C');
  const [newTime, setNewTime] = useState('');
  const [error, setError] = useState(null);

  const fetchTasks = async () => {
    try {
      setError(null);
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (err) {
      setError("Could not fetch tasks.");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);
  
  const handleAddTask = async (e) => {
      e.preventDefault();
      if (!newTaskTitle.trim()) return;
      try {
          const payload = {
            title: newTaskTitle,
            priority: newPriority,
            scheduled_time: newTime || null
          };
          await api.post('/tasks', payload);
          setNewTaskTitle('');
          setNewPriority('C');
          setNewTime('');
          fetchTasks();
      } catch (err) {
          setError("Failed to add task.");
      }
  };
  
  const handleToggleDone = async (task) => {
    try {
        await api.put(`/tasks/${task.id}`, { done: !task.done });
        fetchTasks();
    } catch (err) {
        setError("Failed to update task.");
    }
  };

  const handleDelete = async (taskId) => {
      try {
          await api.delete(`/tasks/${taskId}`);
          fetchTasks();
      } catch (err) {
          setError("Failed to delete task.");
      }
  };


  const handleExport = async () => {
    try {
        const response = await api.get('/tasks/export', { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'tasks.pdf');
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (err) {
        setError("Failed to export tasks.");
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        {/* --- show Welcome + username --- */}
        {user && <h2 className="welcome-message">Welcome, {user.username}!</h2>}
        <h1>My To-Do List</h1>
        <div className="action-bar">
          <button onClick={handleExport}>Export as PDF</button>
          <button onClick={logOut} className="logout-button">Log Out</button>
        </div>
        {error && <p className="error">{error}</p>}
        {/* --- updated form --- */}
        <form onSubmit={handleAddTask} className="task-form">
          <input type="text" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} placeholder="Enter a new task..." />
          <select value={newPriority} onChange={(e) => setNewPriority(e.target.value)}>
            <option value="A">High Priority</option>
            <option value="B">Medium Priority</option>
            <option value="C">Low Priority</option>
          </select>
          <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
          <button type="submit">Add Task</button>
        </form>
        {/* --- Task list updated --- */}
        <ul className="task-list">
          {tasks.map((task) => (
            <li key={task.id} className={`${task.done ? 'done' : ''} priority-${task.priority}`}>
              <div className="task-details">
                <span className="task-priority">{task.priority}</span>
                <span className="task-title" onClick={() => handleToggleDone(task)}>{task.title}</span>
                <span className="task-time">{task.scheduled_time}</span>
              </div>
              <button className="delete" onClick={() => handleDelete(task.id)}>❌</button>
            </li>
          ))}
        </ul>
      </header>
    </div>
  );
}

// 4. ROUTING & APP ENTRY POINT
function ProtectedRoute({ children }) {
  const { token } = useContext(AuthContext);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/app" 
          element={
            <ProtectedRoute>
              <ToDoListPage />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/app" />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;