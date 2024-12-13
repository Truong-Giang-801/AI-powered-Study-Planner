import React, { useState } from 'react';
import axios from 'axios';

const TaskForm = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Ensure the date is in ISO format
        const newTask = { 
            title, 
            description, 
            dueDate: new Date(dueDate).toISOString(), 
            isCompleted: false 
        };

        try {
            const response = await axios.post('http://localhost:5251/api/tasks', newTask, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            console.log('Task created:', response.data);
            setTitle('');
            setDescription('');
            setDueDate('');
        } catch (error) {
            console.error('Error creating task:', error);
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
            <button type="submit">Create Task</button>
        </form>
    );
};

export default TaskForm;
