const express = require('express');
const missionFactorController = require('../controllers/missionFactorController');
const router = express.Router();

// Create a new Mission Factor
router.post('/', missionFactorController.create);

// Retrieve all Mission Factors for a mission
router.get('/mission/:missionId', missionFactorController.findAll);

// Retrieve a single Mission Factor with id
router.get('/factor/:id', missionFactorController.findOne);

// Update a Mission Factor with id
router.put('/:id', missionFactorController.update);

// Update behind field of a Mission Factor
router.patch('/:id/behind', missionFactorController.updateBehind);

// Delete a Mission Factor with id
router.delete('/:id', missionFactorController.delete);

module.exports = router;
