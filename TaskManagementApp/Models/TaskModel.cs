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
        public string Title { get; set; } = string.Empty;

        [FirestoreProperty]
        public string Description { get; set; } = string.Empty;

        [FirestoreProperty]
        public DateTime DueDate { get; set; }

        [FirestoreProperty]
        public bool IsCompleted { get; set; }
    }
}
