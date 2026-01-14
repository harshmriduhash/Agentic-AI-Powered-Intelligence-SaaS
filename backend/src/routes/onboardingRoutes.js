import express from 'express';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Submit onboarding form
router.post('/submit', authenticate, async (req, res) => {
  try {
    const { interests, keywords, deliveryTimes, tone, minImportanceScore } = req.body;
    
    // Validation
    if (!interests || interests.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one interest'
      });
    }
    
    if (interests.length > 4) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 4 interests allowed'
      });
    }
    
    if (!deliveryTimes || deliveryTimes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one delivery time'
      });
    }
    
    if (deliveryTimes.length > 2) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 2 delivery times allowed'
      });
    }
    
    // Update user
    req.user.interests = interests;
    req.user.keywords = keywords || [];
    req.user.delivery = {
      type: 'email',
      times: deliveryTimes
    };
    req.user.preferences = {
      tone: tone || 'concise',
      minImportanceScore: minImportanceScore || 5
    };
    req.user.isOnboarded = true;
    
    await req.user.save();
    
    res.json({
      success: true,
      message: 'Preferences saved successfully',
      user: req.user.toSafeObject()
    });
    
  } catch (error) {
    console.error('Onboarding error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save preferences',
      error: error.message
    });
  }
});

// Get user preferences
router.get('/preferences', authenticate, (req, res) => {
  res.json({
    success: true,
    user: req.user.toSafeObject()
  });
});

// Update preferences
router.put('/preferences', authenticate, async (req, res) => {
  try {
    const { interests, keywords, deliveryTimes, tone, minImportanceScore } = req.body;
    
    // Validation (same as submit)
    if (interests && interests.length > 4) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 4 interests allowed'
      });
    }
    
    if (deliveryTimes && deliveryTimes.length > 2) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 2 delivery times allowed'
      });
    }
    
    // Update fields
    if (interests) req.user.interests = interests;
    if (keywords !== undefined) req.user.keywords = keywords;
    if (deliveryTimes) req.user.delivery.times = deliveryTimes;
    if (tone) req.user.preferences.tone = tone;
    if (minImportanceScore !== undefined) req.user.preferences.minImportanceScore = minImportanceScore;
    
    await req.user.save();
    
    res.json({
      success: true,
      message: 'Preferences updated successfully',
      user: req.user.toSafeObject()
    });
    
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences',
      error: error.message
    });
  }
});

export default router;