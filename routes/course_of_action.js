const express = require('express');
const router = express.Router();
const CourseOfAction = require('../models/CourseOfAction');
const auth = require('../middleware/auth');

// @route   GET /missions/:missionId/course_of_actions
// @desc    Get all course of actions for a mission
// @access  Private
router.get('/missions/:missionId/course_of_actions', auth, async (req, res) => {
  try {
    const courseOfActions = await CourseOfAction.find({ mission_id: req.params.missionId })
      .sort({ created: -1 });
    res.json(courseOfActions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /missions/:missionId/course_of_actions
// @desc    Create new course of action
// @access  Private
router.post('/missions/:missionId/course_of_actions', auth, async (req, res) => {
  try {
    const { note } = req.body;

    const newCourseOfAction = new CourseOfAction({
      note,
      mission_id: req.params.missionId,
      created_by: req.user.id
    });

    const courseOfAction = await newCourseOfAction.save();
    res.json(courseOfAction);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /missions/:missionId/course_of_actions/:id
// @desc    Update course of action
// @access  Private
router.put('/missions/:missionId/course_of_actions/:id', auth, async (req, res) => {
  try {
    const { note } = req.body;

    const courseOfAction = await CourseOfAction.findOneAndUpdate(
      { _id: req.params.id, mission_id: req.params.missionId },
      { $set: { note } },
      { new: true }
    );

    if (!courseOfAction) {
      return res.status(404).json({ msg: 'Course of action not found' });
    }

    res.json(courseOfAction);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /missions/:missionId/course_of_actions/:id
// @desc    Delete course of action
// @access  Private
router.delete('/missions/:missionId/course_of_actions/:id', auth, async (req, res) => {
  try {
    const courseOfAction = await CourseOfAction.findOneAndDelete({
      _id: req.params.id,
      mission_id: req.params.missionId
    });

    if (!courseOfAction) {
      return res.status(404).json({ msg: 'Course of action not found' });
    }

    res.json({ msg: 'Course of action removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
