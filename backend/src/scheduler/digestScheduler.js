import cron from 'node-cron';
import User from '../models/User.js';
import emailService from '../services/emailService.js';

export function startDigestScheduler() {
  console.log('📧 Email digest scheduler started');

  // Check every minute (for better real-time testing)
  cron.schedule('* * * * *', async () => {
    console.log('\n⏰ Checking for scheduled digests...');
    
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    // Find users whose delivery time matches current time (within 1 min window)
    const users = await User.find({
      isActive: true,
      isVerified: true,
      'delivery.times': {
        $elemMatch: {
          $gte: currentTime,
          $lte: addMinutes(currentTime, 1)
        }
      }
    });

    console.log(`Found ${users.length} users scheduled for delivery`);

    for (const user of users) {
      try {
        const result = await emailService.sendDigest(user);
        console.log(`${user.email}: ${result.sent ? '✅ Sent' : '⏭️ Skipped'}`);
      } catch (error) {
        console.error(`${user.email}: ❌ Error - ${error.message}`);
      }
    }
  });
}

// Export function to send digest immediately for testing/manual trigger
export async function sendDigestImmediately(userId) {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }

  return await emailService.sendDigest(user);
}

function addMinutes(time, minutes) {
  const [hours, mins] = time.split(':').map(Number);
  const totalMins = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMins / 60) % 24;
  const newMins = totalMins % 60;
  return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
}