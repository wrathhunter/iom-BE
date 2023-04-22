const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  branches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
  }]
});

const Service = mongoose.model('Service', ServiceSchema);

module.exports = Service;
