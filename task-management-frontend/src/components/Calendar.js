import React, { useState, useEffect, useContext } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import { Container, Box, Typography, CircularProgress, Alert } from "@mui/material";
import { UserContext } from "../context/UserContext";

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const { user } = useContext(UserContext);

  // Fetch tasks from API
  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) return;

      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/api/tasks`);
        const taskEvents = response.data.map(async (task) => {
          if (task.userId !== user.uid) return null;

          const dueDate = new Date(task.dueDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Set to start of today

          let status = task.status;
          let backgroundColor = "#f0ad4e"; // Default color for Todo

          if (task.isCompleted) {
            backgroundColor = "#28a745"; // Green for Done
          } else if (dueDate < today) {
            status = "Expired";
            backgroundColor = "#dc3545"; // Red for Expired

            // Update the task status to "Expired" in the backend
            try {
              await axios.put(`${process.env.REACT_APP_BACKEND_API_URL}/api/tasks/${task.id}`, {
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
            userId: task.userId,
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
        setEvents(processedTasks.filter(event => event !== null));
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setError("Failed to load tasks. Please try again later.");
      }
    };

    fetchTasks();
  }, [user]);

  // Handle drag and drop event to update status
  const handleEventDrop = async (info) => {
    const newStart = info.event.start;
    const taskId = info.event.id;

    const updatedTaskData = {
      ...info.event.extendedProps,
      title: info.event.title,
      dueDate: newStart.toISOString(), // Update due date
    };
    const pre_status = updatedTaskData.status;
    const pre_statusEnum = updatedTaskData.statusEnum;
    // Check if the new date is not expired
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today
    if (newStart >= today && pre_status === "Expired" && pre_statusEnum === 0) {
      updatedTaskData.status = "Todo";
      updatedTaskData.statusEnum = 1;
      updatedTaskData.backgroundColor = "#ffc107"; // Yellow for Todo
    } else if (newStart < today && pre_status !== "Done" ) {
      updatedTaskData.status = "Expired";
      updatedTaskData.statusEnum = 0;
      updatedTaskData.backgroundColor = "#dc3545"; // Red for Expired
    }
    else{
      updatedTaskData.status = info.event.extendedProps.status;
      updatedTaskData.statusEnum = info.event.extendedProps.statusEnum;
      if(updatedTaskData.status === "Done")
      updatedTaskData.backgroundColor = "#28a745"; // Green for Done
      else if(updatedTaskData.status === "Doing")
      updatedTaskData.backgroundColor = "#007bff"; // Blue for Doing
      else if(updatedTaskData.status === "Todo")
      updatedTaskData.backgroundColor = "#ffc107"; // Yellow for Todo
    }

    try {
      await axios.put(`${process.env.REACT_APP_BACKEND_API_URL}/api/tasks/${taskId}`, updatedTaskData);

      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === taskId
            ? { ...event, start: newStart.toISOString(), status: updatedTaskData.status, statusEnum: updatedTaskData.statusEnum, backgroundColor: updatedTaskData.backgroundColor, borderColor: updatedTaskData.backgroundColor }
            : event
        )
      );
    } catch (error) {
      console.error("Error updating task due date:", error);
    }
  };

  // Handle event click
  const handleEventClick = (info) => {
    alert(
      `Event: ${info.event.title}\nDescription: ${
        info.event.extendedProps.description
      }\nDate: ${info.event.start.toDateString()}\nStatus: ${
        info.event.extendedProps.status
      }\nPriority: ${info.event.extendedProps.priority}`
    );
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ textAlign: "center", mb: 2 }}>
        <Typography variant="h4" component="h1" color="primary" gutterBottom>
          Task Calendar
        </Typography>
      </Box>

      {error ? (
        <Alert severity="error" sx={{ textAlign: "center" }}>
          {error}
        </Alert>
      ) : events.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: "300px" }}>
          <CircularProgress color="primary" />
        </Box>
      ) : (
        <Box
          sx={{
            p: 2,
            borderRadius: "8px",
            boxShadow: 3,
            backgroundColor: "#fafafa",
          }}
        >
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
              return (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    p: 0.5,
                    backgroundColor: eventInfo.event.backgroundColor,
                    borderRadius: "4px",
                    color: eventInfo.event.textColor,
                    gap: "8px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: "100%", // Ensures it doesn't overflow the container
                  }}
                >
                  <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>{emoji}</span>
                  <Box
                    sx={{
                      flexGrow: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      fontWeight="bold"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {eventInfo.event.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      display="block"
                      color="inherit"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {eventInfo.event.extendedProps.description}
                    </Typography>
                  </Box>
                </Box>
              );
            }}
            
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
          />
        </Box>
      )}
    </Container>
  );
};

export default Calendar;