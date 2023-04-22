const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
require('dotenv').config();


exports.addUser = async (req, res) => {
  try {
    // Hash the password before storing it in the database
    const { firstName, lastName, userId, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ userId });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user object
    user = new User({ firstName, lastName, userId, password:hashedPassword });

    // Save user in database
    const savedUser = await user.save();
    savedUser.password=undefined
    res.status(201).json(savedUser);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};

exports.login = async (req, res) => {
  const { userId, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne( {userId:userId} )

    if (!user) {
      return res.status(401).json({ error: 'Invalid username ' });
    }

    // Check if password is correct
    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ error: ' password does not match' });
    }

    // Create JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    // Return user and token in response
    user.password = undefined;
    res.json({ user, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
