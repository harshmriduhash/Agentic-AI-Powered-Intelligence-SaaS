import Thread from "../models/Thread.js";
import Event from "../models/Events.js";
import logger from "../utils/logger.js";

class ThreadManager {
  async createThread(title, initialEventId) {
    const slug = this.generateSlug(title);

    const thread = await Thread.create({
      slug,
      title,
      events: [initialEventId],
      aiContext: {
        createdReason: "Initial event",
        summary: null,
      },
      isActive: true,
    });

    logger.info("Thread created", { threadId: thread._id, slug });
    return thread;
  }

  async addEventToThread(threadSlug, eventId) {
    const thread = await Thread.findOne({ slug: threadSlug });

    if (!thread) {
      throw new Error("Thread not found");
    }

    if (!thread.events.includes(eventId)) {
      thread.events.push(eventId);
      await thread.save();
      logger.info("Event added to thread", { threadSlug, eventId });
    }

    return thread;
  }

  async findRelatedThread(event) {
    // Check if this event belongs to an existing thread
    // Logic: similar title/topic/source within last 7 days

    const recentThreads = await Thread.find({
      isActive: true,
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    }).populate("events");

    for (const thread of recentThreads) {
      const threadEvents = thread.events;

      for (const threadEvent of threadEvents) {
        // Check for topic overlap
        const topicOverlap = event.topics.filter((t) =>
          threadEvent.topics.includes(t)
        );

        if (topicOverlap.length > 0) {
          // Check title similarity
          const titleSimilarity = this.calculateTitleSimilarity(
            event.title,
            threadEvent.title
          );

          if (titleSimilarity > 0.6) {
            logger.info("Found related thread", {
              eventTitle: event.title,
              threadSlug: thread.slug,
              similarity: titleSimilarity,
            });
            return thread;
          }
        }
      }
    }

    return null;
  }

  async updateThreadContext(threadSlug, aiContext) {
    const thread = await Thread.findOne({ slug: threadSlug });

    if (!thread) {
      throw new Error("Thread not found");
    }

    thread.aiContext = {
      ...thread.aiContext,
      ...aiContext,
      lastUpdated: new Date(),
    };

    await thread.save();
    return thread;
  }

  async closeThread(threadSlug) {
    const thread = await Thread.findOneAndUpdate(
      { slug: threadSlug },
      { isActive: false },
      { new: true }
    );

    logger.info("Thread closed", { threadSlug });
    return thread;
  }

  generateSlug(title) {
    return (
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .substring(0, 50) +
      "-" +
      Date.now()
    );
  }

  calculateTitleSimilarity(title1, title2) {
    const words1 = new Set(title1.toLowerCase().split(/\s+/));
    const words2 = new Set(title2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter((w) => words2.has(w)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }
}

export default new ThreadManager();
