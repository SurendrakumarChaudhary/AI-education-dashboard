const { Test, TestResult, Question } = require('../models');

// @desc    Get all tests
// @route   GET /api/tests
// @access  Public
exports.getTests = async (req, res, next) => {
  try {
    const {
      category,
      subject,
      difficulty,
      role,
      limit = 20,
      page = 1
    } = req.query;

    const filter = { isActive: true };
    
    if (category) filter.category = category;
    if (subject) filter.subject = new RegExp(subject, 'i');
    if (difficulty) filter.difficulty = difficulty;
    if (role) filter.role = new RegExp(role, 'i');

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const tests = await Test.find(filter)
      .populate('questions.question', 'question type difficulty')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Test.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      data: {
        tests,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single test
// @route   GET /api/tests/:id
// @access  Public
exports.getTest = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id)
      .populate('questions.question');

    if (!test) {
      return res.status(404).json({
        status: 'error',
        message: 'Test not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { test }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new test
// @route   POST /api/tests
// @access  Private (Admin)
exports.createTest = async (req, res, next) => {
  try {
    const testData = {
      ...req.body,
      createdBy: req.user.id
    };

    const test = await Test.create(testData);

    res.status(201).json({
      status: 'success',
      message: 'Test created successfully',
      data: { test }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update test
// @route   PUT /api/tests/:id
// @access  Private (Admin)
exports.updateTest = async (req, res, next) => {
  try {
    const test = await Test.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!test) {
      return res.status(404).json({
        status: 'error',
        message: 'Test not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Test updated successfully',
      data: { test }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete test
// @route   DELETE /api/tests/:id
// @access  Private (Admin)
exports.deleteTest = async (req, res, next) => {
  try {
    const test = await Test.findByIdAndDelete(req.params.id);

    if (!test) {
      return res.status(404).json({
        status: 'error',
        message: 'Test not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Test deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Start a test
// @route   POST /api/tests/:id/start
// @access  Private
exports.startTest = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id)
      .populate('questions.question');

    if (!test) {
      return res.status(404).json({
        status: 'error',
        message: 'Test not found'
      });
    }

    // Check if user has an in-progress test
    const existingResult = await TestResult.findOne({
      user: req.user.id,
      test: test._id,
      status: 'in-progress'
    });

    if (existingResult) {
      return res.status(200).json({
        status: 'success',
        message: 'Resuming existing test session',
        data: {
          testResult: existingResult,
          test: {
            id: test._id,
            title: test.title,
            description: test.description,
            settings: test.settings,
            questions: test.questions.map(q => ({
              id: q.question._id,
              question: q.question.question,
              type: q.question.type,
              options: q.question.options,
              order: q.order
            }))
          }
        }
      });
    }

    // Create new test result
    const testResult = await TestResult.create({
      user: req.user.id,
      test: test._id,
      status: 'in-progress',
      answers: []
    });

    res.status(201).json({
      status: 'success',
      message: 'Test started',
      data: {
        testResult,
        test: {
          id: test._id,
          title: test.title,
          description: test.description,
          settings: test.settings,
          questions: test.questions.map(q => ({
            id: q.question._id,
            question: q.question.question,
            type: q.question.type,
            options: q.question.options,
            order: q.order
          }))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit answer
// @route   POST /api/tests/:id/answer
// @access  Private
exports.submitAnswer = async (req, res, next) => {
  try {
    const { questionId, answer, timeSpent } = req.body;
    const testId = req.params.id;

    // Find test result
    const testResult = await TestResult.findOne({
      user: req.user.id,
      test: testId,
      status: 'in-progress'
    });

    if (!testResult) {
      return res.status(404).json({
        status: 'error',
        message: 'No active test session found'
      });
    }

    // Get question details
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        status: 'error',
        message: 'Question not found'
      });
    }

    // Check if answer is correct
    let isCorrect = false;
    if (question.type === 'mcq') {
      isCorrect = answer === question.correctAnswer;
    }

    // Update or add answer
    const existingAnswerIndex = testResult.answers.findIndex(
      a => a.question.toString() === questionId
    );

    if (existingAnswerIndex >= 0) {
      testResult.answers[existingAnswerIndex] = {
        question: questionId,
        selectedOption: answer,
        isCorrect,
        timeSpent
      };
    } else {
      testResult.answers.push({
        question: questionId,
        selectedOption: answer,
        isCorrect,
        timeSpent
      });
    }

    await testResult.save();

    res.status(200).json({
      status: 'success',
      data: {
        isCorrect,
        correctAnswer: question.type === 'mcq' ? question.correctAnswer : null,
        explanation: question.explanation
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete test
// @route   POST /api/tests/:id/complete
// @access  Private
exports.completeTest = async (req, res, next) => {
  try {
    const { timeSpent } = req.body;
    const testId = req.params.id;

    const testResult = await TestResult.findOne({
      user: req.user.id,
      test: testId,
      status: 'in-progress'
    }).populate('test');

    if (!testResult) {
      return res.status(404).json({
        status: 'error',
        message: 'No active test session found'
      });
    }

    // Update test result
    testResult.status = 'completed';
    testResult.timeSpent = timeSpent;
    testResult.passed = testResult.score.percentage >= testResult.test.settings.passingScore;
    
    await testResult.save();

    // Update test statistics
    await testResult.test.updateStats(
      testResult.score.percentage,
      testResult.passed
    );

    // Update user progress
    req.user.progress.testsCompleted += 1;
    await req.user.save();

    res.status(200).json({
      status: 'success',
      message: 'Test completed',
      data: {
        testResult: {
          id: testResult._id,
          score: testResult.score,
          passed: testResult.passed,
          timeSpent: testResult.timeSpent,
          completedAt: testResult.updatedAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's test history
// @route   GET /api/tests/history
// @access  Private
exports.getTestHistory = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const history = await TestResult.find({
      user: req.user.id,
      status: 'completed'
    })
      .populate('test', 'title subject difficulty')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      status: 'success',
      data: { history }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get test result details
// @route   GET /api/tests/results/:resultId
// @access  Private
exports.getTestResult = async (req, res, next) => {
  try {
    const testResult = await TestResult.findOne({
      _id: req.params.resultId,
      user: req.user.id
    }).populate({
      path: 'answers.question',
      select: 'question options correctAnswer explanation answer'
    }).populate('test', 'title description settings');

    if (!testResult) {
      return res.status(404).json({
        status: 'error',
        message: 'Test result not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { testResult }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get test statistics
// @route   GET /api/tests/stats
// @access  Private
exports.getTestStats = async (req, res, next) => {
  try {
    const stats = await TestResult.getUserStats(req.user.id);

    res.status(200).json({
      status: 'success',
      data: { stats }
    });
  } catch (error) {
    next(error);
  }
};
