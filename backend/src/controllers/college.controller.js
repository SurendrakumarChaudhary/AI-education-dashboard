const { Question, Test, TestResult } = require('../models');
const aiService = require('../utils/ai.service');

// @desc    Get subjects for college exams
// @route   GET /api/college/subjects
// @access  Public
exports.getSubjects = async (req, res, next) => {
  try {
    const subjects = await Question.distinct('subject', {
      category: 'college',
      isActive: true
    });

    // Add some default subjects if none exist
    const defaultSubjects = [
      'Data Structures',
      'Algorithms',
      'Operating Systems',
      'Database Management',
      'Computer Networks',
      'Object-Oriented Programming',
      'Software Engineering',
      'Web Development',
      'Machine Learning',
      'Cloud Computing'
    ];

    const allSubjects = [...new Set([...subjects, ...defaultSubjects])].sort();

    res.status(200).json({
      status: 'success',
      data: {
        subjects: allSubjects
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get MCQs by subject
// @route   GET /api/college/mcq/:subject
// @access  Public
exports.getMCQs = async (req, res, next) => {
  try {
    const { subject } = req.params;
    const { difficulty, limit = 10 } = req.query;

    const filter = {
      category: 'college',
      type: 'mcq',
      subject: new RegExp(subject, 'i'),
      isActive: true
    };

    if (difficulty) filter.difficulty = difficulty;

    const questions = await Question.find(filter)
      .limit(parseInt(limit))
      .select('-correctAnswer -explanation') // Don't send answers initially
      .sort({ createdAt: -1 });

    // If no questions exist, generate some
    if (questions.length === 0) {
      return res.status(200).json({
        status: 'success',
        data: {
          questions: [],
          message: 'No questions available for this subject. Use /generate to create new questions.'
        }
      });
    }

    res.status(200).json({
      status: 'success',
      count: questions.length,
      data: { questions }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Q&A by subject
// @route   GET /api/college/qa/:subject
// @access  Public
exports.getQA = async (req, res, next) => {
  try {
    const { subject } = req.params;
    const { limit = 10 } = req.query;

    const questions = await Question.find({
      category: 'college',
      type: 'qa',
      subject: new RegExp(subject, 'i'),
      isActive: true
    })
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      count: questions.length,
      data: { questions }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check MCQ answer
// @route   POST /api/college/mcq/:id/check
// @access  Private
exports.checkMCQAnswer = async (req, res, next) => {
  try {
    const { answerIndex } = req.body;
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        status: 'error',
        message: 'Question not found'
      });
    }

    if (question.type !== 'mcq') {
      return res.status(400).json({
        status: 'error',
        message: 'This endpoint is for MCQ questions only'
      });
    }

    const isCorrect = answerIndex === question.correctAnswer;

    // Update stats
    if (isCorrect) {
      question.stats.timesCorrect += 1;
    } else {
      question.stats.timesIncorrect += 1;
    }
    await question.save();

    // Update user progress
    req.user.progress.totalQuestionsAnswered += 1;
    if (isCorrect) {
      req.user.progress.correctAnswers += 1;
    }
    await req.user.save();

    res.status(200).json({
      status: 'success',
      data: {
        isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        yourAnswer: question.options[answerIndex],
        correctAnswerText: question.options[question.correctAnswer]
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate college questions using AI
// @route   POST /api/college/generate
// @access  Private
exports.generateQuestions = async (req, res, next) => {
  try {
    const { subject, topic, difficulty = 'medium', count = 5, type = 'mixed' } = req.body;

    if (!subject || !topic) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide subject and topic'
      });
    }

    const generatedData = await aiService.generateCollegeQuestions(
      subject,
      topic,
      difficulty,
      parseInt(count)
    );

    // Save generated questions
    const savedQuestions = [];
    for (const q of generatedData.questions) {
      // Filter by type if specified
      if (type !== 'mixed' && q.type !== type) continue;

      const questionData = {
        type: q.type || 'qa',
        category: 'college',
        subject,
        difficulty: q.difficulty || difficulty,
        question: q.question,
        options: q.options || [],
        correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : null,
        answer: q.answer,
        explanation: q.explanation,
        source: 'ai-generated',
        aiModel: 'gpt-3.5-turbo',
        tags: [subject, topic, difficulty]
      };

      const saved = await Question.create(questionData);
      savedQuestions.push(saved);
    }

    res.status(201).json({
      status: 'success',
      message: `${savedQuestions.length} questions generated successfully`,
      data: {
        questions: savedQuestions
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's college prep progress
// @route   GET /api/college/progress
// @access  Private
exports.getProgress = async (req, res, next) => {
  try {
    const user = req.user;
    
    // Get subject-wise breakdown
    const subjectStats = await Question.aggregate([
      {
        $match: {
          category: 'college',
          isActive: true
        }
      },
      {
        $group: {
          _id: '$subject',
          totalQuestions: { $sum: 1 },
          mcqCount: {
            $sum: { $cond: [{ $eq: ['$type', 'mcq'] }, 1, 0] }
          },
          qaCount: {
            $sum: { $cond: [{ $eq: ['$type', 'qa'] }, 1, 0] }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        overall: {
          totalQuestionsAnswered: user.progress.totalQuestionsAnswered,
          correctAnswers: user.progress.correctAnswers,
          accuracy: user.getAccuracy()
        },
        subjects: subjectStats
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recommended topics
// @route   GET /api/college/recommendations
// @access  Private
exports.getRecommendations = async (req, res, next) => {
  try {
    // Get subjects with most questions
    const popularSubjects = await Question.aggregate([
      {
        $match: {
          category: 'college',
          isActive: true
        }
      },
      {
        $group: {
          _id: '$subject',
          questionCount: { $sum: 1 },
          avgDifficulty: { $avg: { $switch: {
            branches: [
              { case: { $eq: ['$difficulty', 'easy'] }, then: 1 },
              { case: { $eq: ['$difficulty', 'medium'] }, then: 2 },
              { case: { $eq: ['$difficulty', 'hard'] }, then: 3 }
            ],
            default: 2
          }}},
          topics: { $addToSet: '$tags' }
        }
      },
      {
        $sort: { questionCount: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // Based on user's weak areas, recommend topics
    const recommendations = popularSubjects.map(s => ({
      subject: s._id,
      questionCount: s.questionCount,
      difficulty: s.avgDifficulty <= 1.5 ? 'easy' : s.avgDifficulty <= 2.5 ? 'medium' : 'hard',
      reason: 'Popular topic with comprehensive coverage'
    }));

    res.status(200).json({
      status: 'success',
      data: {
        recommendations
      }
    });
  } catch (error) {
    next(error);
  }
};
