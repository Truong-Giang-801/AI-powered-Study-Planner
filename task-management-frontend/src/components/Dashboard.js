import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
import { Button, ButtonGroup } from '@mui/material';

// Register the necessary scales and elements with Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [completedTasksData, setCompletedTasksData] = useState([]);
    const [view, setView] = useState('month'); // State to track the current view (month or week)
    const auth = getAuth();

    useEffect(() => {
        // Subscribe to auth state changes
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user);
        });

        return () => unsubscribe();
    }, [auth]);

    useEffect(() => {
        if (!user) return;

        // Fetch completed tasks data (change URL as needed)
        axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/api/tasks`) // Replace with your tasks API endpoint
            .then((response) => {
                // Process the data to count completed tasks per month or week
                const tasks = response.data;
                const completedTasksCount = view === 'month' ? Array(12).fill(0) : Array(7).fill(0); // Initialize an array to store completed tasks per month or week

                const today = new Date();
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - today.getDay()); // Get the start of the current week (Sunday)

                tasks.forEach(task => {
                    if (task.userId !== user.uid) return;

                    const dueDate = new Date(task.dueDate);
                    if (task.isCompleted) {
                        if (view === 'month') {
                            const month = dueDate.getMonth(); // Get the month (0 = January, 1 = February, etc.)
                            completedTasksCount[month] += 1; // Increment the completed task count for the respective month
                        } else {
                            if (dueDate >= startOfWeek && dueDate <= today) {
                                const dayOfWeek = dueDate.getDay(); // Get the day of the week (0 = Sunday, 1 = Monday, etc.)
                                completedTasksCount[dayOfWeek] += 1; // Increment the completed task count for the respective day of the week
                            }
                        }
                    }
                });

                setCompletedTasksData(completedTasksCount);
            })
            .catch((error) => console.error('Error fetching tasks data:', error));
    }, [user, view]);

    const data = {
        labels: view === 'month' 
            ? ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], // Day labels for the current week
        datasets: [
            {
                label: 'Completed Tasks',
                data: completedTasksData, // Update with the completed tasks data
                fill: false,
                backgroundColor: 'rgb(75, 192, 192)',
                borderColor: 'rgba(75, 192, 192, 0.2)',
            },
        ],
    };

    return (
        <div>
            <h2>Dashboard</h2>
            {user ? <p>Welcome, {user.email}!</p> : <p>Loading user info...</p>}
            <ButtonGroup variant="contained" aria-label="outlined primary button group">
                <Button onClick={() => setView('month')} disabled={view === 'month'}>Monthly View</Button>
                <Button onClick={() => setView('week')} disabled={view === 'week'}>Weekly View</Button>
            </ButtonGroup>
            <Line data={data} />
        </div>
    );
};

export default Dashboard;