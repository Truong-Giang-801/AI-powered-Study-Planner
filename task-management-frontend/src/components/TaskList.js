import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const TaskList = () => {
    const [tasks, setTasks] = useState({
        todo: [],
        doing: [],
        done: [],
    });

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axios.get('http://localhost:5251/api/tasks', {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                // Assuming the API response contains a list of tasks with status fields
                const categorizedTasks = {
                    todo: response.data.filter(task => task.status === 'Todo'),
                    doing: response.data.filter(task => task.status === 'Doing'),
                    done: response.data.filter(task => task.status === 'Done'),
                };
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
            setTasks(prevTasks => {
                const updatedTasks = { ...prevTasks };
                for (let status in updatedTasks) {
                    const task = updatedTasks[status].find(task => task.id === taskId);
                    if (task) {
                        task.isCompleted = isChecked;
                    }
                }
                return updatedTasks;
            });

            const updatedTask = Object.values(tasks).flat().find(task => task.id === taskId);
            await axios.put(`http://localhost:5251/api/tasks/${taskId}`, {
                ...updatedTask,
                isCompleted: isChecked,
            });
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

    const onDragEnd = async (result) => {
        const { destination, source } = result;
    
        // If there's no destination (dropped outside a droppable area), do nothing
        if (!destination) return;
    
        // If the task hasn't moved to a new column, do nothing
        if (destination.droppableId === source.droppableId && destination.index === source.index) {
            return;
        }
    
        const sourceColumn = tasks[source.droppableId];
        const destinationColumn = tasks[destination.droppableId];
        const [movedTask] = sourceColumn.splice(source.index, 1);
        destinationColumn.splice(destination.index, 0, movedTask);
    
        // Map droppableId to status enum (0 for Todo, 1 for Doing, 2 for Done)
        movedTask.statusEnum = destination.droppableId === 'todo' ? 0 :
                               destination.droppableId === 'doing' ? 1 : 2;
    
        // Update the frontend state
        setTasks({
            ...tasks,
            [source.droppableId]: sourceColumn,
            [destination.droppableId]: destinationColumn,
        });
    
        // Update the task status in the backend (server)
        try {
            await axios.put(`http://localhost:5251/api/tasks/${movedTask.id}`, movedTask);
        } catch (error) {
            console.error('Error updating task status on the server:', error);
        }
    };
    
    
    
    

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Task List</h2>
            <DragDropContext onDragEnd={onDragEnd}>
                <div style={styles.columns}>
                    {['todo', 'doing', 'done'].map((status) => (
                        <Droppable droppableId={status} key={status}>
                            {(provided) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    style={{
                                        ...styles.column,
                                        backgroundColor:
                                            status === 'todo'
                                                ? '#f8d7da'
                                                : status === 'doing'
                                                ? '#cce5ff'
                                                : '#d4edda',
                                    }}
                                >
                                    <h3>{status.charAt(0).toUpperCase() + status.slice(1)}</h3>
                                    {tasks[status].map((task, index) => (
                                        <Draggable key={task.id} draggableId={task.id} index={index}>
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    style={{
                                                        ...provided.draggableProps.style,
                                                        ...styles.taskItem,
                                                        backgroundColor: '#fff',
                                                    }}
                                                >
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
                                                                onChange={(e) =>
                                                                    handleCheckboxChange(task.id, e.target.checked)
                                                                }
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

const styles = {
    container: {
        maxWidth: '1200px',
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
    columns: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '20px',
    },
    column: {
        width: '30%',
        padding: '20px',
        borderRadius: '5px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    taskItem: {
        padding: '10px',
        marginBottom: '10px',
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
