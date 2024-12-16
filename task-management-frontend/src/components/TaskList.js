import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import TaskForm from './TaskForm';
import './TaskList.css'; // Import the CSS file

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

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axios.get('http://localhost:5251/api/tasks', {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                const today = new Date();
                const categorizedTasks = {
                    expired: [],
                    todo: [],
                    doing: [],
                    done: [],
                };

                for (const task of response.data) {
                    const dueDate = new Date(task.dueDate);
                    if (!task.isCompleted && dueDate < today) {
                        task.status = 'Expired';
                        task.statusEnum = 0;
                        await axios.put(`http://localhost:5251/api/tasks/${task.id}`, {
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
                    }
                }

                setTasks(categorizedTasks);
            } catch (error) {
                console.error('Error fetching tasks:', error);
            }
        };

        fetchTasks();
    }, []);

    const formatDueDate = (dueDate) => {
        const date = new Date(dueDate);
        return date.toLocaleDateString('en-US');
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
                updatedTask.isCompleted = isChecked;
                updatedTask.status = isChecked ? 'Done' : 'Todo';
                updatedTask.statusEnum = isChecked ? 3 : 1;

                if (isChecked) {
                    updatedTasks.done.push(updatedTask);
                } else {
                    updatedTasks.todo.push(updatedTask);
                }

                setTasks(updatedTasks);

                await axios.put(`http://localhost:5251/api/tasks/${taskId}`, {
                    ...updatedTask,
                    isCompleted: isChecked,
                    status: updatedTask.status,
                    statusEnum: updatedTask.statusEnum,
                });
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

            await axios.delete(`http://localhost:5251/api/tasks/${taskId}`);
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const handleEditTask = (task) => {
        setEditingTask(task);
        setShowTaskForm(true);
    };

    const handleTaskUpdated = (updatedTask) => {
        setTasks(prevTasks => {
            const updatedTasks = { ...prevTasks };
            for (let status in updatedTasks) {
                const taskIndex = updatedTasks[status].findIndex(task => task.id === updatedTask.id);
                if (taskIndex !== -1) {
                    updatedTasks[status][taskIndex] = updatedTask;
                    break;
                }
            }
            return updatedTasks;
        });

        setShowTaskForm(false);
        setEditingTask(null);
    };

    const onDragEnd = async (result) => {
        const { destination, source } = result;

        if (!destination) return;

        // Prevent dragging expired tasks and dragging tasks to the expired or done column
        if (source.droppableId === 'expired' || destination.droppableId === 'expired' || destination.droppableId === 'done') {
            return;
        }

        if (destination.droppableId === source.droppableId && destination.index === source.index) {
            return;
        }

        const sourceColumn = Array.from(tasks[source.droppableId]);
        const destinationColumn = Array.from(tasks[destination.droppableId]);
        const [movedTask] = sourceColumn.splice(source.index, 1);
        destinationColumn.splice(destination.index, 0, movedTask);

        movedTask.statusEnum = destination.droppableId === 'todo' ? 1 :
                               destination.droppableId === 'doing' ? 2 : 3;

        setTasks({
            ...tasks,
            [source.droppableId]: sourceColumn,
            [destination.droppableId]: destinationColumn,
        });

        try {
            await axios.put(`http://localhost:5251/api/tasks/${movedTask.id}`, movedTask);
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
            const apiKey = "AIzaSyDa2vNzWPIPM82QLb1Vzs9-2LwdosTNh4c"; // Use environment variable
            if (!apiKey) {
                throw new Error('API key is missing');
            }
            const prompt = generatePrompt(tasks);

            const response = await axios.post(
                'https://api.gemini.ai/v1/chat/completions', // Updated endpoint for GeminiAI
                {
                    model: 'gemini-3.5-turbo',
                    messages: [
                        { role: 'system', content: 'You are a task management assistant. Analyze the following tasks and provide feedback including warnings about tight schedules and prioritization recommendations for balance and focus.' },
                        { role: 'user', content: prompt }
                    ],
                    max_tokens: 500,
                    temperature: 0.7,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': apiKey, // Use the API key directly
                    },
                }
            );

            setAnalysisFeedback(response.data.choices[0].message.content);
        } catch (error) {
            console.error('Error analyzing schedule:', error);
            setAnalysisFeedback('Failed to analyze schedule. Please try again later.');
        }
    };

    const generatePrompt = (tasks) => {
        let prompt = "Analyze the following tasks and provide detailed feedback including warnings about tight schedules and prioritization recommendations for balance and focus:\n\n";

        for (const status in tasks) {
            prompt += `${status.toUpperCase()}:\n`;
            for (const task of tasks[status]) {
                prompt += `- ${task.title} (Due: ${task.dueDate}, Priority: ${task.priority})\n`;
            }
            prompt += '\n';
        }

        return prompt;
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
                return new Date(a.dueDate) - new Date(b.dueDate);
            } else {
                return new Date(b.dueDate) - new Date(a.dueDate);
            }
        });
        return acc;
    }, {});

    return (
        <div className="task-list-container">
            <h2 className="task-list-title">Task List</h2>
            <button className="create-task-button" onClick={() => setShowTaskForm(true)}>Create Task</button>
            <button className="analyze-schedule-button" onClick={analyzeSchedule}>Analyze Schedule</button>
            {analysisFeedback && <div className="analysis-feedback">{analysisFeedback}</div>}
            {showTaskForm && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close-button" onClick={() => setShowTaskForm(false)}>&times;</span>
                        <TaskForm onTaskCreated={handleTaskCreated} onTaskUpdated={handleTaskUpdated} task={editingTask} />
                    </div>
                </div>
            )}
            <div className="task-filters">
                <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="task-search"
                />
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="task-filter"
                >
                    <option value="all">All</option>
                    <option value="Todo">Todo</option>
                    <option value="Doing">Doing</option>
                    <option value="Done">Done</option>
                    <option value="Expired">Expired</option>
                </select>
                <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="task-filter"
                >
                    <option value="all">All</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                </select>
                <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="task-sort"
                >
                    <option value="asc">Due Date Ascending</option>
                    <option value="desc">Due Date Descending</option>
                </select>
            </div>
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="task-columns">
                    {['expired', 'todo', 'doing', 'done'].map((status) => (
                        <Droppable droppableId={status} key={status}>
                            {(provided) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`task-column ${status}`}
                                >
                                    <h3>{status.charAt(0).toUpperCase() + status.slice(1)}</h3>
                                    {sortedTasks[status].map((task, index) => (
                                        <Draggable key={task.id} draggableId={task.id} index={index} isDragDisabled={status === 'expired'}>
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className="task-item"
                                                    onClick={() => handleEditTask(task)}
                                                >
                                                    <div className="task-details">
                                                        <strong>{task.title}</strong> - {task.description}
                                                    </div>
                                                    <div className="due-date">
                                                        <span>Due: {formatDueDate(task.dueDate)}</span>
                                                    </div>
                                                    <div className="priority">
                                                        <span>Priority: {task.priority}</span>
                                                    </div>
                                                    <div className="completed">
                                                        <label>
                                                            <input
                                                                type="checkbox"
                                                                checked={task.isCompleted}
                                                                onChange={(e) =>
                                                                    handleCheckboxChange(task.id, e.target.checked)
                                                                }
                                                            />
                                                            {task.isCompleted ? 'Completed' : 'Incomplete'}
                                                        </label>
                                                    </div>
                                                    <div className="delete-button">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteTask(task.id);
                                                            }}
                                                            className="delete-btn"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    ))}
                </div>
            </DragDropContext>
        </div>
    );
};

export default TaskList;