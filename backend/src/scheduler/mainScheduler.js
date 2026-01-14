import cron from 'node-cron';
import { collectAllSources } from '../collectors/index.js';
import { processUnprocessedEvents } from './eventProcessor.js';
import { startDigestScheduler } from './digestScheduler.js';

export function startSchedulers() {
  console.log('\n🚀 Starting all schedulers...\n');

  // Helper to run once immediately
  const runImmediate = async () => {
    console.log('⚡ Initializing system data...');
    try {
      await collectAllSources();
      await processUnprocessedEvents();
      console.log('✅ Initial data collection and processing complete');
    } catch (error) {
      console.error('❌ Initialization error:', error);
    }
  };

  runImmediate();

  // 1. Collect data every hour at 50 mins past (to be ready for top-of-hour delivery)
  cron.schedule('50 * * * *', async () => {
    console.log('\n📡 Scheduled data collection triggered');
    try {
      await collectAllSources();
    } catch (error) {
      console.error('Collection error:', error);
    }
  });

  // 2. Process events every hour at 55 mins past
  cron.schedule('55 * * * *', async () => {
    console.log('\n🤖 Scheduled event processing triggered');
    try {
      await processUnprocessedEvents();
    } catch (error) {
      console.error('Processing error:', error);
    }
  });

  // 3. Start digest scheduler
  startDigestScheduler();

  console.log('✅ All schedulers active\n');
}