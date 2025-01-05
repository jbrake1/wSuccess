const express = require('express');
const router = express.Router();
const Success = require('../models/Success');
const auth = require('../middleware/auth');

// @route   DELETE /missions/:missionId/successes/:successId
// @desc    Delete a success
// @access  Private
router.delete('/missions/:missionId/successes/:successId', auth, async (req, res) => {
  try {
    const success = await Success.findOneAndDelete({
      _id: req.params.successId,
      mission: req.params.missionId
    });

    if (!success) {
      return res.status(404).json({ msg: 'Success not found' });
    }

    res.json({ msg: 'Success removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
