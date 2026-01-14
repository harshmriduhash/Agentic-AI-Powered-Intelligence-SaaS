import express from 'express';
import Event from '../models/Events.js';
import UserEvent from '../models/UserEvent.js';

const router = express.Router();

// Simple auth middleware (replace with real auth in production)
const adminAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized'
    });
  }
  next();
};

router.use(adminAuth);

// Get events pending review
router.get('/review/pending', async (req, res) => {
  try {
    const events = await Event.find({
      needsHumanReview: true,
      reviewStatus: 'pending'
    })
    .sort({ importanceScore: -1, createdAt: -1 })
    .limit(50);

    // Get affected user counts
    const eventsWithUserCounts = await Promise.all(
      events.map(async (event) => {
        const userCount = await UserEvent.countDocuments({ eventId: event._id });
        return {
          ...event.toObject(),
          affectedUsers: userCount
        };
      })
    );

    res.json({
      success: true,
      events: eventsWithUserCounts
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending reviews',
      error: error.message
    });
  }
});

// Approve event
router.post('/review/:eventId/approve', async (req, res) => {
  try {
    const { reviewerName } = req.body;

    const event = await Event.findByIdAndUpdate(
      req.params.eventId,
      {
        reviewStatus: 'approved',
        reviewedBy: reviewerName || 'Admin',
        needsHumanReview: false
      },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      message: 'Event approved',
      event
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Approval failed',
      error: error.message
    });
  }
});

// Edit and approve event
router.put('/review/:eventId/edit', async (req, res) => {
  try {
    const { summary, reviewerName } = req.body;

    const event = await Event.findByIdAndUpdate(
      req.params.eventId,
      {
        summary,
        reviewStatus: 'edited',
        reviewedBy: reviewerName || 'Admin',
        needsHumanReview: false
      },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      message: 'Event edited and approved',
      event
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Edit failed',
      error: error.message
    });
  }
});

// Reject event
router.post('/review/:eventId/reject', async (req, res) => {
  try {
    const { reviewerName } = req.body;

    const event = await Event.findByIdAndUpdate(
      req.params.eventId,
      {
        reviewStatus: 'rejected',
        reviewedBy: reviewerName || 'Admin',
        needsHumanReview: false
      },
      { new: true }
    );

    // Remove from all user queues
    await UserEvent.deleteMany({ eventId: event._id });

    res.json({
      success: true,
      message: 'Event rejected'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Rejection failed',
      error: error.message
    });
  }
});

// Get system stats
router.get('/stats', async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const processedEvents = await Event.countDocuments({ aiProcessed: true });
    const pendingReview = await Event.countDocuments({ 
      needsHumanReview: true, 
      reviewStatus: 'pending' 
    });
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });

    res.json({
      success: true,
      stats: {
        events: {
          total: totalEvents,
          processed: processedEvents,
          pendingReview
        },
        users: {
          total: totalUsers,
          active: activeUsers
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats',
      error: error.message
    });
  }
});

export default router;