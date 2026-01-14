import nodemailer from 'nodemailer';
import UserEvent from '../models/UserEvent.js';
import Event from '../models/Events.js';
import User from '../models/User.js';

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
  }

  initializeTransporter() {
    if (this.initialized) return;

    let host = process.env.EMAIL_HOST || 'smtp.gmail.com';
    let port = parseInt(process.env.EMAIL_PORT || '587');
    let user = process.env.EMAIL_USER || '';
    let pass = process.env.EMAIL_PASSWORD || '';

    // Strip quotes if they exist (from .env parsing)
    host = host.replace(/^["']|["']$/g, '').trim();
    user = user.replace(/^["']|["']$/g, '').trim();
    pass = pass.replace(/^["']|["']$/g, '').trim();

    console.log('\n📧 Email Service Configuration:');
    console.log(`  Host: ${host}`);
    console.log(`  Port: ${port}`);
    console.log(`  User: ${user}`);
    console.log(`  Password: ${pass ? '✓ SET (' + pass.length + ' chars)' : '❌ NOT SET'}`);

    if (!user || !pass) {
      console.error('❌ Email credentials are missing!');
      console.error('   Please set EMAIL_USER and EMAIL_PASSWORD in .env\n');
    } else {
      console.log('  ✓ All credentials present\n');
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: false, // Use TLS (STARTTLS) - not SSL
      auth: {
        user,
        pass
      },
      tls: {
        rejectUnauthorized: false // Allow self-signed certs
      }
    });

    this.initialized = true;
    // Verify connection after initialization
    this.verifyConnection();
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email service connected to SMTP successfully\n');
    } catch (error) {
      console.error('❌ Email service connection failed:', error.message);
      console.error('Please check your EMAIL_HOST, EMAIL_PORT, EMAIL_USER, and EMAIL_PASSWORD\n');
    }
  }

  async sendDigest(user) {
    // Initialize transporter if not already done
    this.initializeTransporter();

    console.log(`\n--- Preparing digest for ${user.email} ---`);

    // Check email limit
    if (user.emailsSent >= 20) {
      console.log(`  ❌ Email limit reached for ${user.email} (${user.emailsSent}/20)`);
      return { sent: false, reason: 'limit_reached', count: user.emailsSent };
    }

    // Get unsent events for this user above their threshold
    const userEvents = await UserEvent.find({
      userId: user._id,
      sent: false,
      relevanceScore: { $gte: user.preferences.minImportanceScore }
    })
      .sort({ relevanceScore: -1 })
      .limit(20)
      .populate('eventId');

    if (userEvents.length === 0) {
      console.log('  No events to send');
      return { sent: false, reason: 'no_events' };
    }

    console.log(`  Found ${userEvents.length} events to send`);

    // Group by category
    const grouped = this.groupByCategory(userEvents);

    // Generate HTML email
    const html = this.generateEmailHTML(user, grouped);

    try {
      await this.transporter.sendMail({
        from: `Contexta AI <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: this.generateSubject(grouped),
        html
      });

      // Mark as sent in UserEvent and increment User counter
      await Promise.all([
        UserEvent.updateMany(
          { _id: { $in: userEvents.map(ue => ue._id) } },
          { sent: true, sentAt: new Date() }
        ),
        User.findByIdAndUpdate(user._id, { $inc: { emailsSent: 1 } })
      ]);

      console.log(`  ✅ Email sent successfully (${(user.emailsSent || 0) + 1}/20)`);
      return { sent: true, count: userEvents.length };

    } catch (error) {
      console.error(`  ❌ Email send failed:`, error.message);
      return { sent: false, reason: 'send_error', error: error.message };
    }
  }

  async sendEmail({ to, subject, html }) {
    this.initializeTransporter();
    try {
      await this.transporter.sendMail({
        from: `Contexta AI <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
      });
      console.log(`  ✅ Email sent to ${to}`);
      return true;
    } catch (error) {
      console.error(`  ❌ Email send failed:`, error.message);
      throw error;
    }
  }

  async sendPasswordReset(email, resetUrl) {
    const html = `
      <h1>You have requested a password reset</h1>
      <p>Please go to this link to reset your password:</p>
      <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
      <p>This link expires in 10 minutes.</p>
    `;
    return this.sendEmail({ to: email, subject: 'Password Reset Request', html });
  }

  groupByCategory(userEvents) {
    const groups = {};

    for (const ue of userEvents) {
      const category = ue.eventId.category;
      if (!groups[category]) groups[category] = [];
      groups[category].push(ue);
    }

    return groups;
  }

  generateSubject(grouped) {
    const categories = Object.keys(grouped);
    const count = Object.values(grouped).reduce((sum, arr) => sum + arr.length, 0);

    const date = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });

    return `Contexta Digest – ${count} Updates (${date})`;
  }

  generateEmailHTML(user, grouped) {
    const categoryEmojis = {
      release: '',
      incident: '',
      outage: '',
      security: '',
      vulnerability: '',
      upgrade: '',
      deprecation: '',
      trend: '',
      policy: '',
      regulation: '',
      announcement: '',
      research: ''
    };

    let html = `
      <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              h1 { color: #1a1a1a; border-bottom: 3px solid #0066cc; padding-bottom: 10px; }
              h2 { color: #0066cc; margin-top: 30px; }
              .event { background: #f9f9f9; border-left: 4px solid #0066cc; padding: 15px; margin: 15px 0; border-radius: 4px; }
              .event-title { font-weight: 600; font-size: 16px; margin-bottom: 8px; }
              .tldr { color: #666; font-style: italic; margin: 8px 0; }
              .bullets { margin: 10px 0; padding-left: 20px; }
              .bullets li { margin: 5px 0; }
              .relevance { display: inline-block; background: #0066cc; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; }
              .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
              .rating { margin: 20px 0; text-align: center; }
              .rating a { display: inline-block; margin: 0 10px; padding: 10px 20px; text-decoration: none; background: #f0f0f0; border-radius: 6px; color: #333; }
              .cta { text-align: center; margin: 30px 0; }
              .cta a { display: inline-block; padding: 12px 30px; background: #0066cc; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; }
            </style>
          </head>
          <body>
            <h1>Your Contexta Intelligence Digest</h1>
            <p>Hi! Here are the most relevant updates based on your interests: <strong>${user.interests.join(', ')}</strong></p>
            `;

    // Add events grouped by category
    for (const [category, events] of Object.entries(grouped)) {
      html += `<h2>${category.charAt(0).toUpperCase() + category.slice(1)}</h2>`;

      for (const ue of events) {
        const event = ue.eventId;
        html += `
            <div class="event">
              <div class="event-title">${event.title}</div>
              <span class="relevance">Relevance: ${ue.relevanceScore.toFixed(1)}/10</span>
              <div class="tldr">${event.summary.tldr}</div>
              <ul class="bullets">
                ${event.summary.bullets.map(b => `<li>${b}</li>`).join('')}
              </ul>
              <p><strong>Impact:</strong> ${event.summary.impact}</p>
              ${event.summary.actionRequired !== 'None' ? `<p><strong>Action:</strong> ${event.summary.actionRequired}</p>` : ''}
              <p><a href="${event.url}" style="color: #0066cc;">Read more →</a></p>

              <div class="rating">
                <p style="font-size: 14px; color: #666;">Was this useful?</p>
                <a href="${process.env.FRONTEND_URL}/feedback?event=${event._id}&user=${user._id}&rating=5">Useful</a>
                <a href="${process.env.FRONTEND_URL}/feedback?event=${event._id}&user=${user._id}&rating=3">Neutral</a>
                <a href="${process.env.FRONTEND_URL}/feedback?event=${event._id}&user=${user._id}&rating=1">Not Useful</a>
              </div>
            </div>
            `;
      }
    }
    html += `
            <div class="cta">
              <a href="${process.env.FRONTEND_URL}/dashboard?user=${user._id}">View Full Dashboard</a>
            </div>
            <div class="footer">
              <p>You're receiving this because you subscribed to Contexta AI.</p>
              <p><a href="${process.env.FRONTEND_URL}/settings?user=${user._id}">Update preferences</a> | <a href="${process.env.FRONTEND_URL}/unsubscribe?user=${user._id}">Unsubscribe</a></p>
            </div>
          </body>
        </html>
    `;
    return html;
  }
}

// Lazy initialization - only create instance when first accessed
let emailServiceInstance = null;

function getEmailService() {
  if (!emailServiceInstance) {
    emailServiceInstance = new EmailService();
  }
  return emailServiceInstance;
}

export default {
  sendDigest: (user) => getEmailService().sendDigest(user),
  verifyConnection: () => getEmailService().verifyConnection(),
  groupByCategory: (events) => getEmailService().groupByCategory(events),
  generateSubject: (grouped) => getEmailService().generateSubject(grouped),
  generateEmailHTML: (user, grouped) => getEmailService().generateEmailHTML(user, grouped),
  sendEmail: (opts) => getEmailService().sendEmail(opts),
  sendPasswordReset: (email, url) => getEmailService().sendPasswordReset(email, url)
};