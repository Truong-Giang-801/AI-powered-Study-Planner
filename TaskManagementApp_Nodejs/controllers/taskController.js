const firestoreService = require('../services/firestoreService');

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
  const task = req.body;
  if (!task) {
    return res.status(400).send('Task cannot be null');
  }

  try {
    const createdTask = await firestoreService.addTask(task);
    res.status(201).json(createdTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).send('Internal server error');
  }
};

exports.updateTask = async (req, res) => {
  const { id } = req.params;
  const task = req.body;
  if (!id || !task) {
    return res.status(400).send('Both ID and Task must be provided');
  }

  try {
    const updatedTask = await firestoreService.updateTask(id, task);
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