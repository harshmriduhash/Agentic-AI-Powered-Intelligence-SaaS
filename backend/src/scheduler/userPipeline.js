import Event from '../models/Events.js';
import UserProcessingState from '../models/UserProcessingState.js';
import User from '../models/User.js';
import UserEvent from '../models/UserEvent.js';
import { isDuplicate, isUserDuplicate, markUserEventProcessed } from '../utils/deduplicator.js';
import { collectAllSources } from '../collectors/index.js';
import { managerAgent } from '../orchestrator/managerAgent.js';
import emailService from '../services/emailService.js';
import logger from '../utils/logger.js';

/**
 * Process pipeline for a SPECIFIC USER ONLY
 * 1. Collect events (new ones not in global database)
 * 2. Deduplicate per user
 * 3. Process through AI agents
 * 4. Send emails
 */
export async function processUserPipeline(userId, options = {}) {
  const {
    skipCollection = false,
    skipProcessing = false,
    skipEmailSending = false
  } = options;

  try {
    // Get user and initialize their state
    const user = await User.findById(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    let userState = await UserProcessingState.findOne({ userId });
    if (!userState) {
      userState = new UserProcessingState({
        userId,
        email: user.email
      });
      await userState.save();
    }

    console.log(`\n📍 USER-BASED PIPELINE: Starting for ${user.email} (${userId})`);
    console.log(`🔄 Processing State: ${userState.getStatsSummary().currentState.currentPhase}\n`);

    // ==================== PHASE 1: COLLECT ====================
    let collectedEvents = [];
    
    if (!skipCollection) {
      console.log(`\n[PHASE 1] Collecting events for ${user.email}...`);
      userState.currentState.currentPhase = 'collecting';
      userState.currentState.lastStateUpdate = new Date();
      await userState.save();

      collectedEvents = await collectAllSources({ skipSaving: true });
      console.log(`✅ Collected ${collectedEvents.length} total events from sources`);

      userState.stats.totalEventsCollected = collectedEvents.length;
      userState.addAction('collect', `Collected ${collectedEvents.length} events from sources`, null, null, true);
      // Reload to avoid version conflicts
      userState = await UserProcessingState.findById(userState._id);
      userState.stats.totalEventsCollected = collectedEvents.length;
      await userState.save();
    }

    // ==================== PHASE 2: GLOBAL DEDUPLICATION ====================
    console.log(`\n[PHASE 2] Global deduplication...`);
    userState.currentState.currentPhase = 'deduplicating';
    userState.currentState.lastStateUpdate = new Date();

    let newEvents = [];
    let globalDuplicateCount = 0;

    for (const event of collectedEvents) {
      const dupResult = await isDuplicate(event);
      
      if (dupResult.isDuplicate) {
        globalDuplicateCount++;
        userState.addAction('skip_duplicate', `Event already in global database`, dupResult.existingId, event.title, true);
      } else {
        // Save event to global database
        const newEvent = new Event(event);
        await newEvent.save();
        newEvents.push(newEvent);
        userState.addAction('collect', `New event saved globally`, newEvent._id, event.title, true);
      }
    }

    console.log(`✅ ${newEvents.length} new events | ⏭️  ${globalDuplicateCount} already in database`);
    userState.stats.totalDuplicatesSkipped = globalDuplicateCount;
    // Reload to avoid version conflicts
    userState = await UserProcessingState.findById(userState._id);
    userState.stats.totalDuplicatesSkipped = globalDuplicateCount;
    await userState.save();

    // ==================== PHASE 3: USER-SPECIFIC DEDUPLICATION & PROCESSING ====================
    console.log(`\n[PHASE 3] User-specific processing and AI analysis...`);
    userState.currentState.currentPhase = 'processing';
    userState.currentState.lastStateUpdate = new Date();

    // Get all events from the global Event collection (recent ones, last 1000)
    const allEvents = await Event.find().sort({ createdAt: -1 }).limit(1000);
    console.log(`📦 Found ${allEvents.length} total events in database`);

    // Get all eventIds that this user has already processed
    // Check both UserEvent collection (source of truth) and UserProcessingState (backup)
    const processedUserEvents = await UserEvent.find({ userId }).select('eventId');
    const processedEventIds = new Set(processedUserEvents.map(ue => ue.eventId.toString()));
    console.log(`📊 Found ${processedUserEvents.length} UserEvents for this user`);
    
    // Also check UserProcessingState.processedEventIds as backup
    if (userState.processedEventIds && userState.processedEventIds.length > 0) {
      console.log(`📊 UserProcessingState has ${userState.processedEventIds.length} processed event IDs`);
      userState.processedEventIds.forEach(id => processedEventIds.add(id));
    }
    
    console.log(`✅ User has already processed ${processedEventIds.size} total events`);

    // Filter to get only unprocessed events for this user
    const eventsToProcess = allEvents.filter(event => {
      const eventIdStr = event._id.toString();
      return !processedEventIds.has(eventIdStr);
    });

    console.log(`📋 Found ${eventsToProcess.length} unprocessed events for this user`);
    
    if (eventsToProcess.length === 0) {
      console.log(`⚠️  No events to process. This could mean:`);
      console.log(`   - All events have already been processed for this user`);
      console.log(`   - Or there are no events in the database`);
    }

    let processedCount = 0;
    let errorCount = 0;

    for (const event of eventsToProcess) {
      try {
        console.log(`\n--- Processing: ${event.title.substring(0, 70)}... ---`);
        
        const result = await managerAgent(event, user);
        
        // Check if result is null (filtered out) or has success flag
        if (result && result.success) {
          // Create UserEvent for this specific user
          const userEvent = new UserEvent({
            userId,
            eventId: event._id,
            title: event.title,
            summary: event.summary || result.event.summary,
            relevanceScore: result.event.relevanceScore,
            category: result.event.category,
            topics: result.event.topics,
            sent: false
          });
          await userEvent.save();

          // Mark as processed for this user
          await markUserEventProcessed(userId, event._id.toString());

          userState.addAction('process', `Event processed and queued for email`, event._id, event.title, true, {
            relevanceScore: result.event.relevanceScore,
            category: result.event.category
          });

          processedCount++;
          console.log(`✅ Processed (relevance: ${result.event.relevanceScore?.toFixed(2)})`);
        } else {
          // Event was filtered out (noise, guardrails, etc.) - not an error, just skipped
          console.log(`⏭️  Skipped (filtered by agents)`);
          // Still mark as processed so we don't try again
          await markUserEventProcessed(userId, event._id.toString());
        }
      } catch (error) {
        errorCount++;
        userState.addError('processing', event._id.toString(), event.title, error.message, error.constructor.name);
        userState.addAction('error', `Processing error: ${error.message}`, event._id, event.title, false);
        console.log(`❌ Error processing event: ${error.message}`);
      }
    }

    // Reload userState to avoid version conflicts
    userState = await UserProcessingState.findById(userState._id);
    userState.stats.totalEventsProcessed = processedCount;
    userState.stats.lastProcessingTime = new Date();
    await userState.save();

    console.log(`\n✅ Processed ${processedCount} events | ❌ ${errorCount} errors`);

    // ==================== PHASE 4: SEND EMAILS ====================
    let emailsSent = 0;

    if (!skipEmailSending) {
      console.log(`\n[PHASE 4] Sending digest email to ${user.email}...`);
      userState.currentState.currentPhase = 'sending';
      userState.currentState.lastStateUpdate = new Date();

      try {
        // Get unsent UserEvents for this user (emailService will query internally with relevance filter)
        const unsentUserEvents = await UserEvent.find({
          userId,
          sent: false
        }).populate('eventId');

        console.log(`📧 Found ${unsentUserEvents.length} unsent UserEvents for email`);

        if (unsentUserEvents.length > 0) {
          // emailService.sendDigest queries internally with relevance score filter
          const result = await emailService.sendDigest(user);
          
          if (result && result.sent) {
            emailsSent = result.count || unsentUserEvents.length;
            userState.stats.totalEmailsSent += emailsSent;
            userState.stats.lastEmailSentTime = new Date();
            userState.addAction('send_email', `Email sent with ${emailsSent} events`, null, null, true);
            console.log(`✅ Email sent successfully (${emailsSent} events)`);
          } else {
            const reason = result?.reason || 'unknown';
            userState.addAction('send_email', `Email sending failed: ${reason}`, null, null, false);
            console.log(`❌ Failed to send email: ${reason}`);
            if (result?.error) {
              console.log(`   Error: ${result.error}`);
            }
          }
        } else {
          console.log(`⚠️  No unsent events for this user`);
          userState.addAction('send_email', `No events to send`, null, null, true);
        }
      } catch (error) {
        userState.addError('sending', null, null, error.message, error.constructor.name);
        userState.addAction('error', `Email sending error: ${error.message}`, null, null, false);
        console.log(`❌ Error sending email: ${error.message}`);
      }
    }

    // Finalize state - reload to avoid version conflicts
    userState = await UserProcessingState.findById(userState._id);
    userState.currentState.currentPhase = 'idle';
    userState.currentState.isProcessing = false;
    userState.currentState.lastStateUpdate = new Date();
    await userState.save();

    // Summary
    const summary = {
      success: true,
      user: {
        userId,
        email: user.email
      },
      collection: {
        total: collectedEvents.length,
        newSaved: newEvents.length,
        globalDuplicates: globalDuplicateCount
      },
      processing: {
        processed: processedCount,
        errors: errorCount,
        eventsQueuedForEmail: processedCount
      },
      email: {
        sent: emailsSent
      },
      stats: userState.getStatsSummary()
    };

    console.log(`\n✅ USER PIPELINE COMPLETE for ${user.email}`);
    console.log(`📊 Summary:`, summary);

    return summary;
  } catch (error) {
    logger.error('User pipeline error:', error);
    throw error;
  }
}

/**
 * Clear processing data for a SPECIFIC USER ONLY
 */
export async function clearUserData(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    // Check how many UserEvents exist before deletion
    const userEventsBefore = await UserEvent.find({ userId }).countDocuments();
    console.log(`\n🧹 Clearing data for ${user.email} (${userId})...`);
    console.log(`  📊 Found ${userEventsBefore} UserEvents before deletion`);

    // Delete user's events (Mongoose will auto-convert string userId to ObjectId)
    const deletedUserEvents = await UserEvent.deleteMany({ userId });
    console.log(`  ✅ Deleted ${deletedUserEvents.deletedCount} UserEvents`);

    // Also try with explicit ObjectId conversion if needed
    if (deletedUserEvents.deletedCount === 0 && userEventsBefore > 0) {
      const mongoose = (await import('mongoose')).default;
      const userIdObj = new mongoose.Types.ObjectId(userId);
      const deletedWithObjId = await UserEvent.deleteMany({ userId: userIdObj });
      console.log(`  🔄 Retry with ObjectId: Deleted ${deletedWithObjId.deletedCount} UserEvents`);
    }

    // Reset their processing state
    const userState = await UserProcessingState.findOne({ userId });
    if (userState) {
      const processedCountBefore = userState.processedEventIds?.length || 0;
      userState.processedEventIds = [];
      userState.stats = {
        totalEventsCollected: 0,
        totalEventsProcessed: 0,
        totalEmailsSent: 0,
        totalDuplicatesSkipped: 0,
        totalErrorsEncountered: 0
      };
      userState.actionHistory = [];
      userState.recentErrors = [];
      userState.addAction('clear', 'User data cleared', null, null, true);
      await userState.save();
      console.log(`  ✅ Reset processing state (cleared ${processedCountBefore} processed event IDs)`);
    } else {
      console.log(`  ⚠️  No UserProcessingState found for this user`);
    }

    console.log(`\n✅ Cleared data for ${user.email}\n`);

    return {
      success: true,
      email: user.email,
      userId,
      deletedUserEvents: deletedUserEvents.deletedCount,
      userEventsBefore
    };
  } catch (error) {
    logger.error('Error clearing user data:', error);
    throw error;
  }
}
