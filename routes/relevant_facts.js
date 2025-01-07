const express = require('express');
const router = express.Router();
const RelevantFact = require('../models/RelevantFact');
const auth = require('../middleware/auth');

// @route   GET /missions/:missionId/relevant_facts
// @desc    Get all relevant facts for a mission
// @access  Private
router.get('/missions/:missionId/relevant_facts', auth, async (req, res) => {
  try {
    const relevantFacts = await RelevantFact.find({ 
      mission_id: req.params.missionId 
    }).sort({ created: -1 });
    res.json(relevantFacts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /missions/:missionId/relevant_facts
// @desc    Create new relevant fact
// @access  Private
router.post('/missions/:missionId/relevant_facts', auth, async (req, res) => {
  try {
    const newRelevantFact = new RelevantFact({
      note: req.body.note,
      mission_id: req.params.missionId,
      created_by: req.user.id
    });

    const relevantFact = await newRelevantFact.save();
    res.json(relevantFact);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /missions/:missionId/relevant_facts/:relevantFactId
// @desc    Delete a relevant fact
// @access  Private
router.delete('/missions/:missionId/relevant_facts/:relevantFactId', auth, async (req, res) => {
  try {
    const relevantFact = await RelevantFact.findOneAndDelete({
      _id: req.params.relevantFactId,
      mission_id: req.params.missionId
    });

    if (!relevantFact) {
      return res.status(404).json({ msg: 'Relevant fact not found' });
    }

    res.json({ msg: 'Relevant fact removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
