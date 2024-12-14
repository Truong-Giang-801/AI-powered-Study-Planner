import React, { useState } from 'react';
import axios from 'axios';

const TaskForm = ({ onTaskCreated }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [status, setStatus] = useState('Todo'); // Default to 'Todo'

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Ensure all fields are filled
        if (!title || !description || !dueDate) {
            alert("Please fill out all fields");
            return;
        }
    
        const newTask = {
            title,
            description,
            dueDate: new Date(dueDate).toISOString(),
            status,
            isCompleted: false,
        };
    
        try {
            const response = await axios.post('http://localhost:5251/api/tasks', newTask);
            console.log('Response:', response);  // Log the response
            alert('Task created successfully!');
            // Clear form after submission
            setTitle('');
            setDescription('');
            setDueDate('');
            setStatus('Todo');
        } catch (error) {
            console.error('Error creating task:', error);
            alert('Error creating task');
        }
    };
    

    return (
        <form onSubmit={handleSubmit}>
            <h2>Create Task</h2>
            
            <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
            />
            
            <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
            ></textarea>
            
            <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
            />
            
            <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
            >
                <option value="Todo">Todo</option>
                <option value="Doing">Doing</option>
                <option value="Done">Done</option>
            </select>
            
            <button type="submit">Create Task</button>
        </form>
    );
};

export default TaskForm;
