import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Calendar from './components/Calendar';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import Timer from './components/Timer';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import LinkGoogle from './components/LinkGoogle.js';
import Header from './components/Header';
import UnlinkGoogle from './components/UnlinkGoogle.js';
import Profile from './components/Profile.js';
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
                    <Route path="/calendar" element={user ? <Calendar /> : <Navigate to="/login" />} />
                    <Route path="/tasks" element={user ? <TaskList /> : <Navigate to="/login" />} />
                    <Route path="/create-task" element={user ? <TaskForm /> : <Navigate to="/login" />} />
                    <Route path="/timer" element={user ? <Timer /> : <Navigate to="/login" />} />
                    <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
                    <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />

                    <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
                    <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
                    <Route path="/link-google" element={user ? <LinkGoogle /> : <Navigate to="/login" />} />
                    <Route path="/unlink-google" element={user ? <UnlinkGoogle /> : <Navigate to="/login" />} />
                    <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;