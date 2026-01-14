import User from "../models/User.js";
import Event from "../models/Events.js";
import UserEvent from "../models/UserEvent.js";
import Thread from "../models/Thread.js";

class ContextBuilder {
  async buildUserContext(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Get user's recent feedback patterns
    const recentFeedback = await UserEvent.find({
      userId: user._id,
      rating: { $exists: true },
    })
      .sort({ ratedAt: -1 })
      .limit(50)
      .populate("eventId");

    // Calculate preferences from feedback
    const feedbackStats = this.analyzeFeedback(recentFeedback);

    return {
      _id: user._id,
      email: user.email,
      interests: user.interests,
      keywords: user.keywords,
      preferences: user.preferences,
      feedbackStats,
      contextType: "user",
    };
  }

  async buildEventContext(eventId) {
    const event = await Event.findById(eventId);

    if (!event) {
      throw new Error("Event not found");
    }

    return {
      _id: event._id,
      title: event.title,
      content: event.content,
      category: event.category,
      topics: event.topics,
      source: event.source,
      importanceScore: event.importanceScore,
      contextType: "event",
    };
  }

  async buildThreadContext(threadSlug) {
    const thread = await Thread.findOne({ slug: threadSlug }).populate(
      "events"
    );

    if (!thread) {
      return null;
    }

    return {
      _id: thread._id,
      slug: thread.slug,
      title: thread.title,
      events: thread.events,
      aiContext: thread.aiContext,
      contextType: "thread",
    };
  }

  async buildSessionContext(userId, eventId) {
    const userContext = await this.buildUserContext(userId);
    const eventContext = await this.buildEventContext(eventId);

    // Check if this event is part of an ongoing thread
    const thread = await Thread.findOne({
      events: eventId,
      isActive: true,
    });

    const threadContext = thread
      ? await this.buildThreadContext(thread.slug)
      : null;

    return {
      user: userContext,
      event: eventContext,
      thread: threadContext,
      timestamp: new Date(),
      contextType: "session",
    };
  }

  analyzeFeedback(feedbackArray) {
    if (feedbackArray.length === 0) {
      return {
        avgRating: 3,
        totalRatings: 0,
        preferredCategories: [],
        preferredTopics: [],
      };
    }

    const avgRating =
      feedbackArray.reduce((sum, fb) => sum + fb.rating, 0) /
      feedbackArray.length;

    // Find highly rated categories
    const categoryRatings = {};
    const topicRatings = {};

    feedbackArray.forEach((fb) => {
      if (fb.rating >= 4) {
        const cat = fb.eventId.category;
        categoryRatings[cat] = (categoryRatings[cat] || 0) + 1;

        fb.eventId.topics.forEach((topic) => {
          topicRatings[topic] = (topicRatings[topic] || 0) + 1;
        });
      }
    });

    const preferredCategories = Object.entries(categoryRatings)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat]) => cat);

    const preferredTopics = Object.entries(topicRatings)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic]) => topic);

    return {
      avgRating,
      totalRatings: feedbackArray.length,
      preferredCategories,
      preferredTopics,
    };
  }

  buildSystemContext() {
    return {
      systemName: "Contexta AI",
      version: "1.0.0",
      capabilities: [
        "multi-source-collection",
        "ai-agent-orchestration",
        "personalized-relevance",
        "human-in-the-loop",
        "feedback-learning",
      ],
      guardrails: {
        input: true,
        output: true,
        humanReview: true,
      },
      contextType: "system",
    };
  }

  async buildFullContext(userId, eventId = null) {
    const system = this.buildSystemContext();
    const user = await this.buildUserContext(userId);

    let event = null;
    let session = null;

    if (eventId) {
      event = await this.buildEventContext(eventId);
      session = await this.buildSessionContext(userId, eventId);
    }

    return {
      system,
      user,
      event,
      session,
      timestamp: new Date(),
      contextType: "full",
    };
  }
}

export default new ContextBuilder();
