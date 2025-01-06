const admin = require('firebase-admin');
const User = require('../models/UserModel');

class UserService {
  constructor() {
    this.collection = admin.firestore().collection('users');
  }

  async createUser(user) {
    const userRef = this.collection.doc(user.userId);
    await userRef.set(user.toFirestore());
    return user;
  }

  async getUserById(userId) {
    const userRef = this.collection.doc(userId);
    const snapshot = await userRef.get();
    if (!snapshot.exists) {
      throw new Error('User not found');
    }
    return User.fromFirestore(snapshot);
  }

  async getAllUsers() {
    try {
      const snapshot = await this.collection.get();
      const users = snapshot.docs.map(doc => User.fromFirestore(doc));
      return users;
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      throw new Error('Failed to fetch users');
    }
  }

  async updateUser(userId, userData) {
    console.log(userId);
    const userRef = this.collection.doc(userId);
    await userRef.update(userData);
    const updatedUser = await this.getUserById(userId);
    return updatedUser;
  }

  async deleteUser(userId) {
    const userRef = this.collection.doc(userId);
    await userRef.delete();
  }
}

module.exports = UserService;