const express = require('express');
const router = express.Router();
const ConstraintsNObstacles = require('../models/ConstraintsNObstacles');
const auth = require('../middleware/auth');

// @route   GET api/constraints_n_obstacles
// @desc    Get all constraints & obstacles
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const constraints = await ConstraintsNObstacles.find()
      .populate('mission_id', 'name')
      .populate('created_by', 'name');
    res.json(constraints);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/constraints_n_obstacles
// @desc    Add new constraint/obstacle
// @access  Private
router.post('/', auth, async (req, res) => {
  const { note, mission_id } = req.body;

  try {
    const newConstraint = new ConstraintsNObstacles({
      note,
      mission_id,
      created_by: req.user._id
    });

    const constraint = await newConstraint.save();
    res.json(constraint);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/constraints_n_obstacles/:id
// @desc    Update constraint/obstacle
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { note } = req.body;

  try {
    let constraint = await ConstraintsNObstacles.findById(req.params.id);

    if (!constraint) {
      return res.status(404).json({ msg: 'Constraint not found' });
    }

    constraint.note = note;

    await constraint.save();
    res.json(constraint);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/constraints_n_obstacles/:id
// @desc    Delete constraint/obstacle
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    let constraint = await ConstraintsNObstacles.findById(req.params.id);

    if (!constraint) {
      return res.status(404).json({ msg: 'Constraint not found' });
    }

    await ConstraintsNObstacles.deleteOne({ _id: req.params.id });
    res.json({ msg: 'Constraint removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
