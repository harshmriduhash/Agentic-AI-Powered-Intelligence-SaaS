// import redditCollector from './redditCollector.js';
// import githubCollector from './githubCollector.js'; // DISABLED: Token invalid (401)
import rssCollector from './rssCollector.js';
import hackernewsCollector from './hackernewsCollector.js';
import Event from '../models/Events.js';

export async function collectAllSources(options = {}) {
  const { skipSaving = false } = options;
  
  console.log('\n=== Starting Data Collection ===\n');
  
  const allEvents = [];

  try {
    // Collect from all sources in parallel (GitHub disabled due to invalid token)
    const [rss, hn] = await Promise.allSettled([
      // redditCollector.collectAll(),
      // githubCollector.collectAll(), // DISABLED: GitHub token invalid (401)
      rssCollector.collectAll(),
      hackernewsCollector.collectAll()
    ]);

    // if (reddit.status === 'fulfilled') allEvents.push(...reddit.value);
    // if (github.status === 'fulfilled') allEvents.push(...github.value); // GitHub disabled
    if (rss.status === 'fulfilled' && Array.isArray(rss.value)) allEvents.push(...rss.value);
    if (hn.status === 'fulfilled' && Array.isArray(hn.value)) allEvents.push(...hn.value);

    console.log(`\n=== Total Events Collected: ${allEvents.length} ===\n`);

    // If skipSaving is true, return events array directly (for userPipeline to handle deduplication)
    if (skipSaving) {
      return allEvents;
    }

    // Save to database (deduplication handled by unique index)
    let saved = 0;
    let skipped = 0;

    for (const eventData of allEvents) {
      try {
        await Event.create(eventData);
        saved++;
      } catch (error) {
        if (error.code === 11000) {
          skipped++; // Duplicate
        } else {
          console.error('Error saving event:', error.message);
        }
      }
    }

    console.log(`✅ Saved: ${saved} | ⏭️  Skipped (duplicates): ${skipped}`);

    return { total: allEvents.length, saved, skipped };

  } catch (error) {
    console.error('Collection error:', error);
    throw error;
  }
}