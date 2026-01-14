import mongoose from 'mongoose';

const userProcessingStateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    index: true
  },
  
  // Deduplication tracking
  processedEventIds: {
    type: [String], // Array of event IDs already processed for this user
    default: []
  },
  
  // Processing statistics
  stats: {
    totalEventsCollected: { type: Number, default: 0 },
    totalEventsProcessed: { type: Number, default: 0 },
    totalEmailsSent: { type: Number, default: 0 },
    totalDuplicatesSkipped: { type: Number, default: 0 },
    totalErrorsEncountered: { type: Number, default: 0 },
    lastCollectionTime: Date,
    lastProcessingTime: Date,
    lastEmailSentTime: Date
  },
  
  // Current state
  currentState: {
    isProcessing: { type: Boolean, default: false },
    lastStateUpdate: Date,
    currentPhase: {
      type: String,
      enum: ['idle', 'collecting', 'deduplicating', 'processing', 'sending', 'error'],
      default: 'idle'
    }
  },
  
  // Error history (last 10 errors)
  recentErrors: [{
    timestamp: Date,
    phase: String, // collecting, processing, sending
    eventId: String,
    eventTitle: String,
    errorMessage: String,
    errorType: String // 'ReferenceError', 'TypeError', etc.
  }],
  
  // Action history (last 20 actions)
  actionHistory: [{
    timestamp: Date,
    action: {
      type: String,
      enum: ['collect', 'deduplicate', 'process', 'send_email', 'skip_duplicate', 'error', 'clear']
    },
    details: String,
    eventId: String,
    eventTitle: String,
    success: Boolean,
    metadata: mongoose.Schema.Types.Mixed
  }],
  
  // Last seen duplicates (for quick lookup)
  recentDuplicateHashes: {
    type: [String],
    default: []
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Auto-update timestamp
userProcessingStateSchema.pre('save', async function() {
  this.updatedAt = new Date();
});

// Helper method to add action to history
userProcessingStateSchema.methods.addAction = function(action, details, eventId, eventTitle, success = true, metadata = {}) {
  this.actionHistory.push({
    timestamp: new Date(),
    action,
    details,
    eventId,
    eventTitle,
    success,
    metadata
  });
  
  // Keep only last 20 actions
  if (this.actionHistory.length > 20) {
    this.actionHistory.shift();
  }
};

// Helper method to add error
userProcessingStateSchema.methods.addError = function(phase, eventId, eventTitle, errorMessage, errorType) {
  this.recentErrors.push({
    timestamp: new Date(),
    phase,
    eventId,
    eventTitle,
    errorMessage,
    errorType
  });
  
  this.stats.totalErrorsEncountered += 1;
  
  // Keep only last 10 errors
  if (this.recentErrors.length > 10) {
    this.recentErrors.shift();
  }
};

// Helper method to check if event already processed
userProcessingStateSchema.methods.isEventProcessed = function(eventId) {
  return this.processedEventIds.includes(eventId);
};

// Helper method to mark event as processed
userProcessingStateSchema.methods.markEventAsProcessed = function(eventId) {
  if (!this.processedEventIds.includes(eventId)) {
    this.processedEventIds.push(eventId);
  }
};

// Helper method to get stats summary
userProcessingStateSchema.methods.getStatsSummary = function() {
  return {
    email: this.email,
    stats: this.stats,
    currentState: this.currentState,
    totalProcessedEvents: this.processedEventIds.length,
    recentErrorCount: this.recentErrors.length,
    recentActionsCount: this.actionHistory.length,
    lastUpdated: this.updatedAt
  };
};

export default mongoose.model('UserProcessingState', userProcessingStateSchema);
