const express = require('express');
const Mission = require('../models/Mission');
const User = require('../models/User');
const Collaborator = require('../models/Collaborator');
const router = express.Router();
const auth = require('../middleware/auth');

// Get all missions for user
router.get('/', auth, async (req, res) => {
  try {
    const missions = await Mission.find({
      $or: [
        { createdBy: req.user },
        { assignedTo: req.user }
      ]
    })
      .populate('createdBy', 'name')
      .populate('assignedTo', 'name');

    res.json(missions);
  } catch (err) {
    console.error('Error adding collaborator:', {
      error: err,
      request: {
        missionId: req.params.missionId,
        userId: req.body.userId,
        headers: req.headers
      }
    });
    res.status(500).json({ 
      message: 'Server error',
      error: err.message 
    });
  }
});

// Create mission
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, assignedTo, collaborators, dueDate } = req.body;

    const mission = new Mission({
      title,
      description,
      createdBy: req.user,
      assignedTo: assignedTo || [req.user], // Default to assigning to creator
      dueDate
    });

    await mission.save();

    // Create collaborator records if any collaborators were provided
    if (collaborators && collaborators.length > 0) {
      const Collaborator = require('../models/Collaborator');
      const collaboratorPromises = collaborators.map(userId => 
        Collaborator.create({
          user: userId,
          mission: mission._id,
          createdBy: req.user
        })
      );
      await Promise.all(collaboratorPromises);
    }

    res.status(201).json(mission);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error',
        errors: Object.values(err.errors).map(e => e.message)
      });
    }
    res.status(500).json({ 
      message: 'Server error',
      error: err.message 
    });
  }
});

// Update mission status
router.put('/:missionId/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const mission = await Mission.findById(req.params.missionId);

    mission.status = status;
    await mission.save();

    res.json(mission);
  } catch (err) {
    console.error('Error adding collaborator:', {
      error: err,
      request: {
        missionId: req.params.missionId,
        userId: req.body.userId,
        headers: req.headers
      },
      stack: err.stack
    });
    res.status(500).json({ 
      message: 'Server error',
      error: err.message 
    });
  }
});

// Get users with pagination and search
router.get('/users', auth, async (req, res) => {
  try {
    const { page = 1, search = '' } = req.query;
    const limit = 20;
    const skip = (page - 1) * limit;

    const query = {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    };

    const users = await User.find(query)
      .select('_id name email')
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error('Error adding collaborator:', {
      error: err,
      request: {
        missionId: req.params.missionId,
        userId: req.body.userId,
        headers: req.headers
      },
      stack: err.stack
    });
    res.status(500).json({ 
      message: 'Server error',
      error: err.message 
    });
  }
});

// Add collaborator to mission
router.post('/:missionId/collaborators', auth, async (req, res) => {
  try {
    const { userId } = req.body;
    const mission = await Mission.findById(req.params.missionId);

    const collaborator = new Collaborator({
      user: userId,
      mission: mission._id,
      createdBy: req.user
    });

    await collaborator.save();

    // Add user to mission's assignedTo array if not already present
    if (!mission.assignedTo.includes(userId)) {
      mission.assignedTo.push(userId);
      await mission.save();
    }

    res.status(201).json(collaborator);
  } catch (err) {
    console.error('Error adding collaborator:', {
      error: err,
      request: {
        missionId: req.params.missionId,
        userId: req.body.userId,
        headers: req.headers
      },
      stack: err.stack
    });
    res.status(500).json({ 
      message: 'Server error',
      error: err.message 
    });
  }
});

// Temporary debug route
router.get('/:missionId/debug', auth, async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.missionId);
    res.json({
      mission,
      currentUser: req.user
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove collaborator from mission
router.delete('/:missionId/collaborators/:userId', auth, async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.missionId);

    // Remove collaborator record
    await Collaborator.deleteOne({
      user: req.params.userId,
      mission: mission._id
    });

    // Remove user from mission's assignedTo array if they have no other roles
    const otherCollaborations = await Collaborator.countDocuments({
      user: req.params.userId,
      mission: mission._id
    });

    if (otherCollaborations === 0) {
      mission.assignedTo = mission.assignedTo.filter(
        id => id.toString() !== req.params.userId
      );
      await mission.save();
    }

    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;