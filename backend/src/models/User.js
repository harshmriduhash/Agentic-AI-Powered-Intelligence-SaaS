import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function () {
      return !this.googleId; // Password required only if not Google auth
    },
    minlength: 6
  },

  // Google OAuth
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  googleProfile: {
    name: String,
    picture: String
  },

  // User preferences (filled in onboarding)
  interests: {
    type: [String],
    default: []
  },

  keywords: [String],

  delivery: {
    type: {
      type: String,
      enum: ['email'],
      default: 'email'
    },
    times: {
      type: [String],
      default: []
    }
  },

  preferences: {
    tone: {
      type: String,
      enum: ['concise', 'detailed', 'technical'],
      default: 'concise'
    },
    minImportanceScore: {
      type: Number,
      default: 5
    }
  },

  // Profile completion
  isOnboarded: {
    type: Boolean,
    default: false
  },

  isActive: {
    type: Boolean,
    default: true
  },

  isVerified: {
    type: Boolean,
    default: false
  },

  verificationToken: String,

  // Password reset
  resetPasswordToken: String,
  resetPasswordExpires: Date,

  // Usage Limits
  emailsSent: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!candidatePassword || !this.password) {
    return false;
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get safe user object (no password)
userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    email: this.email,
    interests: this.interests,
    keywords: this.keywords,
    delivery: this.delivery,
    preferences: this.preferences,
    isOnboarded: this.isOnboarded,
    googleProfile: this.googleProfile,
    createdAt: this.createdAt
  };
};

// Array length validators
userSchema.path('interests').validate(function (arr) {
  return arr.length <= 4;
}, 'Maximum 4 topics allowed');

userSchema.path('delivery.times').validate(function (arr) {
  return arr.length <= 2;
}, 'Maximum 2 delivery times allowed');

export default mongoose.model('User', userSchema);