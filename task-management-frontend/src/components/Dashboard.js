import React, { useState, useEffect, useCallback } from 'react';
import { getAuth } from 'firebase/auth';
import axios from 'axios';
import { Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Grid,
    Typography,
    CircularProgress,
    createTheme,
    ThemeProvider,
} from '@mui/material';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const theme = createTheme({
    palette: {
        primary: { main: '#1976d2' },
        secondary: { main: '#f50057' },
    },
});
const generatePrompt = (tasks, statusCounts) => {
    let prompt = `You are a task management assistant. Analyze the user's tasks based on a 25-minute estimated time per task. Provide the following feedback:
    - Areas where the user is excelling.
    - Subjects or tasks that may need more attention.
    - Motivational feedback to encourage consistency and improvement.\n\n`;

    prompt += `Overall Statistics:\n`;
    prompt += `- Total Tasks: ${tasks.length}\n`;
    prompt += `- Completed Tasks: ${statusCounts.done}\n`;
    prompt += `- Tasks In Progress: ${statusCounts.doing}\n`;
    prompt += `- Pending Tasks: ${statusCounts.todo}\n\n`;

    Object.keys(statusCounts).forEach(status => {
        const filteredTasks = tasks.filter(task => task.status.toLowerCase() === status);
        if (filteredTasks.length > 0) {
            prompt += `${status.toUpperCase()} TASKS (${statusCounts[status]}):\n`;
            filteredTasks.forEach(task => {
                const focusMinutes = Math.round(task.focusTime / 60);
                const dueDate = new Date(task.dueDate._seconds * 1000).toLocaleDateString();
                prompt += `- ${task.title} (Due: ${dueDate}, Priority: ${task.priority}, Focus Time: ${focusMinutes} minutes, Estimated Time: 25 minutes)\n`;
            });
            prompt += '\n';
        }
    });

    prompt += `Provide insights on the following:\n`;
    prompt += `1. Areas where the user is excelling based on timely completion or high focus time.\n`;
    prompt += `2. Subjects or tasks requiring more attention, such as overdue or low-priority tasks left unfinished.\n`;
    prompt += `3. Motivational feedback to encourage consistency and improvement.\n`;

    return prompt;
};


const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [focusData, setFocusData] = useState([]);
    const [taskStatusData, setTaskStatusData] = useState({});
    const [analysisFeedback, setAnalysisFeedback] = useState('');
    const auth = getAuth();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user);
        });
        return () => unsubscribe();
    }, [auth]);

    const analyzeSchedule = useCallback(async (tasks, statusCounts) => {
        try {
            const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
            if (!apiKey) throw new Error('API key is missing');
    
            const prompt = generatePrompt(tasks, statusCounts);
            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
                {
                    contents: [{ parts: [{ text: prompt }] }],
                },
                { headers: { 'Content-Type': 'application/json' } }
            );
    
            const feedback = response.data.candidates[0].content.parts[0].text;
            setAnalysisFeedback(feedback);
        } catch (error) {
            console.error('Error analyzing schedule:', error);
            setAnalysisFeedback('Failed to analyze schedule. Please try again later.');
        }
    }, []);
    
    useEffect(() => {
        if (!user) return;
    
        const fetchData = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/api/tasks`);
                const tasks = response.data.filter(task => task.userId === user.uid);
    
                const focusTimeData = Array(7).fill(0);
                const statusCounts = { expired: 0, todo: 0, doing: 0, done: 0 };
    
                const today = new Date();
                const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
                const daysFromLastSunday = currentDay;
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - daysFromLastSunday - 1);
    
                let totalTimeSpent = 0;
                let totalEstimatedTime = tasks.length * 25 * 60; // 25 minutes per task in seconds
    
                tasks.forEach(task => {
                    totalTimeSpent += task.focusTime;
                    totalEstimatedTime += task.estimatedTime || 0;
    
                    if (task.focusSessions) {
                        task.focusSessions.forEach(session => {
                            const sessionDate = new Date(session.date);
                            if (sessionDate >= startOfWeek && sessionDate <= today) {
                                const dayOfWeek = sessionDate.getDay();
                                focusTimeData[dayOfWeek] += session.duration;
                            }
                        });
                    }
    
                    statusCounts[task.status.toLowerCase()] += 1;
                });
    
                setFocusData({ focusTimeData, totalTimeSpent, totalEstimatedTime });
                setTaskStatusData(statusCounts);
                await analyzeSchedule(tasks, statusCounts);
            } catch (error) {
                console.error('Error fetching tasks:', error);
            }
        };
    
        fetchData();
    }, [user, analyzeSchedule]);
    

    

    
    

    if (!user) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <ThemeProvider theme={theme}>
            <Box p={2}>
                <Typography variant="h4" gutterBottom>
                    Welcome, {user.email}!
                </Typography>

                <Grid container spacing={3}>
                    {/* Focus Time Chart */}
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardHeader title="Weekly Focus Time" />
                            <CardContent>
                                <Line
                                    data={{
                                        labels: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                                        datasets: [
                                            {
                                                label: 'Focus Time (seconds)',
                                                data: focusData.focusTimeData || [],
                                                backgroundColor: 'rgb(75, 192, 192)',
                                                borderColor: 'rgba(75, 192, 192, 0.2)',
                                            },
                                        ],
                                    }}
                                />
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Task Status Distribution */}
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardHeader title="Task Status Distribution" />
                            <CardContent>
                                <Pie
                                    data={{
                                        labels: ['Expired', 'Todo', 'Doing', 'Done'],
                                        datasets: [
                                            {
                                                data: Object.values(taskStatusData),
                                                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
                                            },
                                        ],
                                    }}
                                />
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Time Analysis */}
                    <Grid item xs={12}>
                    <Card>
    <CardHeader title="Time Analysis" />
    <CardContent>
        <Typography>Total Time Spent: {Math.round(focusData.totalTimeSpent / 60)} minutes</Typography>
        <Typography>Total Estimated Time: {Math.round(focusData.totalEstimatedTime / 60)} minutes</Typography>
        <Typography>
            Efficiency: {focusData.totalEstimatedTime > 0 
                ? `${Math.round((focusData.totalTimeSpent / focusData.totalEstimatedTime) * 100)}%`
                : 'N/A'}
        </Typography>
    </CardContent>
</Card>
                    </Grid>

                    {/* AI Feedback */}
                    <Grid item xs={12}>
                        <Card>
                            <CardHeader title="AI Feedback" />
                            <CardContent>
                                <Typography>{analysisFeedback}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </ThemeProvider>
    );
};

export default Dashboard;
