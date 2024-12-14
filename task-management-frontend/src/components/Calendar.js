import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';

const Calendar = () => {
    const [events, setEvents] = useState([]);
    const [error, setError] = useState(null);

    // Fetch tasks from API
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axios.get('http://localhost:5251/api/tasks');
                const taskEvents = response.data.map((task) => ({
                    id: task.id,
                    title: task.title,
                    start: new Date(task.dueDate).toISOString(),
                    backgroundColor: task.isCompleted ? '#28a745' : '#dc3545',
                    borderColor: task.isCompleted ? '#28a745' : '#dc3545',
                    textColor: '#ffffff',
                    description: task.description,
                    status: task.isCompleted ? 'Completed' : 'Todo', // Store status of task
                }));
                setEvents(taskEvents);
            } catch (error) {
                console.error('Error fetching tasks:', error);
                setError('Failed to load tasks. Please try again later.');
            }
        };

        fetchTasks();
    }, []);

    // Handle drag and drop event to update status
    const handleEventDrop = async (info) => {
        const newStart = info.event.start;
        const taskId = info.event.id;

        // Create a copy of the event's current properties to preserve the other fields
        const updatedTaskData = {
            id: info.event.id,
            title: info.event.title,  // Preserve title
            description: info.event.extendedProps.description, // Preserve description
            status: info.event.extendedProps.status,  // Preserve status
            backgroundColor: info.event.backgroundColor,  // Preserve color
            borderColor: info.event.borderColor,  // Preserve border color
            textColor: info.event.textColor,  // Preserve text color
            dueDate: newStart.toISOString(),  // Update due date only
        };

        try {
            // Send the updated dueDate to the server to update the task
            await axios.put(`http://localhost:5251/api/tasks/${taskId}`, {
                dueDate: updatedTaskData.dueDate, // Only update the due date
                id: info.event.id,
                title: info.event.title,  // Preserve title
                description: info.event.extendedProps.description, // Preserve description
                status: info.event.extendedProps.status,  // Preserve status
            });

            // After successful backend update, update the task in the calendar view
            info.event.setStart(newStart); // Update the start date in the calendar

        } catch (error) {
            console.error('Error updating task due date:', error);
        }
    };

    // Handle event click (to show details)
    const handleEventClick = (info) => {
        // Access status (e.g., 'Completed' or 'Todo') from extendedProps
        const progress = info.event.extendedProps.status === 'Completed' ? 'Completed' : 'Not Completed';
        
        alert(`Event: ${info.event.title}\nDescription: ${info.event.extendedProps.description}\nProgress: ${progress}`);
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
            {error ? (
                <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
            ) : events.length === 0 ? (
                <p style={{ textAlign: 'center' }}>Loading events...</p>
            ) : (
                <FullCalendar
                    plugins={[dayGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    events={events}
                    eventContent={(eventInfo) => (
                        <div>
                            <strong>{eventInfo.event.title}</strong>
                        </div>
                    )}
                    eventClick={handleEventClick}
                    eventDrop={handleEventDrop}
                    editable={true} // Enable drag-and-drop
                    droppable={true} // Allow events to be dropped into the calendar
                    eventMouseEnter={(info) => {
                        const tooltip = document.createElement('div');
                        tooltip.className = 'tooltip';
                        tooltip.innerHTML = info.event.extendedProps.description || 'No description available';
                        document.body.appendChild(tooltip);

                        tooltip.style.position = 'absolute';
                        tooltip.style.top = `${info.jsEvent.pageY + 10}px`;
                        tooltip.style.left = `${info.jsEvent.pageX + 10}px`;
                        tooltip.style.background = '#000';
                        tooltip.style.color = '#fff';
                        tooltip.style.padding = '5px 10px';
                        tooltip.style.borderRadius = '4px';
                        tooltip.style.zIndex = '1000';

                        info.el.onmouseleave = () => {
                            document.body.removeChild(tooltip);
                        };
                    }}
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,dayGridWeek,dayGridDay',
                    }}
                />
            )}
            <style jsx>{`
                .fc {
                    padding: 20px;
                    background-color: #ffffff;
                    border-radius: 10px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }

                .fc-event {
                    border-radius: 5px;
                    font-weight: bold;
                    text-align: center;
                }

                .fc-event:hover {
                    opacity: 0.85;
                    cursor: pointer;
                }

                .fc-header-toolbar {
                    margin-bottom: 20px;
                }

                .tooltip {
                    position: absolute;
                    background-color: #333;
                    color: #fff;
                    padding: 5px 10px;
                    border-radius: 4px;
                    font-size: 12px;
                    z-index: 1000;
                    pointer-events: none;
                }
            `}</style>
        </div>
    );
};

export default Calendar;
