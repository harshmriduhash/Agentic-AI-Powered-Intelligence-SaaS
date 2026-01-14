import UserEvent from '../models/UserEvent.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

class FeedbackAnalyzer {
  async analyzeUserFeedback(userId) {
    const user = await User.findById(userId);
    const feedback = await UserEvent.find({
      userId,
      rating: { $exists: true }
    })
    .populate('eventId')
    .sort({ ratedAt: -1 })
    .limit(100);

    if (feedback.length === 0) {
      return {
        hasData: false,
        message: 'No feedback data available'
      };
    }

    const analysis = {
      totalRatings: feedback.length,
      avgRating: 0,
      categoryPerformance: {},
      topicPerformance: {},
      sourcePerformance: {},
      recommendations: []
    };

    // Calculate averages
    analysis.avgRating = feedback.reduce((sum, fb) => sum + fb.rating, 0) / feedback.length;

    // Category performance
    const categoryRatings = {};
    const topicRatings = {};
    const sourceRatings = {};

    feedback.forEach(fb => {
      const event = fb.eventId;
      
      // Category
      if (!categoryRatings[event.category]) {
        categoryRatings[event.category] = [];
      }
      categoryRatings[event.category].push(fb.rating);

      // Topics
      event.topics.forEach(topic => {
        if (!topicRatings[topic]) {
          topicRatings[topic] = [];
        }
        topicRatings[topic].push(fb.rating);
      });

      // Source
      if (!sourceRatings[event.source]) {
        sourceRatings[event.source] = [];
      }
      sourceRatings[event.source].push(fb.rating);
    });

    // Calculate averages for each
    analysis.categoryPerformance = this.calculateAverages(categoryRatings);
    analysis.topicPerformance = this.calculateAverages(topicRatings);
    analysis.sourcePerformance = this.calculateAverages(sourceRatings);

    // Generate recommendations
    analysis.recommendations = this.generateRecommendations(analysis, user);

    logger.info('Feedback analyzed', {
      userId,
      totalRatings: analysis.totalRatings,
      avgRating: analysis.avgRating.toFixed(2)
    });

    return analysis;
  }

  calculateAverages(ratingsMap) {
    const result = {};
    
    for (const [key, ratings] of Object.entries(ratingsMap)) {
      const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
      result[key] = {
        avgRating: avg,
        count: ratings.length
      };
    }

    return result;
  }

  generateRecommendations(analysis, user) {
    const recommendations = [];

    // Low overall rating
    if (analysis.avgRating < 3) {
      recommendations.push({
        type: 'overall_low',
        message: 'Your overall satisfaction is low. Consider updating your interests or keywords.',
        action: 'update_preferences'
      });
    }

    // Find underperforming categories
    for (const [category, stats] of Object.entries(analysis.categoryPerformance)) {
      if (stats.avgRating < 2.5 && stats.count > 5) {
        recommendations.push({
          type: 'category_underperforming',
          message: `You rarely find "${category}" events useful. Consider filtering them out.`,
          action: 'adjust_category',
          data: { category }
        });
      }
    }

    // Find high-performing topics not in interests
    for (const [topic, stats] of Object.entries(analysis.topicPerformance)) {
      if (stats.avgRating >= 4 && stats.count > 3 && !user.interests.includes(topic)) {
        recommendations.push({
          type: 'topic_suggestion',
          message: `You seem to enjoy "${topic}" content. Consider adding it to your interests.`,
          action: 'add_interest',
          data: { topic }
        });
      }
    }

    return recommendations;
  }

  async getSystemWideFeedback() {
    const allFeedback = await UserEvent.find({
      rating: { $exists: true }
    }).populate('eventId');

    const stats = {
      totalFeedback: allFeedback.length,
      avgRating: 0,
      ratingDistribution: { 1: 0, 3: 0, 5: 0 },
      categoryPerformance: {},
      topPerformingEvents: [],
      lowPerformingEvents: []
    };

    if (allFeedback.length === 0) return stats;

    // Calculate distribution
    allFeedback.forEach(fb => {
      stats.ratingDistribution[fb.rating]++;
    });

    stats.avgRating = allFeedback.reduce((sum, fb) => sum + fb.rating, 0) / allFeedback.length;

    // Find top/low performing events
    const eventRatings = {};
    
    allFeedback.forEach(fb => {
      const eventId = fb.eventId._id.toString();
      if (!eventRatings[eventId]) {
        eventRatings[eventId] = {
          event: fb.eventId,
          ratings: []
        };
      }
      eventRatings[eventId].ratings.push(fb.rating);
    });

    const eventStats = Object.values(eventRatings).map(({ event, ratings }) => ({
      event,
      avgRating: ratings.reduce((sum, r) => sum + r, 0) / ratings.length,
      count: ratings.length
    }));

    stats.topPerformingEvents = eventStats
      .filter(e => e.count >= 3)
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 10);

    stats.lowPerformingEvents = eventStats
      .filter(e => e.count >= 3)
      .sort((a, b) => a.avgRating - b.avgRating)
      .slice(0, 10);

    return stats;
  }
}

export default new FeedbackAnalyzer();