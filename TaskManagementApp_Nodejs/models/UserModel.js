const { Firestore } = require('@google-cloud/firestore');
const firestore = new Firestore();

class User {
  constructor(userId, email, userType, createdAt) {
    this.userId = userId;
    this.email = email;
    this.userType = userType;
    this.createdAt = createdAt;
  }

  static fromFirestore(snapshot) {
    const data = snapshot.data();
    return new User(
      snapshot.id,
      data.email,
      data.userType,
      data.createdAt
    );
  }

  toFirestore() {
    return {
      userId: this.userId,
      email: this.email,
      userType: this.userType,
      createdAt: this.createdAt,
    };
  }
}

module.exports = User;