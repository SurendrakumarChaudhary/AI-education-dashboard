const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  // Question type: 'mcq' for multiple choice, 'qa' for question-answer
  type: {
    type: String,
    enum: ['mcq', 'qa'],
    required: true
  },
  // Category: 'college' or 'placement'
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
  // For placement: specific role
  role: {
    type: String,
    default: null,
    trim: true
  },
  // Difficulty level
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  // Question text
  question: {
    type: String,
    required: [true, 'Please provide a question'],
    trim: true
  },
  // For MCQ: options array
  options: [{
    type: String,
    trim: true
  }],
  // For MCQ: index of correct answer
  correctAnswer: {
    type: Number,
    default: null,
    min: 0
  },
  // Answer/Explanation (for both MCQ and QA)
  answer: {
    type: String,
    required: [true, 'Please provide an answer or explanation'],
    trim: true
  },
  // Detailed explanation
  explanation: {
    type: String,
    default: null,
    trim: true
  },
  // Code snippet if applicable
  codeSnippet: {
    type: String,
    default: null
  },
  // Programming language for code snippet
  language: {
    type: String,
    default: null
  },
  // Tags for filtering
  tags: [{
    type: String,
    trim: true
  }],
  // Source (if AI-generated)
  source: {
    type: String,
    enum: ['manual', 'ai-generated', 'imported'],
    default: 'manual'
  },
  // AI model used (if AI-generated)
  aiModel: {
    type: String,
    default: null
  },
  // Usage statistics
  stats: {
    timesAsked: {
      type: Number,
      default: 0
    },
    timesCorrect: {
      type: Number,
      default: 0
    },
    timesIncorrect: {
      type: Number,
      default: 0
    }
  },
  // Is active
  isActive: {
    type: Boolean,
    default: true
  },
  // Created by (admin or system)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Indexes for faster queries
questionSchema.index({ category: 1, subject: 1 });
questionSchema.index({ type: 1, difficulty: 1 });
questionSchema.index({ role: 1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ isActive: 1 });

// Calculate success rate
questionSchema.methods.getSuccessRate = function() {
  const total = this.stats.timesCorrect + this.stats.timesIncorrect;
  if (total === 0) return 0;
  return Math.round((this.stats.timesCorrect / total) * 100);
};

// Static method to get random questions
questionSchema.statics.getRandomQuestions = async function(filters, limit = 10) {
  return this.aggregate([
    { $match: { ...filters, isActive: true } },
    { $sample: { size: limit } }
  ]);
};

// Static method to get questions by subject
questionSchema.statics.getBySubject = async function(subject, category, limit = 20) {
  return this.find({ 
    subject: new RegExp(subject, 'i'), 
    category,
    isActive: true 
  })
  .limit(limit)
  .sort({ createdAt: -1 });
};

module.exports = mongoose.model('Question', questionSchema);
