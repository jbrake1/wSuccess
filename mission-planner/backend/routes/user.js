const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// User registration
router.post('/register', userController.createUser);

// User login
router.post('/login', userController.login);

// Find user by email
router.post('/find', userController.findUserByEmail);

// Get all users
router.get('/', userController.getAllUsers);

// Get single user
router.get('/:id', userController.getUser);

// Update user
router.put('/:id', userController.updateUser);

// Delete user
router.delete('/:id', userController.deleteUser);

// Cleanup user by email
router.delete('/cleanup/:email', userController.cleanupUser);

module.exports = router;
