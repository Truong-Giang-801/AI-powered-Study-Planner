import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TaskForm.css'; // Import the CSS file

const TaskForm = ({ onTaskCreated, onTaskUpdated, task }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [priority, setPriority] = useState('Medium');

    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description);
            setDueDate(task.dueDate.split('T')[0]); // Format date for input[type="date"]
            setPriority(task.priority);
        }
    }, [task]);

    const mapStatusEnumToStatus = (statusEnum) => {
        switch (statusEnum) {
            case 0:
                return 'Expired';
            case 1:
                return 'Todo';
            case 2:
                return 'Doing';
            case 3:
                return 'Done';
            default:
                return 'Todo';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Ensure all fields are filled
        if (!title || !description || !dueDate) {
            alert("Please fill out all fields");
            return;
        }
    
        const statusEnum = task ? task.statusEnum : 1; // Default to 'Todo' if creating a new task
        const newTask = {
            title,
            description,
            dueDate: new Date(dueDate).toISOString(),
            status: mapStatusEnumToStatus(statusEnum),
            statusEnum: statusEnum,
            isCompleted: task ? task.isCompleted : false,
            priority,
        };
    
        try {
            if (task) {
                await axios.put(`http://localhost:5251/api/tasks/${task.id}`, newTask);
                onTaskUpdated({ ...newTask, id: task.id });
            } else {
                const response = await axios.post('http://localhost:5251/api/tasks', newTask);
                console.log('Response:', response);  // Log the response
                alert('Task created successfully!');
                onTaskCreated(newTask);
            }
            // Clear form after submission
            setTitle('');
            setDescription('');
            setDueDate('');
            setPriority('Medium');
        } catch (error) {
            console.error('Error creating/updating task:', error);
            alert('Error creating/updating task');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="task-form">
            <h2>{task ? 'Update Task' : 'Create Task'}</h2>
            
            <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="task-input"
            />
            
            <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="task-textarea"
            ></textarea>
            
            <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="task-input"
            />
            
            <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                required
                className="task-select"
            >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
            </select>
            
            <button type="submit" className="task-button">{task ? 'Update Task' : 'Create Task'}</button>
        </form>
    );
};

export default TaskForm;