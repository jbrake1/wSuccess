const express = require('express');
const router = express.Router();
const missionController = require('../controllers/missionController');

// Create a new Mission
router.post('/', missionController.create);

// Retrieve all Missions
router.get('/', missionController.findAll);

// Get missions with participants
router.get('/with-participants', missionController.getMissionsWithParticipants);

// Retrieve a single Mission with id
router.get('/:id', missionController.findOne);

// Update a Mission with id
router.put('/:id', missionController.update);

// Delete a Mission with id
router.delete('/:id', missionController.delete);

// Participant management routes
router.post('/:missionId/participants', missionController.addParticipant);
router.delete('/:missionId/participants/:userId', missionController.removeParticipant);
router.get('/:missionId/participants', missionController.getParticipants);

module.exports = router;
