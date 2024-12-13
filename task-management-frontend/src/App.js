import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Calendar from './components/Calendar';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import Timer from './components/Timer';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import Header from './components/Header';
import './styles.css';
import { getAuth } from 'firebase/auth';

const App = () => {
    const [user, setUser] = useState(null);
    const auth = getAuth();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user);
        });

        return () => unsubscribe();
    }, [auth]);

    return (
        <Router>
            <div className="App">
                {user && <Header user={user} />}
                <Routes>
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/tasks" element={<TaskList />} />
                    <Route path="/create-task" element={<TaskForm />} />
                    <Route path="/timer" element={<Timer />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="*" element={<Navigate to="/login" />} /> {/* Redirect to login */}
                </Routes>
            </div>
        </Router>
    );
};

export default App;
