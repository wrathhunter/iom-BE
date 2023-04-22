const Service = require('../models/service');
const Branch=require('../models/branch');
const Environment = require('../models/environment');

exports.updateBranchState = async (req, res) => {
  try {
    // Find the branch by ID
    const branch = await Branch.findById(req.params.id);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    // Update the state of the branch
    branch.state = req.body.state;
    await branch.save();

    // Return the updated branch
    return res.status(200).json(branch);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.deployService=async(req,res)=>{
  try {
    const serviceId = req.params.serviceId;
    const branchName = req.body.name;

    // Find the service by id
    const service = await Service.findById(serviceId).populate('branches');

    // Check if the service exists
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Find the branch by name in the service's branches array
    const branch = service.branches.find(b => b.name === branchName);

    // Check if the branch exists in the service's branches array
    if (!branch) {
      return res.status(400).json({ message: `Branch "${branchName}" not found in the service's branches array` });
    }

    // Set the deployed field of all branches in the service to false, except the branch received in the request payload
    await Promise.all(service.branches.map(b => {
      if (b.name === branchName) {
        b.deployed = true;
      } else {
        b.deployed = false;
      }
      return b.save();
    }));

    // Save the service
    await service.save();

    res.json({ message: `Successfully deployed branch "${branchName}" for service "${service.name}"` });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.addBranchToService = async (req, res) => {
  try {
    const { name, state } = req.body;
    const serviceId = req.params.serviceId;

    const service = await Service.findById(serviceId);
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

exports.addServiceToEnvironment = async (req, res) => {
  const environmentId = req.params.environmentId;
  const { name } = req.body;

  try {
    const environment = await Environment.findById(environmentId).populate('services');
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

exports.getAllServiceFromAnEnvironment= async (req,res) =>{
  try{
    const environmentId = req.params.id;

    // Find the environment by ID and populate its services array with the associated services and branches
    const environment = await Environment.findById(environmentId).populate({
      path: 'services',
      populate: {
        path: 'branches',
        model: Branch,
      },
    });

    const services = environment.services;

    // If the environment was not found, return a 404 response
    if (!environment) {
      return res.status(404).json({ error: 'Environment not found' });
    }

    // Return the environment with its populated services and branches
    res.json({ environment });
  }catch(error){
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
