import Event from '../models/Events.js';
import UserEvent from '../models/UserEvent.js';
import logger from '../utils/logger.js';

class ReviewQueue {
  async addToQueue(event, reason) {
    try {
      // Ensure event is a Mongoose document, not a plain object
      let eventDoc = event;
      if (!event.save || typeof event.save !== 'function') {
        // If it's a plain object, find the actual Event document
        eventDoc = await Event.findById(event._id);
      }

      if (!eventDoc) {
        logger.warn('Event not found for review queue', { eventId: event._id });
        return;
      }

      eventDoc.needsHumanReview = true;
      eventDoc.reviewStatus = 'pending';
      
      if (!eventDoc.rawData) eventDoc.rawData = {};
      eventDoc.rawData.reviewReason = reason;

      await eventDoc.save();

      // Get count of affected users
      const affectedUsers = await UserEvent.countDocuments({ eventId: eventDoc._id });

      logger.warn('Event added to review queue', {
        eventId: eventDoc._id,
        title: eventDoc.title,
        reason,
        affectedUsers,
        category: eventDoc.category,
        importanceScore: eventDoc.importanceScore
      });

      // TODO: Send notification to admin (Slack, email, etc.)
      this.notifyAdmin(eventDoc, reason, affectedUsers);

      return eventDoc;
    } catch (error) {
      logger.error('Error adding event to review queue:', error.message);
      throw error;
    }
  }

  async getQueueStats() {
    const pending = await Event.countDocuments({
      needsHumanReview: true,
      reviewStatus: 'pending'
    });

    const approved = await Event.countDocuments({
      needsHumanReview: true,
      reviewStatus: 'approved'
    });

    const rejected = await Event.countDocuments({
      needsHumanReview: true,
      reviewStatus: 'rejected'
    });

    const edited = await Event.countDocuments({
      needsHumanReview: true,
      reviewStatus: 'edited'
    });

    return {
      pending,
      approved,
      rejected,
      edited,
      total: pending + approved + rejected + edited
    };
  }

  async getPendingReviews(limit = 50) {
    const events = await Event.find({
      needsHumanReview: true,
      reviewStatus: 'pending'
    })
    .sort({ importanceScore: -1, createdAt: -1 })
    .limit(limit);

    // Add affected user counts
    const eventsWithStats = await Promise.all(
      events.map(async (event) => {
        const affectedUsers = await UserEvent.countDocuments({ 
          eventId: event._id 
        });
        
        return {
          ...event.toObject(),
          affectedUsers,
          reviewReason: event.rawData?.reviewReason
        };
      })
    );

    return eventsWithStats;
  }

  async approve(eventId, reviewerName = 'Admin') {
    const event = await Event.findByIdAndUpdate(
      eventId,
      {
        reviewStatus: 'approved',
        reviewedBy: reviewerName,
        needsHumanReview: false
      },
      { new: true }
    );

    logger.info('Event approved', {
      eventId,
      reviewer: reviewerName,
      title: event.title
    });

    return event;
  }

  async reject(eventId, reviewerName = 'Admin', reason = '') {
    const event = await Event.findByIdAndUpdate(
      eventId,
      {
        reviewStatus: 'rejected',
        reviewedBy: reviewerName,
        needsHumanReview: false
      },
      { new: true }
    );

    // Remove from all user queues
    await UserEvent.deleteMany({ eventId });

    logger.info('Event rejected', {
      eventId,
      reviewer: reviewerName,
      reason,
      title: event.title
    });

    return event;
  }

  async edit(eventId, updates, reviewerName = 'Admin') {
    const event = await Event.findByIdAndUpdate(
      eventId,
      {
        ...updates,
        reviewStatus: 'edited',
        reviewedBy: reviewerName,
        needsHumanReview: false
      },
      { new: true }
    );

    logger.info('Event edited and approved', {
      eventId,
      reviewer: reviewerName,
      title: event.title
    });

    return event;
  }

  notifyAdmin(event, reason, affectedUsers) {
    // Simple console notification for now
    console.log('\n' + '='.repeat(60));
    console.log('🚨 HUMAN REVIEW REQUIRED');
    console.log('='.repeat(60));
    console.log(`Event: ${event.title}`);
    console.log(`Reason: ${reason}`);
    console.log(`Category: ${event.category}`);
    console.log(`Importance: ${event.importanceScore}/10`);
    console.log(`Affected Users: ${affectedUsers}`);
    console.log(`URL: ${event.url}`);
    console.log('='.repeat(60) + '\n');

    // TODO: Integrate with Slack/Discord/Email
    // this.sendSlackNotification(event, reason, affectedUsers);
  }

  // Future: Slack integration
  async sendSlackNotification(event, reason, affectedUsers) {
    // Implementation for Slack webhook
    // const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    // await axios.post(webhookUrl, { ... });
  }
}

export default new ReviewQueue();