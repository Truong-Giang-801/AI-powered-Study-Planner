using System;
using Google.Cloud.Firestore;

namespace TaskManagementApp.Models
{
    [FirestoreData]
    public class TaskModel
    {
        [FirestoreDocumentId]
        public string Id { get; set; } = string.Empty;

        [FirestoreProperty]
        public string UserId { get; set; } = string.Empty;

        [FirestoreProperty]
        public string Title { get; set; } = string.Empty;

        [FirestoreProperty]
        public string Description { get; set; } = string.Empty;

        [FirestoreProperty]
        public DateTime DueDate { get; set; }

        [FirestoreProperty]
        public bool IsCompleted { get; set; }

        // Store as string in Firestore, but use enum for internal logic
        [FirestoreProperty]
        public string Status { get; set; } = TaskStatus.Todo.ToString(); // Default value "Todo"

        // Convert string to enum for internal logic
        public TaskStatus StatusEnum
        {
            get => Enum.TryParse(Status, out TaskStatus status) ? status : TaskStatus.Todo; // Default to Todo if invalid
            set => Status = value.ToString(); // Set as string for Firestore
        }

        // Store as string in Firestore, but use enum for internal logic
        [FirestoreProperty]
        public string Priority { get; set; } = TaskPriority.Medium.ToString(); // Default value "Medium"

        // Convert string to enum for internal logic
        public TaskPriority PriorityEnum
        {
            get => Enum.TryParse(Priority, out TaskPriority priority) ? priority : TaskPriority.Medium; // Default to Medium if invalid
            set => Priority = value.ToString(); // Set as string for Firestore
        }
    }

    public enum TaskStatus
    {
        Expired,
        Todo,
        Doing,
        Done
    }

    public enum TaskPriority
    {
        Low,
        Medium,
        High
    }
}