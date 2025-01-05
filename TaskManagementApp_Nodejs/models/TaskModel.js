const admin = require('firebase-admin');
const { Firestore } = require('@google-cloud/firestore');

const firestore = new Firestore();

class TaskModel {
  constructor({
    id = '',
    userId = '',
    title = '',
    description = '',
    dueDate = { _seconds: 0, _nanoseconds: 0 },
    isCompleted = false,
    status = TaskStatus.Todo,
    statusEnum = 1,
    priority = TaskPriority.Medium,
  } = {}) {
    this.id = id;
    this.userId = userId;
    this.title = title;
    this.description = description;
    this.dueDate = dueDate;
    this.isCompleted = isCompleted;
    this.status = status;
    this.statusEnum = statusEnum;
    this.priority = priority;
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new TaskModel({
      id: doc.id,
      userId: data.UserId,
      title: data.Title,
      description: data.Description,
      dueDate: data.DueDate,
      isCompleted: data.IsCompleted,
      status: data.Status,
      statusEnum: data.StatusEnum,
      priority: data.Priority,
    });
  }

  toFirestore() {
    return {
      UserId: this.userId,
      Title: this.title,
      Description: this.description,
      DueDate: this.dueDate,
      IsCompleted: this.isCompleted,
      Status: this.status,
      StatusEnum: this.statusEnum,
      Priority: this.priority,
    };
  }
}

const TaskStatus = {
  Expired: 'Expired',
  Todo: 'Todo',
  Doing: 'Doing',
  Done: 'Done',
};

const TaskPriority = {
  Low: 'Low',
  Medium: 'Medium',
  High: 'High',
};

module.exports = { TaskModel, TaskStatus, TaskPriority };