const admin = require('firebase-admin');

if (!admin.apps.length) {
  const serviceAccountPath = require('path').resolve(__dirname, '../Configs/serviceAccountKey_.json');
  const serviceAccount = require(serviceAccountPath);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
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
      const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return tasks;
    } catch (error) {
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
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Failed to fetch task with ID ${id}`);
    }
  }

  async addTask(task) {
    try {
      const docRef = await this.db.collection('tasks').add(task);
      return { id: docRef.id, ...task };
    } catch (error) {
      throw new Error('Failed to add task');
    }
  }

  async updateTask(id, task) {
    try {
      const docRef = this.db.collection('tasks').doc(id);
      await docRef.set(task, { merge: true });
      return { id, ...task };
    } catch (error) {
      throw new Error(`Failed to update task with ID ${id}`);
    }
  }

  async deleteTask(id) {
    try {
      const docRef = this.db.collection('tasks').doc(id);
      await docRef.delete();
      return true;
    } catch (error) {
      throw new Error(`Failed to delete task with ID ${id}`);
    }
  }
}

module.exports = new FirestoreService(db);