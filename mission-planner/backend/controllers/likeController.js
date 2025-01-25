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
  const id = req.params.id;
  console.log('Attempting to delete like with id:', id);
  try {
    const num = await Like.destroy({
      where: { id: id }
    });
    console.log('Delete operation affected rows:', num);
    if (num == 1) {
      res.send({
        message: "Like was deleted successfully!"
      });
    } else {
      res.send({
        message: `Cannot delete Like with id=${id}. Maybe Like was not found!`
      });
    }
  } catch (err) {
    console.error('Error deleting like:', err);
    res.status(500).send({
      message: "Could not delete Like with id=" + id
    });
  }
};
