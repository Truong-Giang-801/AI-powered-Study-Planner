import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);

  // Fetch tasks from API
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get("http://localhost:5251/api/tasks");
        const taskEvents = response.data.map((task) => ({
          id: task.id,
          title: task.title,
          start: new Date(task.dueDate).toISOString(),
          status: task.status,
          statusEnum : task.statusEnum,
          isCompleted: task.isCompleted,
          emoji: task.emoji || "📅", // Default emoji
          description: task.description || "No description provided.",
          backgroundColor: task.isCompleted ? "#28a745" : "#f0ad4e",
          borderColor: task.isCompleted ? "#28a745" : "#f0ad4e",
          textColor: "#ffffff",
        }));
        setEvents(taskEvents);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setError("Failed to load tasks. Please try again later.");
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
        statusEnum : info.event.extendedProps.statusEnum,
        isCompleted : info.event.extendedProps.isCompleted,
        backgroundColor: info.event.backgroundColor,  // Preserve color
        borderColor: info.event.borderColor,  // Preserve border color
        textColor: info.event.textColor,  // Preserve text color
        dueDate: newStart.toISOString(),  // Update due date only
    };
    console.log(updatedTaskData.status);
    try {
        // Send the updated dueDate to the server to update the task
        await axios.put(`http://localhost:5251/api/tasks/${taskId}`, {
            dueDate: updatedTaskData.dueDate, // Only update the due date
            id: info.event.id,
            title: info.event.title,  // Preserve title
            description: info.event.extendedProps.description, // Preserve description
            status: info.event.extendedProps.status,  // Preserve status
            statusEnum : info.event.extendedProps.statusEnum,
            isCompleted : info.event.extendedProps.isCompleted,
        });

        // After successful backend update, update the task in the calendar view
        info.event.setStart(newStart); // Update the start date in the calendar

    } catch (error) {
        console.error('Error updating task due date:', error);
    }
};
  // Handle event click
  const handleEventClick = (info) => {
    alert(
      `Event: ${info.event.title}\nDescription: ${
        info.event.extendedProps.description
      }\nDate: ${info.event.start.toDateString()}`
    );
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
      {error ? (
        <p style={{ color: "red", textAlign: "center" }}>{error}</p>
      ) : events.length === 0 ? (
        <p style={{ textAlign: "center" }}>Loading events...</p>
      ) : (
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          editable={true}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,dayGridWeek,dayGridDay",
          }}
          eventContent={(eventInfo) => {
            const emoji = eventInfo.event.extendedProps.emoji || "📅";
            const description = eventInfo.event.extendedProps.description;
            return (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "5px",
                  backgroundColor:
                    eventInfo.event.backgroundColor || "#f0f0f0",
                  color: eventInfo.event.textColor || "#000",
                  borderRadius: "5px",
                  fontSize: "0.85rem",
                  gap: "8px",
                }}
              >
                <span style={{ fontSize: "1.2rem" }}>{emoji}</span>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontWeight: "bold" }}>{eventInfo.event.title}</span>
                  <span style={{ fontSize: "0.8rem", color: "#f8f9fa" }}>
                    {description}
                  </span>
                </div>
                
              </div>
              
            );
          }}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}

        />
      )}
      {/* <style jsx>{`
        .fc {
          padding: 20px;
          background-color: #ffffff;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .fc-event {
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease;
          border: none;
        }

        .fc-event:hover {
          transform: scale(1.03);
          cursor: pointer;
        }

        .fc-header-toolbar {
          margin-bottom: 20px;
        }
      `}</style> */}
    </div>
  );
};

export default Calendar;
