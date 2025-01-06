const UserService = require('../services/UserService');
const userService = new UserService();

class UserController {
  async createUser(req, res) {
    try {
      const { userId, email, userType, createdAt } = req.body;
      const user = new User(userId, email, userType, createdAt);
      const createdUser = await userService.createUser(user);
      res.status(201).json(createdUser);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getUserById(req, res) {
    try {
      const { userId } = req.params;
      const user = await userService.getUserById(userId);
      res.status(200).json(user);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async getAllUsers(req, res) {
    try {
      const users = await userService.getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateUser(req, res) {
    try {
      const { userId } = req.params;
      const userData = req.body;
      const updatedUser = await userService.updateUser(userId, userData);
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteUser(req, res) {
    try {
      const { userId } = req.params;
      await userService.deleteUser(userId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async upgradeToVIP(req, res) {
    try {
      const { userId } = req.params;
      const updatedUser = await userService.updateUser(userId, { userType: 'VIP' });
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new UserController();