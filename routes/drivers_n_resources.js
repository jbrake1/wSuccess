const express = require('express');
const router = express.Router();
const DriversNResources = require('../models/DriversNResources');
const auth = require('../middleware/auth');

// @route   GET api/missions/:missionId/drivers
// @desc    Get all drivers and resources for a mission
// @access  Private
router.get('/missions/:missionId/drivers', auth, async (req, res) => {
  try {
    const drivers = await DriversNResources.find({ mission: req.params.missionId })
      .sort({ createdAt: -1 });
    res.json(drivers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/missions/:missionId/drivers
// @desc    Create a new driver/resource
// @access  Private
router.post('/missions/:missionId/drivers', auth, async (req, res) => {
  try {
    const newDriver = new DriversNResources({
      mission: req.params.missionId,
      createdBy: req.user.id,
      ...req.body
    });

    const driver = await newDriver.save();
    res.json(driver);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/missions/:missionId/drivers/:id
// @desc    Delete a driver/resource
// @access  Private
router.delete('/missions/:missionId/drivers/:id', auth, async (req, res) => {
  try {
    const driver = await DriversNResources.findById(req.params.id);
    
    if (!driver) {
      return res.status(404).json({ msg: 'Driver/resource not found' });
    }

    // Check user
    if (driver.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await driver.remove();
    res.json({ msg: 'Driver/resource removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
