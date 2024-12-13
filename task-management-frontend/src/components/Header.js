import React from 'react';
import { Link } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

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
        <header>
            <nav>
                <ul>
                    <li>
                        <Link to="/dashboard">Dashboard</Link>
                    </li>
                    <li>
                        <Link to="/tasks">Tasks</Link>
                    </li>
                    <li>
                        <Link to="/create-task">Create Task</Link>
                    </li>
                    <li>
                        <Link to="/calendar">Calendar</Link>
                    </li>
                    <li>
                        <Link to="/timer">Timer</Link>
                    </li>
                    {user && (
                        <li>
                            <button onClick={handleLogout}>Logout</button>
                        </li>
                    )}
                </ul>
            </nav>
            {user && <p>Welcome, {user.email}!</p>}
        </header>
    );
};

export default Header;
