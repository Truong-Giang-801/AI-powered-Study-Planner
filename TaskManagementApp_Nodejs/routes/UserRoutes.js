const express = require('express');
const UserController = require('../controllers/UserController');
const router = express.Router();

router.post('/users', UserController.createUser);
router.get('/users', UserController.getAllUsers);
router.get('/users/:userId', UserController.getUserById);
router.put('/users/:userId', UserController.updateUser);
router.delete('/users/:userId', UserController.deleteUser);

module.exports = router;