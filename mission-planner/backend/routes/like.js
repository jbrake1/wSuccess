const express = require('express');
const likeController = require('../controllers/likeController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Create a new Like
router.post('/', authMiddleware, likeController.create);

// Get all Likes for a Factor
router.get('/factor/:factorId', authMiddleware, likeController.findAllForFactor);

// Delete a Like
router.delete('/:id', authMiddleware, likeController.delete);

module.exports = router;
