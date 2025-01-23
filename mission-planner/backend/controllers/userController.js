const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Create a new user
exports.createUser = async (req, res) => {
  try {
    const { email, name, password } = req.body;
    
    // Validate required fields
    if (!email || !name || !password) {
      return res.status(400).json({ 
        error: 'All fields are required',
        details: {
          email: !email ? 'Email is required' : null,
          name: !name ? 'Name is required' : null,
          password: !password ? 'Password is required' : null
        }
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'Email already exists',
        details: {
          email: 'This email is already registered'
        }
      });
    }

    console.log('Creating user with:', { email, name });
    try {
      const user = await User.create({ 
        email, 
        name, 
        password,
        created: new Date(),
        created_by: 'system'
      });
      
      console.log('User created successfully:', user.id);
      
      // Return user data without password
      const userResponse = user.toJSON();
      delete userResponse.password;
      res.status(201).json(userResponse);
    } catch (createError) {
      console.error('Error creating user:', createError);
      throw createError;
    }
  } catch (error) {
    console.error('Validation error details:', error);
    res.status(400).json({ 
      error: 'Validation error',
      details: {
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        validationErrors: error.errors ? error.errors.map(err => ({
          message: err.message,
          type: err.type,
          path: err.path,
          value: err.value
        })) : undefined
      }
    });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single user
exports.getUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    await user.update(req.body);
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    await user.destroy();
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// User login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    console.log('Comparing passwords:', {
      inputPassword: password,
      storedHash: user.password
    });
    
    const isValid = user.validPassword(password);
    console.log('Password comparison result:', isValid);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Find user by email
exports.findUserByEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const user = await User.findOne({ 
      where: { email },
      attributes: ['id']
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ id: user.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cleanup user by email
exports.cleanupUser = async (req, res) => {
  try {
    console.log('Cleaning up user with email:', req.params.email);
    const user = await User.findOne({ where: { email: req.params.email } });
    if (!user) {
      console.log('User not found for email:', req.params.email);
      return res.status(404).json({ error: 'User not found' });
    }
    console.log('Found user with ID:', user.id);
    await user.destroy();
    console.log('Successfully deleted user');
    res.status(204).end();
  } catch (error) {
    console.error('Error during user cleanup:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
