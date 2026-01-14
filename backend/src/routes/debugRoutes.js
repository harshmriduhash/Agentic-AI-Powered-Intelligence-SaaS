import express from 'express';
import Event from '../models/Events.js';
import UserEvent from '../models/UserEvent.js';
import User from '../models/User.js';
import UserProcessingState from '../models/UserProcessingState.js';
import { collectAllSources } from '../collectors/index.js';
import { processUnprocessedEvents } from '../scheduler/eventProcessor.js';
import emailService from '../services/emailService.js';

const router = express.Router();

console.log('🔧 Debug routes loaded');

// Check database status
router.get('/status', async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const unprocessedEvents = await Event.countDocuments({ aiProcessed: false });
    const processedEvents = await Event.countDocuments({ aiProcessed: true });
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true, isVerified: true });
    const totalUserEvents = await UserEvent.countDocuments();
    const unsentUserEvents = await UserEvent.countDocuments({ sent: false });

    res.json({
      success: true,
      events: {
        total: totalEvents,
        unprocessed: unprocessedEvents,
        processed: processedEvents
      },
      users: {
        total: totalUsers,
        active: activeUsers
      },
      userEvents: {
        total: totalUserEvents,
        unsent: unsentUserEvents
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get events for a specific user
router.get('/user/:userId/events', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get unsent UserEvents for this user
    const userEvents = await UserEvent.find({
      userId,
      sent: false
    }).populate('eventId');

    res.json({
      success: true,
      user: {
        email: user.email,
        keywords: user.preferences?.keywords,
        interests: user.preferences?.interests
      },
      events: userEvents,
      count: userEvents.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all unprocessed events
router.get('/unprocessed', async (req, res) => {
  try {
    const events = await Event.find({ aiProcessed: false }).limit(10);

    res.json({
      success: true,
      count: events.length,
      events: events.map(e => ({
        id: e._id,
        title: e.title,
        source: e.source,
        url: e.url
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Clear all events (for testing)
router.post('/clear-events', async (req, res) => {
  try {
    const eventCount = await Event.deleteMany({});
    const userEventCount = await UserEvent.deleteMany({});

    res.json({
      success: true,
      message: 'Database cleared',
      deleted: {
        events: eventCount.deletedCount,
        userEvents: userEventCount.deletedCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get user processing state and history
router.get('/user/:userId/processing-state', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let userState = await UserProcessingState.findOne({ userId });

    if (!userState) {
      return res.json({
        success: true,
        message: 'No processing state for user yet',
        user: {
          userId,
          email: user.email
        },
        state: null
      });
    }

    res.json({
      success: true,
      user: {
        userId,
        email: user.email
      },
      state: {
        currentPhase: userState.currentState.currentPhase,
        isProcessing: userState.currentState.isProcessing,
        lastStateUpdate: userState.currentState.lastStateUpdate,
        stats: userState.stats,
        processedEventsCount: userState.processedEventIds.length,
        recentErrorsCount: userState.recentErrors.length,
        recentActionsCount: userState.actionHistory.length,
        lastUpdated: userState.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get user's action history
router.get('/user/:userId/action-history', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userState = await UserProcessingState.findOne({ userId });

    if (!userState) {
      return res.json({
        success: true,
        user: { userId, email: user.email },
        actionHistory: []
      });
    }

    res.json({
      success: true,
      user: { userId, email: user.email },
      totalActions: userState.actionHistory.length,
      actionHistory: userState.actionHistory.reverse() // Latest first
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get user's error history
router.get('/user/:userId/errors', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userState = await UserProcessingState.findOne({ userId });

    if (!userState) {
      return res.json({
        success: true,
        user: { userId, email: user.email },
        errors: []
      });
    }

    res.json({
      success: true,
      user: { userId, email: user.email },
      totalErrors: userState.recentErrors.length,
      totalErrorsEncountered: userState.stats.totalErrorsEncountered,
      recentErrors: userState.recentErrors.reverse() // Latest first
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all users' processing statistics
router.get('/all-users-stats', async (req, res) => {
  try {
    const allStates = await UserProcessingState.find({});

    const stats = allStates.map(state => ({
      userId: state.userId,
      email: state.email,
      stats: state.stats,
      processedEventsCount: state.processedEventIds.length,
      currentPhase: state.currentState.currentPhase,
      lastUpdated: state.updatedAt
    }));

    res.json({
      success: true,
      totalUsers: stats.length,
      users: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Force collection and processing
router.post('/force-sync', async (req, res) => {
  try {
    console.log('\n🔄 Manual force-sync triggered via API');
    await collectAllSources();
    await processUnprocessedEvents();
    res.json({ success: true, message: 'Collection and processing triggered' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send digest for current user now
router.post('/send-my-digest', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const result = await emailService.sendDigest(user);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
