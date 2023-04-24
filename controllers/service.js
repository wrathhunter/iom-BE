const Service = require('../models/service');
const Branch=require('../models/branch');
const Environment = require('../models/environment');
//This function updates the state of a branch for a given service.
// It first finds the service by name and populates its branches. 
//If the service is not found, it returns a 404 error. 
//It then finds the branch by name and if it is not found, it returns a 404 error. 
//It updates the state of the branch with the new state provided in the request body and saves it. 
//Finally, it returns the updated branch with a 200 status code. 
//If there is an error, it returns a 500 status code with an error message.
exports.updateBranchState = async (req, res) => {
  try {
    const service = await Service.findOne({ name: req.body.serviceName }).populate('branches');
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const branch = service.branches.find(branch => branch.name === req.params.name);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    branch.state = req.body.state;
    await branch.save();

    return res.status(200).json(branch);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
//This function deploys a specific branch of a service. 
//It takes the service name and branch name from the request parameters and body, respectively. 
//It then finds the service and its branches using the service name and populates the branches. 
//If the service or branch is not found, it returns an error message. 
//It then sets the deployed status of the specified branch to true and all other branches to false. Finally,
// it saves the changes and returns a success message. 
//If there is an error, it returns an internal server error message.
exports.deployService=async(req,res)=>{
  try {
    const serviceName = req.params.name;
    const branchName = req.body.name;

    const service = await Service.findOne({name:serviceName}).populate('branches');

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const branch = service.branches.find(b => b.name === branchName);

    if (!branch) {
      return res.status(400).json({ message: `Branch "${branchName}" not found in the service's branches array` });
    }

    await Promise.all(service.branches.map(b => {
      if (b.name === branchName) {
        b.deployed = true;
      } else {
        b.deployed = false;
      }
      return b.save();
    }));

    await service.save();

    res.json({ message: `Successfully deployed branch "${branchName}" for service "${service.name}"` });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}
//This function adds a new branch to a service. 
//It takes in the branch name and state from the request body, and the service name from the request parameters. 
//It then checks if the service exists, creates a new branch object, saves it to the database, 
//adds the branch to the service's branches array, and saves the service. Finally, 
//it returns a success message and the newly created branch object. If there is an error, 
//it returns an error message with a 500 status code.
exports.addBranchToService = async (req, res) => {
  try {
    const { name, state } = req.body;
    const serviceName = req.params.name;
    const service = await Service.findOne({name:serviceName});
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const branch = new Branch({ name, state ,deployed:false});
    await branch.save();

    service.branches.push(branch._id);
    await service.save();

    res.status(201).json({ message: 'Branch added successfully', branch });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
//This function adds a new service to an environment. It first checks if the environment exists,
// and if the service already exists in the environment. If not, it creates a new branch and service,
// and adds the service to the environment. Finally, it returns the created service. If there is an error,
// it returns an error message.
exports.addServiceToEnvironment = async (req, res) => {
  const environmentName = req.params.name;
  const { name } = req.body;

  try {
    const environment = await Environment.findOne({name:environmentName}).populate('services');
    if (!environment) {
      return res.status(404).send({ message: 'Environment not found' });
    }

    const serviceExists = environment.services.some(service => service.name === name);
    if (serviceExists) {
      return res.status(400).send({ message: 'Service already exists in the environment' });
    }

    const masterBranch = new Branch({ name: 'master', state: 'stable', deployed:true });
    const createdBranch = await masterBranch.save();

    const service = new Service({ name, branches: [createdBranch._id]});
    const createdService = await service.save();

    environment.services.push(createdService._id);
    await environment.save();

    return res.status(201).send(createdService);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'Internal server error' });
  }
};
//This function adds a new environment to the database with the name and services provided in the request body. 
//If successful, it returns a 201 status code with a message indicating success. 
//If there is an error, it returns a 500 status code with an error message.
exports.addEnvironment = async (req, res) => {
  try {
    const { name, services } = req.body;

    const environment = new Environment({ name, services });
    await environment.save();

    return res.status(201).json({ message: 'Environment added successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
//This function retrieves all services from a specific environment by environment name. 
//It first extracts the environment name from the request parameters,
// then uses it to find the environment in the database using the Environment model. 
//The services associated with the environment are then populated with their respective branches using the Branch model. 
//If the environment is not found, a 404 error is returned. Otherwise, the environment object is returned in the response.
exports.getAllServiceFromAnEnvironment= async (req,res) =>{
  try{
    const environmentName = req.params.name;

const environment = await Environment.findOne({ name: environmentName }).populate({
  path: 'services',
  populate: {
    path: 'branches',
    model: Branch,
  },
});

    const services = environment.services;

    if (!environment) {
      return res.status(404).json({ error: 'Environment not found' });
    }

    res.json( environment );
  }catch(error){
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
