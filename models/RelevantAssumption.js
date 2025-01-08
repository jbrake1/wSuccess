const mongoose = require('mongoose');

const RelevantAssumptionSchema = new mongoose.Schema({
  note: {
    type: String,
    required: true
  },
  mission_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mission',
    required: true
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('RelevantAssumption', RelevantAssumptionSchema);
