const express = require('express');
const UserController = require('../controllers/UserController');
const router = express.Router();

router.post('/', UserController.createUser);
router.get('/', UserController.getAllUsers);
router.get('/:userId', UserController.getUserById);
router.put('/:userId', UserController.updateUser);
router.put('/:userId/upgrade-vip', UserController.upgradeToVIP);
router.delete('/:userId', UserController.deleteUser);

module.exports = router;