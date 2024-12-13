import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import axios from 'axios';

const Calendar = () => {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5251/api/tasks')
            .then(response => {
                const taskEvents = response.data.map(task => ({
                    title: task.title,  // Task name
                    start: new Date(task.dueDate).toISOString(),  // Task due date
                    backgroundColor: task.isCompleted ? '#28a745' : '#dc3545',  // Background color
                    borderColor: task.isCompleted ? '#28a745' : '#dc3545',  // Border color
                    textColor: '#ffffff',  // Text color inside the event box (White text)
                    description: task.description,
                }));
                setEvents(taskEvents);
            })
            .catch(error => console.log(error));
    }, []);

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <FullCalendar
                plugins={[dayGridPlugin]}
                initialView="dayGridMonth"
                events={events}
                eventContent={(eventInfo) => (
                    <div>
                        <strong>{eventInfo.event.title}</strong>
                    </div>
                )}
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,dayGridWeek,dayGridDay',
                }}
                eventColor="#ffffff"  // Ensuring text color is applied properly
            />
            <style jsx>{`
                /* General styles for the calendar container */
                .fc {
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 20px;
                }

                /* Style for the event box */
                .fc-event {
                    border-radius: 5px;
                    font-weight: bold;
                    padding: 5px 10px;
                    text-align: center;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                /* Style for the header of the calendar */
                .fc-header-toolbar {
                    background-color: #f7f7f7;
                    padding: 10px;
                    border-radius: 5px;
                    margin-bottom: 20px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }

                /* Styling for the day cells */
                .fc-daygrid-day {
                    border: 1px solid #ddd;
                }

                /* Custom tooltip for event details on hover */
                .fc-event:hover {
                    opacity: 0.9;
                    cursor: pointer;
                }

                /* Style for event title */
                .fc-event-title {
                    font-size: 12px;
                    font-weight: bold;
                }

                /* Hover effect on event */
                .fc-daygrid-day:hover .fc-event {
                    opacity: 0.7;
                }
            `}</style>
        </div>
    );
};

export default Calendar;
