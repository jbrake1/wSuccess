const db = require('../models');

exports.create = async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.missionId || !req.body.description || !req.body.factorType || !req.body.createdBy) {
      return res.status(400).send({
        message: "All fields are required: missionId, description, factorType, createdBy"
      });
    }

    // Validate mission exists
    const mission = await db.Mission.findByPk(req.body.missionId);
    if (!mission) {
      return res.status(404).send({
        message: `Mission with id ${req.body.missionId} not found`
      });
    }

    // Validate user exists
    const user = await db.User.findByPk(req.body.createdBy);
    if (!user) {
      return res.status(404).send({
        message: `User with id ${req.body.createdBy} not found`
      });
    }

    // Validate user is a mission participant
    const isParticipant = await db.MissionParticipant.findOne({
      where: {
        missionId: req.body.missionId,
        userId: req.body.createdBy
      }
    });

    if (!isParticipant) {
      return res.status(403).send({
        message: "Only mission participants can create factors"
      });
    }

    const factorData = {
      missionId: req.body.missionId,
      description: req.body.description,
      factorType: req.body.factorType,
      createdBy: req.body.createdBy
    };

    const factor = await db.MissionFactor.create(factorData);
    res.send(factor);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while creating the Mission Factor."
    });
  }
};

exports.findAll = async (req, res) => {
  try {
    const factors = await db.MissionFactor.findAll({
      where: {
        missionId: req.params.missionId
      }
    });
    res.send(factors);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving mission factors."
    });
  }
};

exports.findOne = async (req, res) => {
  const id = req.params.id;
  try {
    const factor = await db.MissionFactor.findByPk(id);
    if (factor) {
      res.send(factor);
    } else {
      res.status(404).send({
        message: `Cannot find Mission Factor with id=${id}.`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: "Error retrieving Mission Factor with id=" + id
    });
  }
};

exports.update = async (req, res) => {
  const id = req.params.id;
  try {
    const [num] = await db.MissionFactor.update(req.body, {
      where: { id: id }
    });
    if (num == 1) {
      res.send({
        message: "Mission Factor was updated successfully."
      });
    } else {
      res.send({
        message: `Cannot update Mission Factor with id=${id}. Maybe Mission Factor was not found or req.body is empty!`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: "Error updating Mission Factor with id=" + id
    });
  }
};

exports.updateBehind = async (req, res) => {
  try {
    const { id } = req.params;
    const { behind, userId } = req.body;

    // Validate behind is a number
    if (typeof behind !== 'number') {
      return res.status(400).send({
        message: "Behind must be an integer"
      });
    }

    // Find the factor
    const factor = await db.MissionFactor.findByPk(id);
    if (!factor) {
      return res.status(404).send({
        message: `Mission Factor with id=${id} not found`
      });
    }

    // Validate user is a mission participant
    const isParticipant = await db.MissionParticipant.findOne({
      where: {
        missionId: factor.missionId,
        userId: userId
      }
    });

    if (!isParticipant) {
      return res.status(403).send({
        message: "Only mission participants can update factor order"
      });
    }

    // Update the behind field
    await factor.update({ behind });

    res.send({
      message: "Mission Factor order was updated successfully."
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error updating Mission Factor position"
    });
  }
};

exports.delete = async (req, res) => {
  const id = req.params.id;
  try {
    const num = await db.MissionFactor.destroy({
      where: { id: id }
    });
    if (num == 1) {
      res.send({
        message: "Mission Factor was deleted successfully!"
      });
    } else {
      res.send({
        message: `Cannot delete Mission Factor with id=${id}. Maybe Mission Factor was not found!`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: "Could not delete Mission Factor with id=" + id
    });
  }
};
