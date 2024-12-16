using FirebaseAdmin;
using Google.Cloud.Firestore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskManagementApp.Models;

namespace TaskManagementApp.Services
{
    public class FirestoreService
    {
        private readonly FirestoreDb _firestoreDb;

        public FirestoreService(FirebaseApp firebaseApp)
        {
            var projectId = firebaseApp.Options.ProjectId;
            _firestoreDb = FirestoreDb.Create("authentication-57a28");
        }

        public async Task<List<TaskModel>> GetTasksAsync(int pageSize = 10, int pageNumber = 1)
        {
            try
            {
                var tasksRef = _firestoreDb.Collection("tasks");
                var offset = (pageNumber - 1) * pageSize;
                var query = tasksRef.Offset(offset).Limit(pageSize);
                var snapshot = await query.GetSnapshotAsync();
                
                var tasks = new List<TaskModel>();
                foreach (var document in snapshot.Documents)
                {
                    if (document.Exists)
                    {
                        tasks.Add(document.ConvertTo<TaskModel>());
                    }
                }
                return tasks;
            }
            catch (Exception ex)
            {
                throw new Exception("Failed to fetch tasks", ex);
            }
        }

        public async Task<TaskModel?> GetTaskAsync(string id, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                throw new ArgumentException("Task ID cannot be null or empty.", nameof(id));
            }

            try
            {
                var docRef = _firestoreDb.Collection("tasks").Document(id);
                var snapshot = await docRef.GetSnapshotAsync(cancellationToken);
                return snapshot.Exists ? snapshot.ConvertTo<TaskModel>() : null;
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to fetch task with ID {id}", ex);
            }
        }

        public async Task<TaskModel> AddTaskAsync(TaskModel taskmodel)
        {
            if (taskmodel == null)
            {
                throw new ArgumentNullException(nameof(taskmodel));
            }

            try
            {
                // Ensure Status is updated correctly (mapping the StatusEnum)
                taskmodel.Status = taskmodel.StatusEnum.ToString();

                var docRef = await _firestoreDb.Collection("tasks").AddAsync(taskmodel);
                taskmodel.Id = docRef.Id;
                return taskmodel;
            }
            catch (Exception ex)
            {
                throw new Exception("Failed to add task", ex);
            }
        }

        public async Task<TaskModel> UpdateTaskAsync(TaskModel taskmodel)
        {
            if (taskmodel == null || string.IsNullOrWhiteSpace(taskmodel.Id))
            {
                throw new ArgumentException("Task cannot be null and must have a valid Id.", nameof(taskmodel));
            }

            try
            {
                // Convert any DateTime fields to UTC before saving to Firestore
                if (taskmodel.DueDate.Kind != DateTimeKind.Utc)
                {
                    taskmodel.DueDate = taskmodel.DueDate.ToUniversalTime();
                }

                // Ensure Status is updated correctly (mapping the StatusEnum)
                taskmodel.Status = taskmodel.StatusEnum.ToString();

                // Get Firestore document reference
                var docRef = _firestoreDb.Collection("tasks").Document(taskmodel.Id);

                // Overwrite the document with the updated task data
                await docRef.SetAsync(taskmodel, SetOptions.Overwrite);
                return taskmodel;
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to update task with ID {taskmodel.Id}", ex);
            }
        }

        public async Task<bool> DeleteTaskAsync(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                throw new ArgumentException("Task ID cannot be null or empty.", nameof(id));
            }

            try
            {
                var docRef = _firestoreDb.Collection("tasks").Document(id);
                await docRef.DeleteAsync();
                return true;
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to delete task with ID {id}", ex);
            }
        }
    }
}