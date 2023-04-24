const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
require('dotenv').config();

//This code exports an asynchronous function that adds a new user to the database. 
//It first checks if the user already exists, and if so, returns an error message. 
//If the user does not exist, it hashes the password and creates a new user object with the provided information. 
//The user object is then saved in the database and returned in the response with the password field set to undefined. 
//If there is an error, it logs the error message and returns a server error message.
exports.addUser = async (req, res) => {
  try {
    const { firstName, lastName, userId, password } = req.body;

    let user = await User.findOne({ userId });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    user = new User({ firstName, lastName, userId, password:hashedPassword });

    const savedUser = await user.save();
    savedUser.password=undefined
    res.status(201).json(savedUser);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};
//This is the login function that takes in a user ID and password from the request body. 
//It then tries to find a user with the given user ID and checks if the password matches the hashed password stored in the database. 
//If the user is not found or the password does not match, it returns an error response. 
//If the user is authenticated, it generates a JWT token and sends it along with the user object in the response. 
//If there is a server error, it returns a 500 status code with an error message.
exports.login = async (req, res) => {
  const { userId, password } = req.body;

  try {
    const user = await User.findOne( {userId:userId} )

    if (!user) {
      return res.status(401).json({ error: 'Invalid username ' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ error: ' password does not match' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    user.password = undefined;
    res.json({ user, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
