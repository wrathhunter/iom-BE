const mongoose = require('mongoose');

const EnvironmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  services: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
  }],
});

const Environment = mongoose.model('Environment', EnvironmentSchema);

module.exports = Environment;
