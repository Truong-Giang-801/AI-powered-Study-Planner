import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TaskList = () => {
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axios.get('http://localhost:5251/api/tasks', {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                setTasks(response.data);
            } catch (error) {
                console.error('Error fetching tasks:', error);
            }
        };

        fetchTasks();
    }, []);

    // Format the due date
    const formatDueDate = (dueDate) => {
        const date = new Date(dueDate);
        return date.toLocaleDateString('en-US');
    };

    // Handle checkbox change
    const handleCheckboxChange = async (taskId, isChecked) => {
        try {
            // Update the task locally
            setTasks(prevTasks =>
                prevTasks.map(task =>
                    task.id === taskId ? { ...task, isCompleted: isChecked } : task
                )
            );

            // Send the updated task (with the full task data) to the server
            const updatedTask = tasks.find(task => task.id === taskId);
            await axios.put(`http://localhost:5251/api/tasks/${taskId}`, {
                ...updatedTask,
                isCompleted: isChecked,  // Ensure only this field is updated
            });
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    // Handle delete task
    const handleDeleteTask = async (taskId) => {
        try {
            // Delete the task locally
            setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));

            // Send delete request to the server
            await axios.delete(`http://localhost:5251/api/tasks/${taskId}`);
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Task List</h2>
            <ul style={styles.taskList}>
                {tasks.map(task => (
                    <li key={task.id} style={styles.taskItem}>
                        <div style={styles.taskDetails}>
                            <strong>{task.title}</strong> - {task.description}
                        </div>
                        <div style={styles.dueDate}>
                            <span>Due: {formatDueDate(task.dueDate)}</span>
                        </div>
                        <div style={styles.completed}>
                            <label>
                                <input 
                                    type="checkbox" 
                                    checked={task.isCompleted} 
                                    onChange={(e) => handleCheckboxChange(task.id, e.target.checked)} 
                                />
                                {task.isCompleted ? 'Completed' : 'Incompleted'}
                            </label>
                        </div>
                        <div style={styles.deleteButton}>
                            <button 
                                onClick={() => handleDeleteTask(task.id)} 
                                style={styles.deleteBtn}
                            >
                                Delete
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px',
        backgroundColor: '#f4f4f4',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    title: {
        textAlign: 'center',
        fontSize: '24px',
        color: '#333',
    },
    taskList: {
        listStyleType: 'none',
        padding: '0',
        marginTop: '20px',
    },
    taskItem: {
        padding: '10px',
        marginBottom: '10px',
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    taskDetails: {
        marginBottom: '10px',
    },
    dueDate: {
        fontSize: '14px',
        color: '#555',
        marginBottom: '5px',
    },
    completed: {
        fontSize: '14px',
        color: '#555',
    },
    deleteButton: {
        marginTop: '10px',
    },
    deleteBtn: {
        padding: '6px 12px',
        backgroundColor: '#ff4d4d',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    }
};

export default TaskList;
