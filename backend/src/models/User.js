const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/\S+@\S+\.\S+/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  avatar: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  // User progress tracking
  progress: {
    totalQuestionsAnswered: {
      type: Number,
      default: 0
    },
    correctAnswers: {
      type: Number,
      default: 0
    },
    testsCompleted: {
      type: Number,
      default: 0
    },
    interviewsCompleted: {
      type: Number,
      default: 0
    },
    streakDays: {
      type: Number,
      default: 0
    },
    lastActive: {
      type: Date,
      default: Date.now
    }
  },
  // Saved/favorite questions
  savedQuestions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  // User preferences
  preferences: {
    targetRole: {
      type: String,
      default: null
    },
    experienceLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    topicsOfInterest: [{
      type: String
    }]
  },
  // Subscription info
  subscription: {
    type: {
      type: String,
      enum: ['free', 'basic', 'pro', 'enterprise'],
      default: 'free'
    },
    expiresAt: {
      type: Date,
      default: null
    }
  }
}, {
  timestamps: true
});

// Index for faster queries

userSchema.index({ createdAt: -1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update last active
userSchema.methods.updateLastActive = function() {
  this.progress.lastActive = new Date();
  return this.save({ validateBeforeSave: false });
};

// Calculate accuracy
userSchema.methods.getAccuracy = function() {
  if (this.progress.totalQuestionsAnswered === 0) return 0;
  return Math.round((this.progress.correctAnswers / this.progress.totalQuestionsAnswered) * 100);
};

module.exports = mongoose.model('User', userSchema);
