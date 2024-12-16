import React from 'react';
import { Link } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './Header.css'; // Import the CSS file

const Header = ({ user }) => {
    const navigate = useNavigate();
    const auth = getAuth();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login'); // Redirect to login page after logout
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <header className="header">
            <nav className="nav">
                <ul className="nav-list">
                    <li className="nav-item">
                        <Link to="/dashboard" className="nav-link">Dashboard</Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/tasks" className="nav-link">Tasks</Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/create-task" className="nav-link">Create Task</Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/calendar" className="nav-link">Calendar</Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/timer" className="nav-link">Timer</Link>
                    </li>
                    {user && (
                        <li className="nav-item">
                            <button onClick={handleLogout} className="logout-button">Logout</button>
                        </li>
                    )}
                </ul>
            </nav>
            {user && <p className="welcome-message">Welcome, {user.email}!</p>}
        </header>
    );
};

export default Header;