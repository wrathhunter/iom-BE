const Environment = require('../models/environment');

exports.getAllEnvironments = async (req, res) => {
  try {
    const environments = await Environment.find();
    res.status(200).json(environments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
