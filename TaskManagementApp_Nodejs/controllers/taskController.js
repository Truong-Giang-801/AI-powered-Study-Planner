const firestoreService = require('../services/firestoreService');
const { TaskModel } = require('../models/TaskModel');

exports.getTasks = async (req, res) => {
  try {
    const tasks = await firestoreService.getTasks();
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).send('Internal server error');
  }
};

exports.getTask = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).send('Task ID cannot be empty');
  }

  try {
    const task = await firestoreService.getTask(id);
    if (!task) {
      return res.status(404).send('Task not found');
    }
    res.json(task);
  } catch (error) {
    console.error(`Error getting task with ID ${id}:`, error);
    res.status(500).send('Internal server error');
  }
};

exports.addTask = async (req, res) => {
  const taskData = req.body;
  if (!taskData) {
    return res.status(400).send('Task cannot be null');
  }

  try {
    const createdTask = await firestoreService.addTask(taskData);
    res.status(201).json(createdTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).send('Internal server error');
  }
};

exports.updateTask = async (req, res) => {
  const { id } = req.params;
  const taskData = req.body;
  if (!id || !taskData) {
    return res.status(400).send('Both ID and Task must be provided');
  }

  try {
    const updatedTask = await firestoreService.updateTask(id, taskData);
    res.json(updatedTask);
  } catch (error) {
    console.error(`Error updating task with ID ${id}:`, error);
    res.status(500).send('Internal server error');
  }
};

exports.deleteTask = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).send('Task ID cannot be empty');
  }

  try {
    const deleted = await firestoreService.deleteTask(id);
    if (!deleted) {
      return res.status(404).send('Task not found');
    }
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting task with ID ${id}:`, error);
    res.status(500).send('Internal server error');
  }
};