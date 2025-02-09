const db = require('../models');
console.log('Available models:', Object.keys(db));
console.log('db.Mission:', db.Mission);
console.log('db.User:', db.User);

const Mission = db.Mission;
if (!Mission) {
  throw new Error('Mission model not found in db object. Available models: ' + Object.keys(db).join(', '));
}

console.log('Mission model:', Mission);

// Create and Save a new Mission
exports.create = async (req, res) => {
  try {
    // Check if referenced users exist
    console.log('Validating users:', req.body.userId, req.body.createdBy);
    try {
      if (!req.body.userId || !req.body.createdBy) {
        return res.status(400).send({
          message: "userId and createdBy are required"
        });
      }

      const [user, creator] = await Promise.all([
        db.User.findByPk(req.body.userId),
        db.User.findByPk(req.body.createdBy)
      ]);
      
      if (!user) {
        return res.status(400).send({
          message: `User with id ${req.body.userId} not found`
        });
      }
      if (!creator) {
        return res.status(400).send({
          message: `Creator with id ${req.body.createdBy} not found`
        });
      }
      
      console.log('User validation successful:', {
        userId: user.id,
        createdBy: creator.id
      });
    } catch (err) {
      console.error('Error validating users:', {
        message: err.message,
        stack: err.stack,
        errors: err.errors
      });
      return res.status(500).send({
        message: "Error validating users",
        details: err.errors
      });
    }

    console.log('Creating mission with:', req.body);
    try {
      const missionData = {
        userId: req.body.userId,
        name: req.body.name,
        description: req.body.description,
        createdBy: req.body.createdBy,
        created: new Date()
      };
      console.log('Mission data:', missionData);
      
      console.log('Attempting to create mission with data:', missionData);
      const mission = await Mission.create(missionData);
      if (!mission) {
        throw new Error('Mission creation returned undefined');
      }
      console.log('Mission created successfully:', {
        id: mission.id,
        userId: mission.userId,
        name: mission.name,
        description: mission.description,
        createdBy: mission.createdBy
      });

      // Add creator as participant
      await db.MissionParticipant.create({
        missionId: mission.id,
        userId: mission.createdBy,
        createdBy: mission.createdBy
      });

      res.send({
        id: mission.id,
        userId: mission.userId,
        name: mission.name,
        description: mission.description,
        createdBy: mission.createdBy,
        created: mission.created
      });
    } catch (err) {
      console.error('Detailed error creating mission:', {
        message: err.message,
        stack: err.stack,
        errors: err.errors
      });
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Mission.",
        details: err.errors
      });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while creating the Mission."
    });
  }
};

// Retrieve all Missions for authenticated user
exports.findAll = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find missions where user is either owner or participant
    const missions = await Mission.findAll({
      where: { 
        userId: userId 
      },
      include: [{
        model: db.MissionParticipant,
        as: 'participants',
        where: { userId: userId },
        required: false
      }]
    });
    
    res.send(missions);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving missions."
    });
  }
};

// Find a single Mission with an id
exports.findOne = async (req, res) => {
  const id = req.params.id;
  try {
    const mission = await Mission.findByPk(id);
    if (mission) {
      res.send(mission);
    } else {
      res.status(404).send({
        message: `Cannot find Mission with id=${id}.`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: "Error retrieving Mission with id=" + id
    });
  }
};

// Update a Mission by the id in the request
exports.update = async (req, res) => {
  const id = req.params.id;
  try {
    const [num] = await Mission.update(req.body, {
      where: { id: id }
    });
    if (num == 1) {
      res.send({
        message: "Mission was updated successfully."
      });
    } else {
      res.send({
        message: `Cannot update Mission with id=${id}. Maybe Mission was not found or req.body is empty!`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: "Error updating Mission with id=" + id
    });
  }
};

// Delete a Mission with the specified id in the request
exports.delete = async (req, res) => {
  const id = req.params.id;
  try {
    const num = await Mission.destroy({
      where: { id: id }
    });
    if (num == 1) {
      res.send({
        message: "Mission was deleted successfully!"
      });
    } else {
      res.send({
        message: `Cannot delete Mission with id=${id}. Maybe Mission was not found!`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: "Could not delete Mission with id=" + id
    });
  }
};

// Add participant to mission
exports.addParticipant = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);
    console.log('Content-Type:', req.get('Content-Type'));
    
    const { missionId, userId, createdBy } = req.body;
    
    if (!missionId || !userId || !createdBy) {
      return res.status(400).send({
        message: 'Missing required fields: missionId, userId, or createdBy'
      });
    }
    
    // Validate users exist
    const [mission, user, creator] = await Promise.all([
      db.Mission.findByPk(missionId),
      db.User.findByPk(userId),
      db.User.findByPk(createdBy)
    ]);
    
    if (!mission) {
      return res.status(404).send({ message: 'Mission not found' });
    }
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
    if (!creator) {
      return res.status(404).send({ message: 'Creator not found' });
    }

    // Check if participant already exists
    const existing = await db.MissionParticipant.findOne({
      where: { missionId, userId }
    });
    
    if (existing) {
      return res.status(400).send({ message: 'User is already a participant' });
    }

    const participant = await db.MissionParticipant.create({
      missionId,
      userId,
      createdBy
    });

    res.send(participant);
  } catch (err) {
    res.status(500).send({
      message: err.message || 'Error adding participant'
    });
  }
};

// Remove participant from mission
exports.removeParticipant = async (req, res) => {
  try {
    const { missionId, userId } = req.body;
    
    const result = await db.MissionParticipant.destroy({
      where: { missionId, userId }
    });
    
    if (result === 0) {
      return res.status(404).send({ message: 'Participant not found' });
    }
    
    res.send({ message: 'Participant removed successfully' });
  } catch (err) {
    res.status(500).send({
      message: err.message || 'Error removing participant'
    });
  }
};

// Get all participants for a mission
exports.getParticipants = async (req, res) => {
  try {
    const { missionId } = req.params;
    
    const participants = await db.MissionParticipant.findAll({
      where: { missionId },
      include: [
        { model: db.User, as: 'user' },
        { model: db.User, as: 'creator' }
      ]
    });
    
    res.send(participants);
  } catch (err) {
    res.status(500).send({
      message: err.message || 'Error getting participants'
    });
  }
};

// Get all missions with participants
exports.getMissionsWithParticipants = async (req, res) => {
  try {
    const missions = await db.Mission.findAll({
      include: [
        {
          model: db.MissionParticipant,
          as: 'participants',
          include: [
            { model: db.User, as: 'user' },
            { model: db.User, as: 'creator' }
          ]
        }
      ]
    });
    
    res.send(missions);
  } catch (err) {
    res.status(500).send({
      message: err.message || 'Error getting missions with participants'
    });
  }
};
