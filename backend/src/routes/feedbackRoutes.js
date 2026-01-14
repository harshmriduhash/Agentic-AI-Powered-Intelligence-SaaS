import express from 'express';
import UserEvent from '../models/UserEvent.js';

const router = express.Router();

// Submit rating
router.post('/', async (req, res) => {
  try {
    const { userId, eventId, rating } = req.body;

    // Validation
    if (!userId || !eventId || ![1, 3, 5].includes(rating)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid parameters. Rating must be 1, 3, or 5'
      });
    }

    const userEvent = await UserEvent.findOneAndUpdate(
      { userId, eventId },
      {
        rating,
        ratedAt: new Date()
      },
      { new: true }
    );

    if (!userEvent) {
      return res.status(404).json({
        success: false,
        message: 'Event not found for this user'
      });
    }

    res.json({
      success: true,
      message: 'Thank you for your feedback!',
      rating
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback',
      error: error.message
    });
  }
});

// Get feedback page (for email links)
router.get('/', async (req, res) => {
  try {
    const { event: eventId, user: userId, rating } = req.query;

    if (!userId || !eventId || ![1, 3, 5].includes(parseInt(rating))) {
      return res.status(400).send(`
        <html>
          <body style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h2>Invalid feedback link</h2>
          </body>
        </html>
      `);
    }

    // Submit rating
    await UserEvent.findOneAndUpdate(
      { userId, eventId },
      {
        rating: parseInt(rating),
        ratedAt: new Date()
      }
    );

    const ratingText = {
      1: 'Not Useful',
      3: 'Okay',
      5: 'Very Useful'
    }[rating];

    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Feedback Received - Contexta AI</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              margin: 0; 
              padding: 0; 
              background: #020617; 
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              overflow: hidden;
            }
            .background {
              position: fixed;
              top: 0; left: 0; width: 100%; height: 100%;
              background: radial-gradient(circle at 50% 50%, #1e1b4b 0%, #020617 100%);
              z-index: -1;
            }
            .stars {
              position: fixed;
              width: 1px; height: 1px;
              background: white;
              box-shadow: ${Array(50).fill(0).map(() => `${Math.random() * 100}vw ${Math.random() * 100}vh white`).join(', ')};
              z-index: -1;
            }
            .container { 
              background: rgba(255, 255, 255, 0.03);
              backdrop-filter: blur(20px);
              -webkit-backdrop-filter: blur(20px);
              border: 1px solid rgba(255, 255, 255, 0.1);
              padding: 60px 40px; 
              border-radius: 32px; 
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
              text-align: center;
              max-width: 450px;
              width: 90%;
              animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
            }
            @keyframes slideUp {
              from { opacity: 0; transform: translateY(40px) scale(0.95); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
            .emoji-orb {
              width: 120px;
              height: 120px;
              background: rgba(255, 255, 255, 0.05);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 64px;
              margin: 0 auto 30px;
              border: 1px solid rgba(255, 255, 255, 0.1);
              box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.05);
            }
            h1 { 
              font-size: 32px;
              font-weight: 800;
              margin: 0 0 16px; 
              background: linear-gradient(to right, #60a5fa, #a855f7);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }
            p { 
              color: #94a3b8; 
              line-height: 1.6; 
              font-size: 18px;
              margin-bottom: 32px;
            }
            .rating-tag {
              display: inline-block;
              padding: 6px 16px;
              background: rgba(96, 165, 250, 0.1);
              color: #60a5fa;
              border-radius: 100px;
              font-weight: 700;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 40px;
            }
            .btn { 
              display: block;
              padding: 16px 32px; 
              background: #3b82f6; 
              color: white; 
              text-decoration: none; 
              border-radius: 16px; 
              font-weight: 700;
              transition: all 0.3s ease;
              box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);
            }
            .btn:hover {
              transform: translateY(-2px);
              background: #2563eb;
              box-shadow: 0 20px 25px -5px rgba(59, 130, 246, 0.4);
            }
          </style>
        </head>
        <body>
          <div class="background"></div>
          <div class="stars"></div>
          <div class="container">
            <div class="emoji-orb">${rating === '5' ? '🚀' : rating === '3' ? '⭐' : '📝'}</div>
            <h1>Feedback Received</h1>
            <p>Your response helps us fine-tune your personal intelligence agent.</p>
            <div class="rating-tag">Recorded: ${ratingText}</div>
            <a href="${process.env.FRONTEND_URL}/dashboard?user=${userId}" class="btn">Return to Dashboard</a>
          </div>
        </body>
      </html>
    `);

  } catch (error) {
    res.status(500).send(`
      <html>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h2>Something went wrong</h2>
          <p>${error.message}</p>
        </body>
      </html>
    `);
  }
});

export default router;