using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskManagementApp.Models;
using TaskManagementApp.Services;
using Microsoft.Extensions.Logging;

namespace TaskManagementApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TasksController : ControllerBase
    {
        private readonly FirestoreService _firestoreService;
        private readonly ILogger<TasksController> _logger;

        public TasksController(FirestoreService firestoreService, ILogger<TasksController> logger)
        {
            _firestoreService = firestoreService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetTasks()
        {
            try
            {
                var tasks = await _firestoreService.GetTasksAsync();
                return Ok(tasks);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching tasks");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateTask([FromBody] TaskModel taskmodel)
        {
            if (taskmodel == null)
            {
                return BadRequest("Task cannot be null");
            }

            // Validate that status is a valid enum value
            if (!Enum.IsDefined(typeof(TaskManagementApp.Models.TaskStatus), taskmodel.StatusEnum))
            {
                return BadRequest("Invalid status value.");
            }

            try
            {
                var createdTask = await _firestoreService.AddTaskAsync(taskmodel);
                return CreatedAtAction(nameof(GetTask), new { id = createdTask.Id }, createdTask);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating task");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTask(string id)
        {
            if (string.IsNullOrEmpty(id))
            {
                return BadRequest("Task ID cannot be empty");
            }

            try
            {
                var task = await _firestoreService.GetTaskAsync(id);
                if (task == null)
                {
                    return NotFound();
                }
                return Ok(task);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting task with ID: {id}");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTask(string id, [FromBody] TaskModel taskmodel)
        {
            if (string.IsNullOrEmpty(id) || taskmodel == null)
            {
                return BadRequest("Both ID and Task must be provided");
            }

            // Validate that status is a valid enum value
            if (!Enum.IsDefined(typeof(TaskManagementApp.Models.TaskStatus), taskmodel.StatusEnum))
            {
                return BadRequest("Invalid status value.");
            }

            taskmodel.Id = id;
            try
            {
                var updatedTask = await _firestoreService.UpdateTaskAsync(taskmodel);
                if (updatedTask == null)
                {
                    return NotFound();
                }
                return Ok(updatedTask);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating task with ID: {id}");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(string id)
        {
            if (string.IsNullOrEmpty(id))
            {
                return BadRequest("Task ID cannot be empty");
            }

            try
            {
                var deleted = await _firestoreService.DeleteTaskAsync(id);
                if (!deleted)
                {
                    return NotFound();
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting task with ID: {id}");
                return StatusCode(500, "Internal server error");
            }
        }
    }
}