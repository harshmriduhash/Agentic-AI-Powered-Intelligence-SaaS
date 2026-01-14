import Event from '../models/Events.js';
import UserProcessingState from '../models/UserProcessingState.js';

// Global deduplication - check if event was ever collected
export async function isDuplicate(event) {
  // Check by source and sourceId
  if (event.sourceId) {
    const existing = await Event.findOne({
      source: event.source,
      sourceId: event.sourceId
    });
    if (existing) {
      return { isDuplicate: true, reason: 'source_id_match', existingId: existing._id };
    }
  }

  // Check by URL
  if (event.url) {
    const existing = await Event.findOne({ url: event.url });
    if (existing) {
      return { isDuplicate: true, reason: 'url_match', existingId: existing._id };
    }
  }

  // Check by title similarity (fuzzy match)
  const similarTitle = await Event.findOne({
    title: { $regex: event.title, $options: 'i' }
  });

  if (similarTitle) {
    const similarity = calculateSimilarity(event.title, similarTitle.title);
    if (similarity > 0.85) {
      return { isDuplicate: true, reason: 'title_similarity', existingId: similarTitle._id, similarity };
    }
  }

  return { isDuplicate: false };
}

// User-specific deduplication - check if this user already processed this event
export async function isUserDuplicate(userId, eventId) {
  try {
    const userState = await UserProcessingState.findOne({ userId });
    if (!userState) {
      return false; // User never processed events, so not a duplicate
    }
    
    const isDup = userState.isEventProcessed(eventId);
    return isDup;
  } catch (error) {
    console.error('Error checking user duplicate:', error.message);
    return false;
  }
}

// Mark event as processed for a specific user
export async function markUserEventProcessed(userId, eventId) {
  try {
    let userState = await UserProcessingState.findOne({ userId });
    
    if (!userState) {
      // Create new state if doesn't exist
      const user = await (await import('../models/User.js')).default.findById(userId);
      if (!user) return null;
      
      userState = new (await import('../models/UserProcessingState.js')).default({
        userId,
        email: user.email
      });
    }
    
    userState.markEventAsProcessed(eventId);
    await userState.save();
    return userState;
  } catch (error) {
    console.error('Error marking user event as processed:', error.message);
    return null;
  }
}

function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer.toLowerCase(), shorter.toLowerCase());
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1, str2) {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}