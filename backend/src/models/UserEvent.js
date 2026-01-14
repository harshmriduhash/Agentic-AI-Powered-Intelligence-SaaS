import mongoose from 'mongoose';

const userEventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  relevanceScore: {
    type: Number,
    required: true
  },
  sent: {
    type: Boolean,
    default: false
  },
  sentAt: Date,
  
  // User feedback
  rating: {
    type: Number,
    enum: [1, 3, 5], // 1=not useful, 3=okay, 5=very useful
    default: null
  },
  ratedAt: Date,
  
  // Engagement
  opened: {
    type: Boolean,
    default: false
  },
  clicked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

userEventSchema.index({ userId: 1, eventId: 1 }, { unique: true });
userEventSchema.index({ userId: 1, relevanceScore: -1 });

export default mongoose.model('UserEvent', userEventSchema);