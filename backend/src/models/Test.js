const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  // Test title
  title: {
    type: String,
    required: [true, 'Please provide a test title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  // Test category
  category: {
    type: String,
    enum: ['college', 'placement'],
    required: true
  },
  // Subject/topic
  subject: {
    type: String,
    required: [true, 'Please provide a subject'],
    trim: true
  },
  // For placement tests
  role: {
    type: String,
    default: null
  },
  // Difficulty level
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  // Questions in this test
  questions: [{
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    },
    order: {
      type: Number,
      default: 0
    }
  }],
  // Test settings
  settings: {
    duration: {
      type: Number, // in minutes
      default: 30
    },
    passingScore: {
      type: Number, // percentage
      default: 60
    },
    allowRetake: {
      type: Boolean,
      default: true
    },
    showAnswers: {
      type: Boolean,
      default: true
    },
    shuffleQuestions: {
      type: Boolean,
      default: true
    }
  },
  // Tags
  tags: [{
    type: String,
    trim: true
  }],
  // Statistics
  stats: {
    timesTaken: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    passRate: {
      type: Number,
      default: 0
    }
  },
  // Is active
  isActive: {
    type: Boolean,
    default: true
  },
  // Created by
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Indexes
testSchema.index({ category: 1, subject: 1 });
testSchema.index({ difficulty: 1 });
testSchema.index({ isActive: 1 });

// Virtual for question count
testSchema.virtual('questionCount').get(function() {
  return this.questions.length;
});

// Method to update statistics
testSchema.methods.updateStats = async function(newScore, passed) {
  const currentTotal = this.stats.timesTaken * this.stats.averageScore;
  this.stats.timesTaken += 1;
  this.stats.averageScore = (currentTotal + newScore) / this.stats.timesTaken;
  
  if (passed) {
    const currentPasses = this.stats.passRate * (this.stats.timesTaken - 1) / 100;
    this.stats.passRate = ((currentPasses + 1) / this.stats.timesTaken) * 100;
  }
  
  await this.save();
};

module.exports = mongoose.model('Test', testSchema);
