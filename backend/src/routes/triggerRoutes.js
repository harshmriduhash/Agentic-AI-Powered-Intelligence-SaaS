import express from 'express';
import { collectAllSources } from '../collectors/index.js';
import { processUnprocessedEvents } from '../scheduler/eventProcessor.js';
import { sendDigestImmediately } from '../scheduler/digestScheduler.js';
import { processUserPipeline, clearUserData } from '../scheduler/userPipeline.js';
import User from '../models/User.js';

const router = express.Router();

// Trigger data collection manually
router.post('/collect', async (req, res) => {
  try {
    console.log('Manual collection triggered');
    const result = await collectAllSources();
    
    res.json({
      success: true,
      message: 'Collection completed',
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Collection failed',
      error: error.message
    });
  }
});

// Trigger event processing manually
router.post('/process', async (req, res) => {
  try {
    console.log('Manual processing triggered');
    await processUnprocessedEvents();
    
    res.json({
      success: true,
      message: 'Processing completed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Processing failed',
      error: error.message
    });
  }
});

// Trigger email sending manually for specific user
router.post('/send-email/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const result = await sendDigestImmediately(req.params.userId);
    
    res.json({
      success: true,
      message: result.sent ? 'Email sent successfully' : 'No events to send',
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Email send failed',
      error: error.message
    });
  }
});

// Trigger all three at once: collect -> process -> send emails (USER-BASED)
// REQUIRED: userId in request body to process for ONLY that user
router.post('/full-pipeline', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required in request body',
        example: { userId: '694d12ab8ede01c5c0b9646d' }
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        userId
      });
    }
    
    if (!user.isActive || !user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'User is not active or verified',
        email: user.email
      });
    }

    console.log(`\n🚀 USER-BASED PIPELINE: Starting for ${user.email}`);
    console.log(`📍 Processing ONLY events for userId: ${userId}\n`);
    
    // Process everything for this user ONLY
    const result = await processUserPipeline(userId);
    
    res.json({
      success: true,
      message: 'User pipeline completed successfully',
      result
    });
  } catch (error) {
    console.error('Pipeline error:', error.message);
    res.status(500).json({
      success: false,
      message: 'User pipeline failed',
      error: error.message
    });
  }
});

// New endpoint: Clear data for SPECIFIC USER ONLY
// DELETE /api/trigger/clear-user-data/:userId
router.delete('/clear-user-data/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        userId
      });
    }

    const result = await clearUserData(userId);
    
    res.json({
      success: true,
      message: 'User data cleared successfully',
      result
    });
  } catch (error) {
    console.error('Clear user data error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to clear user data',
      error: error.message
    });
  }
});

export default router;

