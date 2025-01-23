const db = require('../models');
const Like = db.Like;

// Create and Save a new Like
exports.create = async (req, res) => {
  try {
    const like = await Like.create({
      factorId: req.body.factorId,
      createdBy: req.user.id
    });
    res.send(like);
  } catch (err) {
    res.status(500).send({
      message: err.message || 'Some error occurred while creating the Like.'
    });
  }
};

// Retrieve all Likes for a Factor
exports.findAllForFactor = async (req, res) => {
  try {
    const likes = await Like.findAll({
      where: { factorId: req.params.factorId },
      include: ['creator']
    });
    res.send(likes);
  } catch (err) {
    res.status(500).send({
      message: err.message || 'Some error occurred while retrieving likes.'
    });
  }
};

// Delete a Like with the specified id
exports.delete = async (req, res) => {
  try {
    const num = await Like.destroy({
      where: { 
        id: req.params.id,
        createdBy: req.user.id // Only allow creator to delete
      }
    });
    
    if (num === 1) {
      res.send({ message: 'Like was deleted successfully!' });
    } else {
      res.status(404).send({
        message: `Cannot delete Like with id=${req.params.id}. Maybe Like was not found or you don't have permission.`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: 'Could not delete Like with id=' + req.params.id
    });
  }
};
