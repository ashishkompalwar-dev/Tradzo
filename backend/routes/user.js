const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

function sanitizeUser(userDoc) {
  return {
    id: userDoc._id,
    name: userDoc.name,
    email: userDoc.email,
    phone: userDoc.phone || '',
  };
}

router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({ user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
});

router.put(
  '/profile',
  auth,
  [
    body('name').optional().trim().isLength({ min: 2, max: 80 }).withMessage('Name should be 2-80 characters'),
    body('phone').optional().trim().isLength({ min: 6, max: 20 }).withMessage('Phone should be 6-20 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (typeof req.body.name === 'string') {
        user.name = req.body.name.trim();
      }
      if (typeof req.body.phone === 'string') {
        user.phone = req.body.phone.trim();
      }

      await user.save();
      return res.json({ message: 'Profile updated', user: sanitizeUser(user) });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to update profile', error: error.message });
    }
  },
);

module.exports = router;
