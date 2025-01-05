const admin = require('firebase-admin');
const { TaskModel, TaskStatus, TaskPriority } = require('../models/TaskModel');
const path = require('path');

// Initialize Firebase Admin only once and avoid using file paths for service accounts in production
if (!admin.apps.length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)  // If environment variable is set
    : require(path.resolve(__dirname, '../Configs/serviceAccountKey_.json'));  // Local file path for development

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log('FirebaseApp initialized successfully');
}

const db = admin.firestore();

class FirestoreService {
  constructor(db) {
    this.db = db;
  }

  async getTasks() {
    try {
      const tasksRef = this.db.collection('tasks');
      const snapshot = await tasksRef.get();
      const tasks = snapshot.docs.map(doc => TaskModel.fromFirestore(doc));
      return tasks;
    } catch (error) {
      console.error('Error in getTasks:', error);
      throw new Error('Failed to fetch tasks');
    }
  }

  async getTask(id) {
    try {
      const docRef = this.db.collection('tasks').doc(id);
      const doc = await docRef.get();
      if (!doc.exists) {
        return null;
      }
      return TaskModel.fromFirestore(doc);
    } catch (error) {
      console.error(`Error in getTask with ID ${id}:`, error);
      throw new Error(`Failed to fetch task with ID ${id}`);
    }
  }

  async addTask(taskData) {
    try {
      const task = new TaskModel(taskData);
      const docRef = await this.db.collection('tasks').add(task.toFirestore());
      task.id = docRef.id;
      return task;
    } catch (error) {
      console.error('Error in addTask:', error);
      throw new Error('Failed to add task');
    }
  }

  async updateTask(id, taskData) {
    try {
      const task = new TaskModel({ id, ...taskData });
      const docRef = this.db.collection('tasks').doc(id);
      await docRef.set(task.toFirestore(), { merge: true });
      return task;
    } catch (error) {
      console.error(`Error in updateTask with ID ${id}:`, error);
      throw new Error(`Failed to update task with ID ${id}`);
    }
  }

  async deleteTask(id) {
    try {
      const docRef = this.db.collection('tasks').doc(id);
      await docRef.delete();
      return true;
    } catch (error) {
      console.error(`Error in deleteTask with ID ${id}:`, error);
      throw new Error(`Failed to delete task with ID ${id}`);
    }
  }
}

module.exports = new FirestoreService(db);
