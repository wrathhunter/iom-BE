const mongoose = require('mongoose');

const StateSchema = new mongoose.Schema({
  state: {
    type: String,
    enum: ['stable', 'unstable'],
    required: true,
  },
});

const State = mongoose.model('State', StateSchema);

module.exports = State;
