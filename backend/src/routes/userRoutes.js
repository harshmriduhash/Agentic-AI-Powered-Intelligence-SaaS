import express from 'express';
import User from '../models/User.js';
import UserEvent from '../models/UserEvent.js';
import crypto from 'crypto';

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, interests, keywords, deliveryTimes, tone, minImportanceScore } = req.body;

    // Validation
    if (!email || !interests || !deliveryTimes || deliveryTimes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Email, interests, and delivery times are required'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      interests,
      keywords: keywords || [],
      delivery: {
        type: 'email',
        times: deliveryTimes
      },
      preferences: {
        tone: tone || 'concise',
        minImportanceScore: minImportanceScore || 5
      },
      verificationToken,
      isVerified: true, // For now, auto-verify (we'll add email verification later)
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      user: {
        id: user._id,
        email: user.email,
        interests: user.interests,
        deliveryTimes: user.delivery.times
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// Get user profile
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        interests: user.interests,
        keywords: user.keywords,
        delivery: user.delivery,
        preferences: user.preferences,
        isActive: user.isActive
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
});

// Update user preferences
router.put('/:userId', async (req, res) => {
  try {
    const { interests, keywords, deliveryTimes, tone, minImportanceScore } = req.body;

    const updateData = {};
    if (interests) updateData.interests = interests;
    if (keywords) updateData.keywords = keywords;
    if (deliveryTimes) updateData['delivery.times'] = deliveryTimes;
    if (tone) updateData['preferences.tone'] = tone;
    if (minImportanceScore !== undefined) updateData['preferences.minImportanceScore'] = minImportanceScore;

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { $set: updateData },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Preferences updated',
      user: {
        id: user._id,
        interests: user.interests,
        keywords: user.keywords,
        delivery: user.delivery,
        preferences: user.preferences
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Update failed',
      error: error.message
    });
  }
});

// Unsubscribe
router.post('/:userId/unsubscribe', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Successfully unsubscribed'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unsubscribe failed',
      error: error.message
    });
  }
});

// Delete account
router.delete('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // 1. Delete user events
    await UserEvent.deleteMany({ userId });

    // 2. Delete user
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Account successfully deleted'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete account',
      error: error.message
    });
  }
});

export default router;