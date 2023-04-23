const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const auth=require('./middleware/auth')
// Import the task and user controllers
const userController = require('./controllers/user');
const environmentController=require('./controllers/environment')
const serviceController=require('./controllers/service')
const cors = require('cors');



const app = express();
// Allow all origins
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const dbUri = 'mongodb+srv://sibaprasadpanda100:xgxJSmmLE5vnjrTt@cluster0.i3ewhw4.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;

db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to database'));



// Define the task routes
app.post('/api/create-user',userController.addUser);
app.post('/api/login',userController.login);
app.get('/api/getAllEnvironments',auth,environmentController.getAllEnvironments);
app.post('/api/addEnvironment',auth,serviceController.addEnvironment);
app.post('/api/addService/:environmentId', auth,serviceController.addServiceToEnvironment);
app.post('/api/addBranch/:serviceId', auth,serviceController.addBranchToService);
app.post('/api/updateBranch/:id', auth,serviceController.updateBranchState);
app.get('/api/getAllServiceFromAnEnvironment/:id',auth,serviceController.getAllServiceFromAnEnvironment)
app.post('/api/deployService/:serviceId',auth,serviceController.deployService)

app.listen(4000, () => console.log('Server started on port 4000'));
