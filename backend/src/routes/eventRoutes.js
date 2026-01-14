import express from 'express';
import Event from '../models/Events.js';
import UserEvent from '../models/UserEvent.js';

const router = express.Router();

// Get user's personalized events
router.get('/user/:userId', async (req, res) => {
  try {
    const { category, topic, limit = 20, page = 1 } = req.query;

    const query = { userId: req.params.userId, sent: true };

    const userEvents = await UserEvent.find(query)
      .sort({ relevanceScore: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('eventId');

    // Filter by category/topic if provided
    let filteredEvents = userEvents;

    if (category) {
      filteredEvents = filteredEvents.filter(ue =>
        ue.eventId.category === category
      );
    }

    if (topic) {
      filteredEvents = filteredEvents.filter(ue =>
        ue.eventId.topics.includes(topic)
      );
    }

    res.json({
      success: true,
      events: filteredEvents.map(ue => ({
        id: ue.eventId._id,
        title: ue.eventId.title,
        category: ue.eventId.category,
        topics: ue.eventId.topics,
        summary: ue.eventId.summary,
        url: ue.eventId.url,
        source: ue.eventId.source,
        publishedAt: ue.eventId.publishedAt,
        relevanceScore: ue.relevanceScore,
        rating: ue.rating,
        sentAt: ue.sentAt
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredEvents.length
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: error.message
    });
  }
});

// Track event view
router.patch('/user/:userId/event/:eventId/view', async (req, res) => {
  try {
    await UserEvent.findOneAndUpdate(
      { userId: req.params.userId, eventId: req.params.eventId },
      { opened: true, clicked: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single event details
router.get('/:eventId', async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      event: {
        id: event._id,
        title: event.title,
        content: event.content,
        category: event.category,
        topics: event.topics,
        summary: event.summary,
        url: event.url,
        source: event.source,
        importanceScore: event.importanceScore,
        publishedAt: event.publishedAt,
        processedAt: event.processedAt
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event',
      error: error.message
    });
  }
});

// Get events statistics for user
router.get('/user/:userId/stats', async (req, res) => {
  try {
    const stats = await UserEvent.aggregate([
      { $match: { userId: req.params.userId, sent: true } },
      {
        $lookup: {
          from: 'events',
          localField: 'eventId',
          foreignField: '_id',
          as: 'event'
        }
      },
      { $unwind: '$event' },
      {
        $group: {
          _id: '$event.category',
          count: { $sum: 1 },
          avgRelevance: { $avg: '$relevanceScore' }
        }
      }
    ]);

    const totalEvents = await UserEvent.countDocuments({
      userId: req.params.userId,
      sent: true
    });

    const emailsSent = await UserEvent.countDocuments({
      userId: req.params.userId,
      sent: true,
      sentAt: { $exists: true }
    });

    const eventsViewed = await UserEvent.countDocuments({
      userId: req.params.userId,
      opened: true
    });

    const avgRatingResult = await UserEvent.aggregate([
      { $match: { userId: req.params.userId, rating: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' }
        }
      }
    ]);

    const avgRating = avgRatingResult.length > 0 ? avgRatingResult[0].avgRating : null;

    res.json({
      success: true,
      stats: {
        totalEvents,
        emailsSent,
        eventsViewed,
        avgRating,
        byCategory: stats
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