const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

function signToken(userId) {
  const secret = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';
  return jwt.sign({ id: userId }, secret, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
}

function sanitizeUser(userDoc) {
  return {
    id: userDoc._id,
    name: userDoc.name,
    email: userDoc.email,
    phone: userDoc.phone || '',
  };
}

function demoConfig() {
  return {
    email: String(process.env.DEMO_EMAIL || 'demo@tradzo.in').toLowerCase(),
    password: String(process.env.DEMO_PASSWORD || 'demo123'),
    name: String(process.env.DEMO_NAME || 'Demo Investor'),
  };
}

router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name should be 2-80 characters'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password should be at least 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    try {
      const { name, email, password } = req.body;
      const existingUser = await User.findOne({ email: String(email).toLowerCase() });

      if (existingUser) {
        return res.status(409).json({ message: 'Email is already registered' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        name: String(name).trim(),
        email: String(email).toLowerCase().trim(),
        password: hashedPassword,
      });

      const token = signToken(user._id);
      return res.status(201).json({ token, user: sanitizeUser(user) });
    } catch (error) {
      return res.status(500).json({ message: 'Registration failed', error: error.message });
    }
  },
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 1 }).withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    try {
      const { email, password } = req.body;
      const cfg = demoConfig();
      const emailLower = String(email).toLowerCase().trim();

      if (emailLower === cfg.email && password === cfg.password) {
        const secret = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';
        const token = jwt.sign(
          {
            id: 'demo-user',
            demo: true,
            email: cfg.email,
            name: cfg.name,
          },
          secret,
          { expiresIn: process.env.JWT_EXPIRE || '30d' },
        );

        return res.json({
          token,
          user: {
            id: 'demo-user',
            name: cfg.name,
            email: cfg.email,
            phone: '',
            isDemo: true,
          },
        });
      }

      const user = await User.findOne({ email: emailLower }).select('+password');
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = signToken(user._id);
      return res.json({ token, user: sanitizeUser(user) });
    } catch (error) {
      return res.status(500).json({ message: 'Login failed', error: error.message });
    }
  },
);

router.get('/me', auth, async (req, res) => {
  if (req.user.demo) {
    return res.json({
      user: {
        id: 'demo-user',
        name: req.user.name || demoConfig().name,
        email: req.user.email || demoConfig().email,
        phone: '',
        isDemo: true,
      },
    });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({ user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
});

module.exports = router;
