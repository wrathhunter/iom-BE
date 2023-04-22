const mongoose = require('mongoose');
const { boolean } = require('webidl-conversions');

const BranchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    enum: ['stable', 'unstable'],
    required: true,
  },
  deployed: {
    type: Boolean,
    required: true,
  }
});

const Branch = mongoose.model('Branch', BranchSchema);

module.exports = Branch;
