const mongoose = require('mongoose');

const interviewSessionSchema = new mongoose.Schema({
  // User
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Interview type
  type: {
    type: String,
    enum: ['technical', 'behavioral', 'system-design', 'mixed'],
    default: 'technical'
  },
  // Target role
  role: {
    type: String,
    required: [true, 'Please specify the target role'],
    trim: true
  },
  // Experience level
  experienceLevel: {
    type: String,
    enum: ['entry', 'mid', 'senior'],
    default: 'mid'
  },
  // Topics to focus on
  topics: [{
    type: String,
    trim: true
  }],
  // Conversation history
  messages: [{
    role: {
      type: String,
      enum: ['user', 'ai', 'system'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    // For AI responses: model used
    model: {
      type: String,
      default: null
    },
    // For AI responses: tokens used
    tokens: {
      type: Number,
      default: null
    }
  }],
  // Generated questions
  generatedQuestions: [{
    question: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['technical', 'behavioral', 'system-design'],
      default: 'technical'
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    answer: {
      type: String,
      default: null
    },
    isAnswered: {
      type: Boolean,
      default: false
    }
  }],
  // Session status
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active'
  },
  // Session metrics
  metrics: {
    messageCount: {
      type: Number,
      default: 0
    },
    questionsGenerated: {
      type: Number,
      default: 0
    },
    duration: {
      type: Number, // in minutes
      default: 0
    }
  },
  // User feedback
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    comment: {
      type: String,
      default: null
    }
  }
}, {
  timestamps: true
});

// Indexes
interviewSessionSchema.index({ user: 1, createdAt: -1 });
interviewSessionSchema.index({ status: 1 });
interviewSessionSchema.index({ role: 1 });

// Add message method
interviewSessionSchema.methods.addMessage = async function(role, content, model = null, tokens = null) {
  this.messages.push({
    role,
    content,
    model,
    tokens
  });
  
  if (role === 'user' || role === 'ai') {
    this.metrics.messageCount += 1;
  }
  
  await this.save();
  return this;
};

// Add generated question method
interviewSessionSchema.methods.addQuestion = async function(question, category, difficulty) {
  this.generatedQuestions.push({
    question,
    category,
    difficulty
  });
  this.metrics.questionsGenerated += 1;
  await this.save();
  return this;
};

// Complete session
interviewSessionSchema.methods.complete = async function() {
  this.status = 'completed';
  const startTime = this.createdAt;
  const endTime = new Date();
  this.metrics.duration = Math.round((endTime - startTime) / (1000 * 60)); // in minutes
  await this.save();
  return this;
};

// Static method to get user's active session
interviewSessionSchema.statics.getActiveSession = async function(userId) {
  return this.findOne({ user: userId, status: 'active' })
    .sort({ createdAt: -1 });
};

// Static method to get user's session history
interviewSessionSchema.statics.getUserHistory = async function(userId, limit = 10) {
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('-messages'); // Exclude messages for list view
};

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
