import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { 
    Grid, 
    Box, 
    Button, 
    Typography, 
    Card, 
    CardContent, 
    TextField, 
    Select, 
    MenuItem, 
    Dialog,
    DialogTitle,
    DialogContent,
    FormControlLabel, 
    Checkbox, 
    IconButton 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import TaskForm from './TaskForm';
import TaskManagementFeedback from './TaskManagementFeedback';
import { UserContext } from '../context/UserContext';

const columnColors = {
    expired: { 
      background: 'rgba(255, 0, 0, 0.1)', 
      border: 'rgba(255, 0, 0, 0.3)' 
    },
    todo: { 
      background: 'rgba(0, 0, 255, 0.1)', 
      border: 'rgba(0, 0, 255, 0.3)' 
    },
    doing: { 
      background: 'rgba(255, 165, 0, 0.1)', 
      border: 'rgba(255, 165, 0, 0.3)' 
    },
    done: { 
      background: 'rgba(0, 255, 0, 0.1)', 
      border: 'rgba(0, 255, 0, 0.3)' 
    }
};

const TaskList = () => {
    const [tasks, setTasks] = useState({
        expired: [],
        todo: [],
        doing: [],
        done: [],
    });
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');
    const [sortOrder, setSortOrder] = useState('asc');
    const [analysisFeedback, setAnalysisFeedback] = useState('');
    const { user } = useContext(UserContext);

    useEffect(() => {
        const fetchTasks = async () => {
            if (!user) return;

            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/api/tasks`, {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                console.log('API Response:', response.data);

                const today = new Date();
                const categorizedTasks = {
                    expired: [],
                    todo: [],
                    doing: [],
                    done: [],
                };

                for (const task of response.data) {
                    if (task.userId !== user.uid) continue;

                    const dueDate = new Date(task.dueDate._seconds * 1000);
                    if (!task.isCompleted && dueDate < today) {
                        task.status = 'Expired';
                        task.statusEnum = 0;
                        await axios.put(`${process.env.REACT_APP_BACKEND_API_URL}/api/tasks/${task.id}`, {
                            ...task,
                            status: 'Expired',
                            statusEnum: 0,
                        });
                    }

                    if (task.statusEnum === 0) {
                        categorizedTasks.expired.push(task);
                    } else if (task.statusEnum === 1) {
                        categorizedTasks.todo.push(task);
                    } else if (task.statusEnum === 2) {
                        categorizedTasks.doing.push(task);
                    } else if (task.statusEnum === 3) {
                        categorizedTasks.done.push(task);
                    } else {
                        categorizedTasks.todo.push(task);
                    }
                }

                console.log('Categorized Tasks:', categorizedTasks);
                setTasks(categorizedTasks);
            } catch (error) {
                console.error('Error fetching tasks:', error);
            }
        };

        fetchTasks();
    }, [user]);

    const formatDueDate = (dueDate) => {
        const date = new Date(dueDate._seconds * 1000);
        return date.toLocaleDateString('en-US');
    };

    const updateTaskOnServer = async (task) => {
        try {
            await axios.put(`${process.env.REACT_APP_BACKEND_API_URL}/api/tasks/${task.id}`, task);
        } catch (error) {
            console.error('Error updating task on the server:', error);
        }
    };

    const handleCheckboxChange = async (taskId, isChecked) => {
        try {
            const updatedTasks = { ...tasks };
            let updatedTask;
    
            for (let status in updatedTasks) {
                const taskIndex = updatedTasks[status].findIndex(task => task.id === taskId);
                if (taskIndex !== -1) {
                    updatedTask = updatedTasks[status][taskIndex];
                    updatedTasks[status].splice(taskIndex, 1);
                    break;
                }
            }
    
            if (updatedTask) {
                const today = new Date();
                const dueDate = new Date(updatedTask.dueDate._seconds * 1000);
    
                updatedTask.isCompleted = isChecked;
                if (isChecked) {
                    updatedTask.status = 'Done';
                    updatedTask.statusEnum = 3;
                    updatedTasks.done.push(updatedTask);
                } else {
                    if (dueDate < today) {
                        updatedTask.status = 'Expired';
                        updatedTask.statusEnum = 0;
                        updatedTasks.expired.push(updatedTask);
                    } else {
                        updatedTask.status = 'Todo';
                        updatedTask.statusEnum = 1;
                        updatedTasks.todo.push(updatedTask);
                    }
                }
    
                setTasks(updatedTasks);
                await updateTaskOnServer(updatedTask);
            }
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            setTasks(prevTasks => {
                const updatedTasks = { ...prevTasks };
                for (let status in updatedTasks) {
                    updatedTasks[status] = updatedTasks[status].filter(task => task.id !== taskId);
                }
                return updatedTasks;
            });
    
            await axios.delete(`${process.env.REACT_APP_BACKEND_API_URL}/api/tasks/${taskId}`);
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const handleEditTask = async (updatedTask) => {
        try {
            const updatedTasks = { ...tasks };
            for (let status in updatedTasks) {
                const taskIndex = updatedTasks[status].findIndex(task => task.id === updatedTask.id);
                if (taskIndex !== -1) {
                    updatedTasks[status][taskIndex] = updatedTask;
                    break;
                }
            }
    
            setTasks(updatedTasks);
            await updateTaskOnServer(updatedTask);
        } catch (error) {
            console.error('Error editing task:', error);
        }
    };

    const handleTaskUpdated = (updatedTask) => {
        handleEditTask(updatedTask);
        setShowTaskForm(false);
        setEditingTask(null);
    };

    const onDragEnd = async (result) => {
        const { destination, source } = result;

        if (!destination) return;

        // Prevent dragging expired tasks and dragging tasks to the expired or done column
        if (source.droppableId === 'expired' || destination.droppableId === 'expired' || destination.droppableId === 'done' || source.droppableId === 'done') {
            return;
        }

        if (destination.droppableId === source.droppableId) {
            return;
        }

        const sourceColumn = Array.from(tasks[source.droppableId]);
        const destinationColumn = Array.from(tasks[destination.droppableId]);
        const [movedTask] = sourceColumn.splice(source.index, 1);
        destinationColumn.splice(destination.index, 0, movedTask);

        movedTask.statusEnum = destination.droppableId === 'todo' ? 1 :
                               destination.droppableId === 'doing' ? 2 : 3;
        movedTask.status = destination.droppableId.charAt(0).toUpperCase() + destination.droppableId.slice(1);
        setTasks({
            ...tasks,
            [source.droppableId]: sourceColumn,
            [destination.droppableId]: destinationColumn,
        });
            
        try {
            await axios.put(`${process.env.REACT_APP_BACKEND_API_URL}/api/tasks/${movedTask.id}`, movedTask);
        } catch (error) {
            console.error('Error updating task status on the server:', error);
        }
    };

    const handleTaskCreated = (newTask) => {
        setTasks(prevTasks => ({
            ...prevTasks,
            todo: [...prevTasks.todo, newTask],
        }));
        setShowTaskForm(false);
    };

    const analyzeSchedule = async () => {
        try {
            const apiKey = process.env.REACT_APP_GEMINI_API_KEY; // Use environment variable
            if (!apiKey) {
                throw new Error('API key is missing');
            }
            const prompt = generatePrompt(tasks);
            console.log('You are a task management assistant. Analyze the following tasks and provide feedback including warnings about tight schedules and prioritization recommendations for balance and focus.\n' + prompt);
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
            const headers = {
                'Content-Type': 'application/json',
            };

            const data = {
                contents: [
                {
                    parts: [{ text: 'You are a task management assistant. Analyze the following tasks and provide feedback including warnings about tight schedules and prioritization recommendations for balance and focus.\n' + prompt }],
                },
                ],
            };

            const res = await axios.post(apiUrl, data, { headers });
            const generatedText = res.data.candidates[0].content.parts[0].text;
            setAnalysisFeedback(generatedText);
        } catch (error) {
            console.error('Error analyzing schedule:', error);
            setAnalysisFeedback('Failed to analyze schedule. Please try again later.');
        }
    };

    const generatePrompt = (tasks) => {
        let prompt = "Provide feedback on potential adjustments, such as: Warning about overly tight schedules that may lead to burnout. Recommending prioritization changes for improved focus and balance.\n\n";

        for (const status in tasks) {
            prompt += `${status.toUpperCase()}:\n`;
            for (const task of tasks[status]) {
                prompt += `- ${task.title} (Due: ${formatDueDate(task.dueDate)}, Priority: ${task.priority}, Time spent on this task till now: ${task.focusTime} seconds)\n`;
            }
            prompt += '\n';
        }

        return prompt;
    };

    const calculateTotalFocusTime = (task) => {
        if (!task.focusSessions) return 0;
        return task.focusSessions.reduce((total, session) => total + session.duration, 0);
    };

    const filteredTasks = Object.keys(tasks).reduce((acc, status) => {
        acc[status] = tasks[status].filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilterStatus = filterStatus === 'all' || task.status === filterStatus;
            const matchesFilterPriority = filterPriority === 'all' || task.priority === filterPriority;
            return matchesSearch && matchesFilterStatus && matchesFilterPriority;
        });
        return acc;
    }, {});

    const sortedTasks = Object.keys(filteredTasks).reduce((acc, status) => {
        acc[status] = filteredTasks[status].sort((a, b) => {
            if (sortOrder === 'asc') {
                return new Date(a.dueDate._seconds * 1000) - new Date(b.dueDate._seconds * 1000);
            } else {
                return new Date(b.dueDate._seconds * 1000) - new Date(a.dueDate._seconds * 1000);
            }
        });
        return acc;
    }, {});

    return (
        <Box sx={{ padding: 3 }}>
            <Typography variant="h4" gutterBottom>Task List</Typography>
            
            <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                <Button 
                    variant="contained" 
                    onClick={() => {
                        setEditingTask(null);
                        setShowTaskForm(true);
                    }}
                >
                    Create Task
                </Button>
                <Button 
                    variant="outlined" 
                    onClick={analyzeSchedule}
                >
                    Analyze Schedule
                </Button>
            </Box>

            {analysisFeedback && (
                <TaskManagementFeedback analysisFeedback={analysisFeedback} />
            )}

            <Dialog open={showTaskForm} onClose={() => setShowTaskForm(false)}>
                <DialogTitle>
                    {editingTask ? 'Edit Task' : 'Create Task'}
                </DialogTitle>
                <DialogContent>
                    <TaskForm 
                        onTaskCreated={handleTaskCreated} 
                        onTaskUpdated={handleTaskUpdated} 
                        task={editingTask} 
                    />
                </DialogContent>
            </Dialog>

            <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                <TextField
                    label="Search tasks"
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    fullWidth
                />
                <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    variant="outlined"
                >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="Todo">Todo</MenuItem>
                    <MenuItem value="Doing">Doing</MenuItem>
                    <MenuItem value="Done">Done</MenuItem>
                    <MenuItem value="Expired">Expired</MenuItem>
                </Select>
                <Select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    variant="outlined"
                >
                    <MenuItem value="all">All Priorities</MenuItem>
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                </Select>
                <Select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    variant="outlined"
                >
                    <MenuItem value="asc">Due Date Ascending</MenuItem>
                    <MenuItem value="desc">Due Date Descending</MenuItem>
                </Select>
            </Box>

            <DragDropContext onDragEnd={onDragEnd}>
                <Grid container spacing={2}>
                    {['expired', 'todo', 'doing', 'done'].map((status) => (
                    <Grid item xs={12} sm={6} md={3} key={status}>
                        <Droppable droppableId={status}>
                        {(provided) => (
                            <Box 
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            sx={{ 
                                border: '1px solid', 
                                borderColor: columnColors[status].border, 
                                borderRadius: 2, 
                                padding: 2,
                                backgroundColor: columnColors[status].background
                            }}
                            >
                            <Typography variant="h6">
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </Typography>
                            {sortedTasks[status].map((task, index) => (
                                <Draggable 
                                key={task.id} 
                                draggableId={task.id} 
                                index={index} 
                                isDragDisabled={status === 'expired'}
                                >
                                {(provided) => (
                                    <Card 
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    sx={{ 
                                        marginBottom: 1,
                                        boxShadow: 2
                                    }}
                                    >
                                    <CardContent>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: '1.25rem' }}>
                                        {task.title}
                                        </Typography>
                                        <Typography variant="body2">
                                        {task.description}
                                        </Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="caption">
                                            Due: {formatDueDate(task.dueDate)}
                                        </Typography>
                                        <Typography variant="caption">
                                            Priority: {task.priority}
                                        </Typography>
                                        <Typography variant="caption">
                                            Focus Time: {Math.round(calculateTotalFocusTime(task) / 60)} minutes
                                        </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <FormControlLabel
                                            control={
                                            <Checkbox
                                                checked={task.isCompleted}
                                                onChange={(e) => handleCheckboxChange(task.id, e.target.checked)}
                                            />
                                            }
                                            label={task.isCompleted ? 'Completed' : 'Incomplete'}
                                        />
                                        <Box>
                                            <IconButton 
                                                onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingTask(task);
                                                setShowTaskForm(true);
                                                }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton 
                                                onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteTask(task.id);
                                                }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                        </Box>
                                    </CardContent>
                                    </Card>
                                )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                            </Box>
                        )}
                        </Droppable>
                    </Grid>
                    ))}
                </Grid>
            </DragDropContext>
        </Box>
    );
};

export default TaskList;