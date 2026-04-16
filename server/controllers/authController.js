const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
    },
  });
};

// @POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // --- Field validation ---
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all fields: name, email and password are required.',
      });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters long.',
      });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // --- Check duplicate email ---
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists. Please login instead.',
      });
    }

    // --- Create user ---
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    // Mongoose duplicate key error (race condition fallback)
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }
    console.error('Register error:', err);
    res.status(500).json({
      success: false,
      message: 'Something went wrong on our end. Please try again.',
    });
  }
};

// @POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // --- Field validation ---
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter both your email and password.',
      });
    }

    // --- Find user ---
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No account found with this email address. Please register first.',
      });
    }

    // --- Check password ---
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please try again.',
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: 'Something went wrong on our end. Please try again.',
    });
  }
};

// @GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }
    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('GetMe error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user details.',
    });
  }
};

module.exports = { register, login, getMe };