const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
  // User who took the test
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Test taken
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  // Answers given by user
  answers: [{
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    },
    selectedOption: {
      type: Number,
      default: null
    },
    isCorrect: {
      type: Boolean,
      default: false
    },
    timeSpent: {
      type: Number, // in seconds
      default: 0
    }
  }],
  // Score details
  score: {
    correct: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0
    }
  },
  // Time tracking
  timeSpent: {
    type: Number, // in seconds
    default: 0
  },
  // Status
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned'],
    default: 'in-progress'
  },
  // Passed or failed
  passed: {
    type: Boolean,
    default: false
  },
  // Review notes
  reviewNotes: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Indexes
testResultSchema.index({ user: 1, createdAt: -1 });
testResultSchema.index({ test: 1 });
testResultSchema.index({ status: 1 });

// Calculate score before saving
testResultSchema.pre('save', function(next) {
  if (this.isModified('answers') || this.isNew) {
    this.score.correct = this.answers.filter(a => a.isCorrect).length;
    this.score.total = this.answers.length;
    this.score.percentage = this.score.total > 0 
      ? Math.round((this.score.correct / this.score.total) * 100) 
      : 0;
  }
  next();
});

// Static method to get user's test history
testResultSchema.statics.getUserHistory = async function(userId, limit = 10) {
  return this.find({ user: userId, status: 'completed' })
    .populate('test', 'title subject difficulty')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get user's performance stats
testResultSchema.statics.getUserStats = async function(userId) {
  const results = await this.find({ user: userId, status: 'completed' });
  
  if (results.length === 0) {
    return {
      testsTaken: 0,
      averageScore: 0,
      passRate: 0,
      totalTimeSpent: 0
    };
  }
  
  const totalScore = results.reduce((sum, r) => sum + r.score.percentage, 0);
  const passedCount = results.filter(r => r.passed).length;
  const totalTime = results.reduce((sum, r) => sum + r.timeSpent, 0);
  
  return {
    testsTaken: results.length,
    averageScore: Math.round(totalScore / results.length),
    passRate: Math.round((passedCount / results.length) * 100),
    totalTimeSpent: totalTime
  };
};

module.exports = mongoose.model('TestResult', testResultSchema);
