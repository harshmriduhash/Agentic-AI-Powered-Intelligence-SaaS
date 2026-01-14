import './src/config/env.js';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import session from 'express-session';
import { connectDatabase } from './src/config/database.js';
import { startSchedulers } from './src/scheduler/mainScheduler.js';
import passport from './src/config/passport.js';

console.log('\n--- Environment Loading Check ---');
console.log('  CWD:', process.cwd());
console.log('  MONGODB_URI:', process.env.MONGODB_URI ? '✅ DEFINED (Starts with: ' + process.env.MONGODB_URI.substring(0, 15) + '...)' : '❌ UNDEFINED');
console.log('  GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ DEFINED (' + process.env.GOOGLE_CLIENT_ID.substring(0, 10) + '...)' : '❌ UNDEFINED');
console.log('  GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ DEFINED' : '❌ UNDEFINED');
console.log('  SESSION_SECRET:', process.env.SESSION_SECRET ? '✅ DEFINED' : '⚠️  UNDEFINED (Using default)');
console.log('--------------------------------\n');

// Routes
import authRoutes from './src/routes/authRoutes.js';
import onboardingRoutes from './src/routes/onboardingRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import eventRoutes from './src/routes/eventRoutes.js';
import feedbackRoutes from './src/routes/feedbackRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import triggerRoutes from './src/routes/triggerRoutes.js';
import debugRoutes from './src/routes/debugRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      frontendUrl,
      'http://localhost:5173',
      'http://localhost:5174'
    ];

    // Case-insensitive check for development and vercel
    const lowerOrigin = origin.toLowerCase();
    const isVercel = lowerOrigin.includes('vercel.app') &&
      (lowerOrigin.includes('contexta') || lowerOrigin.includes('rajatdevai'));

    const isAllowed = allowedOrigins.includes(origin) || isVercel;

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('--- CORS BLOCKED ---');
      console.log('  Origin:', origin);
      console.log('  Allowed List:', allowedOrigins);
      console.log('  Is Vercel Check:', isVercel);
      console.log('--------------------');
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session for Google OAuth
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
console.log('📍 Registering API routes...');
app.use('/api/auth', authRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/trigger', triggerRoutes);
app.use('/api/debug', debugRoutes);
console.log('✅ All routes registered');

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'Contexta AI API',
    version: '1.0.0',
    status: 'running'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
async function startServer() {
  try {
    await connectDatabase();

    if (process.env.ENABLE_SCHEDULERS === 'true') {
      startSchedulers();
    } else {
      console.log('⏸️  Schedulers disabled');
    }

    app.listen(PORT, () => {
      console.log(`\n🚀 Contexta AI Backend running on port ${PORT}`);
      console.log(`📍 API URL: http://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health\n`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', async () => {
  console.log('\nSIGTERM received. Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT received. Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

startServer();