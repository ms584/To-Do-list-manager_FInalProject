import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import './App.css';

// --- API CONFIGURATION & INTERCEPTOR ---
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
  (error) => Promise.reject(error)
);

// --- AUTHENTICATION CONTEXT ---
const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const logOut = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    navigate('/login');
  }, [navigate]);

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
  }, [token, logOut]);

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
  
  return (
    <AuthContext.Provider value={{ token, user, loginAction, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- PAGE COMPONENTS ---
function LoginPage() {
  const { loginAction } = useContext(AuthContext);
  const handleSuccess = (credentialResponse) => {
    if (credentialResponse.credential) loginAction(credentialResponse.credential);
  };
  return (
    <div className="App"><header className="App-header">
      <h1>To-Do List Manager</h1><p>Please log in to continue</p>
      <GoogleLogin onSuccess={handleSuccess} onError={() => console.log('Login Failed')} />
    </header></div>
  );
}

function DailyPlannerPage() {
  const { logOut, user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newPriority, setNewPriority] = useState('C');
  const [newTime, setNewTime] = useState('');
  const [error, setError] = useState(null);

  const formatDateForApi = (date) => format(date, 'yyyy-MM-dd');

  useEffect(() => {
    const fetchTasks = async () => {
      if (user) {
        try {
          setError(null);
          const dateString = formatDateForApi(selectedDate);
          const response = await api.get(`/logs/${dateString}`);
          setTasks(response.data);
        } catch (err) {
          setTasks([]);
          setError("Could not fetch tasks for the selected date.");
        }
      }
    };
    fetchTasks();
  }, [user, selectedDate]);

  // --- REFACTORED HANDLERS ---
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      const dateString = formatDateForApi(selectedDate);
      const payload = { title: newTaskTitle, priority: newPriority, scheduled_time: newTime || null };
      const response = await api.post(`/logs/${dateString}/tasks`, payload);
      
      // Update state directly from the response - no need to refetch!
      setTasks(prevTasks => [...prevTasks, response.data]);
      
      setNewTaskTitle('');
      setNewPriority('C');
      setNewTime('');
    } catch (err) {
      setError("Failed to add task.");
    }
  };

  const handleToggleDone = async (task) => {
    try {
      const dateString = formatDateForApi(selectedDate);
      const response = await api.put(`/logs/${dateString}/tasks/${task.id}`, { done: !task.done });
      const updatedTask = response.data;

      // Update the specific task in the state
      setTasks(prevTasks => prevTasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    } catch (err) {
      setError("Failed to update task.");
    }
  };

  const handleDelete = async (taskId) => {
    try {
      const dateString = formatDateForApi(selectedDate);
      await api.delete(`/logs/${dateString}/tasks/${taskId}`);
      
      // Remove the task from the state
      setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
    } catch (err) {
      setError("Failed to delete task.");
    }
  };
  
  const handleExport = async () => {
  try {
    setError(null);
    const dateString = formatDateForApi(selectedDate);
    const response = await api.get(`/logs/${dateString}/export`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `tasks-${dateString}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    setError("Failed to export tasks. There might be no tasks for this day.");
    console.error("Export error:", err);
  }
};

  return (
    <div className="App">
      <header className="App-header">
        {user && <h2 className="welcome-message">Welcome, {user.username}!</h2>}
        <h1>My To-Do List</h1>
        <div className="date-picker-container">
          <label>Select Date: </label>
          <DatePicker selected={selectedDate} onChange={(date) => setSelectedDate(date)} />
        </div>
        <div className="action-bar">
          <button onClick={handleExport}>Export as PDF</button>
          <button onClick={logOut} className="logout-button">Log Out</button>
        </div>
        {error && <p className="error">{error}</p>}
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

// --- ROUTING & APP ENTRY POINT ---
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
        <Route path="/app" element={<ProtectedRoute><DailyPlannerPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/app" />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;