const express = require('express');
const router = express.Router();
const RelevantAssumption = require('../models/RelevantAssumption');
const auth = require('../middleware/auth');

// @route   GET /missions/:missionId/relevant_assumptions
// @desc    Get all relevant assumptions for a mission
// @access  Private
router.get('/missions/:missionId/relevant_assumptions', auth, async (req, res) => {
  try {
    const relevantAssumptions = await RelevantAssumption.find({ 
      mission_id: req.params.missionId 
    }).sort({ created: -1 });
    res.json(relevantAssumptions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /missions/:missionId/relevant_assumptions
// @desc    Create new relevant assumption
// @access  Private
router.post('/missions/:missionId/relevant_assumptions', auth, async (req, res) => {
  try {
    const newRelevantAssumption = new RelevantAssumption({
      note: req.body.note,
      mission_id: req.params.missionId,
      created_by: req.user.id
    });

    const relevantAssumption = await newRelevantAssumption.save();
    res.json(relevantAssumption);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /missions/:missionId/relevant_assumptions/:relevantAssumptionId
// @desc    Delete a relevant assumption
// @access  Private
router.delete('/missions/:missionId/relevant_assumptions/:relevantAssumptionId', auth, async (req, res) => {
  try {
    const relevantAssumption = await RelevantAssumption.findOneAndDelete({
      _id: req.params.relevantAssumptionId,
      mission_id: req.params.missionId
    });

    if (!relevantAssumption) {
      return res.status(404).json({ msg: 'Relevant assumption not found' });
    }

    res.json({ msg: 'Relevant assumption removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
