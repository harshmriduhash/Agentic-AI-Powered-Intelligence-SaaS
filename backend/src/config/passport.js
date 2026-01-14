import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

// Only initialize Google OAuth if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        let user = await User.findOne({ googleId: profile.id });
        
        if (user) {
          return done(null, user);
        }
        
        // Check if email exists
        user = await User.findOne({ email: profile.emails[0].value });
        
        if (user) {
          // Link Google account to existing user
          user.googleId = profile.id;
          user.googleProfile = {
            name: profile.displayName,
            picture: profile.photos[0]?.value
          };
          user.isVerified = true;
          await user.save();
          return done(null, user);
        }
        
        // Create new user
        user = await User.create({
          email: profile.emails[0].value,
          googleId: profile.id,
          googleProfile: {
            name: profile.displayName,
            picture: profile.photos[0]?.value
          },
          isVerified: true,
          isOnboarded: false
        });
        
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  ));
  console.log('✓ Google OAuth strategy initialized');
} else {
  console.log('⚠ Google OAuth credentials not found - Google login will be disabled');
  console.log('   Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env to enable');
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;