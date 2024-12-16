import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import "./Calendar.css"; // Import the CSS file
const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);

  // Fetch tasks from API
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get("http://localhost:5251/api/tasks");
        const taskEvents = response.data.map(async (task) => {
          const dueDate = new Date(task.dueDate);
          const today = new Date();
          let status = task.status;
          let backgroundColor = "#f0ad4e"; // Default color for Todo

          if (task.isCompleted) {
            backgroundColor = "#28a745"; // Green for Done
          } else if (dueDate < today) {
            status = "Expired";
            backgroundColor = "#dc3545"; // Red for Expired

            // Update the task status to "Expired" in the backend
            try {
              await axios.put(`http://localhost:5251/api/tasks/${task.id}`, {
                ...task,
                status: "Expired",
                statusEnum: 0, // 0 is the enum value for Expired
              });
            } catch (error) {
              console.error("Error updating task status to Expired:", error);
            }
          } else if (status === "Doing") {
            backgroundColor = "#007bff"; // Blue for Doing
          } else if (status === "Todo") {
            backgroundColor = "#ffc107"; // Yellow for Todo
          }

          return {
            id: task.id,
            title: task.title,
            start: dueDate.toISOString(),
            status: status,
            statusEnum: task.statusEnum,
            isCompleted: task.isCompleted,
            emoji: task.emoji || "📅", // Default emoji
            description: task.description || "No description provided.",
            backgroundColor: backgroundColor,
            borderColor: backgroundColor,
            textColor: "#ffffff",
            priority: task.priority,
          };
        });

        // Wait for all tasks to be processed before setting the state
        const processedTasks = await Promise.all(taskEvents);
        setEvents(processedTasks);
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
      title: info.event.title, // Preserve title
      description: info.event.extendedProps.description, // Preserve description
      status: info.event.extendedProps.status, // Preserve status
      statusEnum: info.event.extendedProps.statusEnum,
      isCompleted: info.event.extendedProps.isCompleted,
      backgroundColor: info.event.backgroundColor, // Preserve color
      borderColor: info.event.borderColor, // Preserve border color
      textColor: info.event.textColor, // Preserve text color
      priority: info.event.extendedProps.priority,
      dueDate: newStart.toISOString(), // Update due date only
    };

    // Determine the new status and background color based on the new due date
    let newStatus = updatedTaskData.status;
    let newStatusEnum = updatedTaskData.statusEnum;
    let newBackgroundColor = updatedTaskData.backgroundColor;

    if (info.event.extendedProps.isCompleted) {
      newBackgroundColor = "#28a745"; // Green for Done
    } else if (new Date(updatedTaskData.dueDate) < new Date()) {
      newStatus = "Expired";
      newStatusEnum = 0; // Expired
      newBackgroundColor = "#dc3545"; // Red for Expired
    } else {
      newStatus = "Todo";
      newStatusEnum = 1; // Todo
      newBackgroundColor = "#ffc107"; // Yellow for Todo
    }

    updatedTaskData.status = newStatus;
    updatedTaskData.statusEnum = newStatusEnum;

    try {
      // Send the updated dueDate and status to the server to update the task
      await axios.put(`http://localhost:5251/api/tasks/${taskId}`, {
        dueDate: updatedTaskData.dueDate, // Only update the due date
        id: info.event.id,
        title: info.event.title, // Preserve title
        description: info.event.extendedProps.description, // Preserve description
        status: newStatus, // Update status
        statusEnum: newStatusEnum, // Update statusEnum
        isCompleted: info.event.extendedProps.isCompleted,
        priority: info.event.extendedProps.priority,
      });

      // Update the state to reflect the changes immediately
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === taskId
            ? { ...event, start: newStart.toISOString(), backgroundColor: newBackgroundColor, borderColor: newBackgroundColor, status: newStatus, statusEnum: newStatusEnum }
            : event
        )
      );

      // Update the event in the calendar view
      info.event.setProp("backgroundColor", newBackgroundColor);
      info.event.setProp("borderColor", newBackgroundColor);
      info.event.setStart(newStart); // Update the start date in the calendar
    } catch (error) {
      console.error("Error updating task due date:", error);
    }
  };

  // Handle event click
  const handleEventClick = (info) => {
    alert(
      `Event: ${info.event.title}\nDescription: ${
        info.event.extendedProps.description
      }\nDate: ${info.event.start.toDateString()}\n Status: ${info.event.extendedProps.status} \n Priority: ${info.event.extendedProps.priority}`
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
            // return (
            //   <div
            //     style={{
            //       display: "flex",
            //       alignItems: "center",
            //       padding: "5px",
            //       backgroundColor:
            //         eventInfo.event.backgroundColor || "#f0f0f0",
            //       color: eventInfo.event.textColor || "#000",
            //       borderRadius: "5px",
            //       fontSize: "0.85rem",
            //       gap: "8px",
            //     }}
            //   >
            //     <span style={{ fontSize: "1.2rem" }}>{emoji}</span>
            //     <div style={{ display: "flex", flexDirection: "column" }}>
            //       <span style={{ fontWeight: "bold" }}>
            //         {eventInfo.event.title}
            //       </span>
            //       <span style={{ fontSize: "0.8rem", color: "#f8f9fa" }}>
            //         {description}
            //       </span>
            //     </div>
            //   </div>
            // );
            return (
              <div className="fc-event-content"style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "5px",
                      backgroundColor:
                        eventInfo.event.backgroundColor || "#f0f0f0",
                      color: eventInfo.event.textColor || "#000",
                      borderRadius: "5px",
                      fontSize: "0.85rem",
                      gap: "8px",
                    }}>
                <span className="fc-event-emoji">{emoji}</span>
                <div className="fc-event-details">
                  <span className="fc-event-title">{eventInfo.event.title}</span>
                  <span className="fc-event-description">{description}</span>
                </div>
              </div>
            );
          }}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
        />
      )}
    </div>
  );
};

export default Calendar;