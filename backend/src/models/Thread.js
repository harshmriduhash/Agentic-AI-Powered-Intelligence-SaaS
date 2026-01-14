import mongoose from 'mongoose';

const threadSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true
  },
  title: String,
  events: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],
  aiContext: mongoose.Schema.Types.Mixed,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Thread', threadSchema);