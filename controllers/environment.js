const Environment = require('../models/environment');
//This function is an asynchronous function that retrieves all the environments from the database using the Environment model. 
// If successful, it returns a JSON response with a status code of 200 and the retrieved environments. 
// If an error occurs, it logs the error and returns a JSON response with a status code of 500 and an error message.
exports.getAllEnvironments = async (req, res) => {
  try {
    const environments = await Environment.find();
    res.status(200).json(environments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
