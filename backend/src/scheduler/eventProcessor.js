import Event from '../models/Events.js';
import User from '../models/User.js';
import UserEvent from '../models/UserEvent.js';
import { managerAgent } from '../orchestrator/managerAgent.js';

export async function processUnprocessedEvents() {
  console.log('\n=== Processing Unprocessed Events ===\n');

  // Get all unprocessed events
  const events = await Event.find({ aiProcessed: false }).limit(100);
  
  if (events.length === 0) {
    console.log('No unprocessed events found');
    return;
  }

  console.log(`Found ${events.length} unprocessed events`);

  // Get all active users
  const users = await User.find({ isActive: true, isVerified: true });
  
  if (users.length === 0) {
    console.log('No active users found');
    return;
  }

  console.log(`Processing for ${users.length} active users`);

  let processed = 0;

  for (const event of events) {
    console.log(`\n--- Processing: ${event.title.substring(0, 60)}... ---`);

    for (const user of users) {
      try {
        // Run through manager agent
        const result = await managerAgent(event.toObject(), user);

        if (result && result.success) {
          // Update event with AI data
          if (!event.aiProcessed) {
            event.category = result.event.category;
            event.topics = result.event.topics;
            event.summary = result.event.summary;
            event.importanceScore = result.event.importanceScore;
            event.noiseScore = result.event.noiseScore;
            event.needsHumanReview = result.event.needsHumanReview;
            event.aiProcessed = true;
            event.processedAt = new Date();
            await event.save();
          }

          // Create UserEvent for personalization
          await UserEvent.findOneAndUpdate(
            { userId: user._id, eventId: event._id },
            {
              userId: user._id,
              eventId: event._id,
              relevanceScore: result.event.relevanceScore,
              sent: false
            },
            { upsert: true }
          );

          console.log(`  ✅ Processed for ${user.email} (relevance: ${result.event.relevanceScore.toFixed(2)})`);
        } else {
          console.log(`  ⏭️  Skipped for ${user.email}`);
        }

      } catch (error) {
        console.error(`  ❌ Error processing for ${user.email}:`, error.message);
      }
    }

    processed++;
  }

  console.log(`\n=== Processed ${processed} events ===\n`);
}