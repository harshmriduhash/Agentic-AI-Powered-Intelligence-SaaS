import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  source: {
    type: String,
    enum: ['reddit',
      'github',
      'rss',
      'hackernews',
      'twitter',        // breaking news, incidents
      'blog',           // official product blogs
      'newsletter',     // curated sources
      'government'],
    required: true
  },
  sourceId: String, // Original ID from source
  title: {
    type: String,
    required: true
  },
  content: String,
  url: String,
  category: {
    type: String,
    enum: ['release',
      'incident',
      'security',
      'upgrade',
      'deprecation',
      'outage',
      'vulnerability',
      'trend',
      'policy',
      'regulation',
      'announcement',
      'research'
    ],
    required: true
  },
  topics: [{
    type: String,
    enum: [
      'technology', 'politics', 'finance', 'ai', 'cloud', 'sports', 'startups',
      'cybersecurity', 'web3', 'devops', 'science', 'business', 'geopolitics'
    ]
  }],
  rawData: mongoose.Schema.Types.Mixed,

  // AI Processing
  aiProcessed: {
    type: Boolean,
    default: false
  },
  noiseScore: Number,
  importanceScore: Number,
  summary: {
    tldr: String,
    bullets: [String],
    impact: String,
    actionRequired: String
  },

  // Review
  needsHumanReview: {
    type: Boolean,
    default: false
  },
  reviewedBy: String,
  reviewStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'edited'],
    default: 'pending'
  },

  // Metadata
  publishedAt: Date,
  processedAt: Date
}, {
  timestamps: true
});

// Indexes
eventSchema.index({ source: 1, sourceId: 1 }, { unique: true });
eventSchema.index({ topics: 1, importanceScore: -1 });
eventSchema.index({ createdAt: -1 });

export default mongoose.model('Event', eventSchema);