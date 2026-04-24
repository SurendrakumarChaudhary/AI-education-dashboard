const { User, Question, TestResult, InterviewSession } = require('../models');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('savedQuestions', 'question subject type');

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          progress: user.progress,
          preferences: user.preferences,
          subscription: user.subscription,
          savedQuestions: user.savedQuestions,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, avatar, preferences } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (avatar) updateData.avatar = avatar;
    if (preferences) updateData.preferences = preferences;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          preferences: user.preferences
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user dashboard stats
// @route   GET /api/users/dashboard
// @access  Private
exports.getDashboard = async (req, res, next) => {
  try {
    const user = req.user;

    // Get recent test results
    const recentTests = await TestResult.find({
      user: user._id,
      status: 'completed'
    })
      .populate('test', 'title subject difficulty')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent interview sessions
    const recentInterviews = await InterviewSession.find({
      user: user._id
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('role type status metrics createdAt');

    // Get test statistics
    const testStats = await TestResult.getUserStats(user._id);

    // Get saved questions count
    const savedQuestionsCount = user.savedQuestions.length;

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          progress: user.progress,
          accuracy: user.getAccuracy()
        },
        stats: {
          tests: testStats,
          interviewsCompleted: user.progress.interviewsCompleted,
          savedQuestions: savedQuestionsCount
        },
        recentActivity: {
          tests: recentTests,
          interviews: recentInterviews
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save a question
// @route   POST /api/users/save-question/:questionId
// @access  Private
exports.saveQuestion = async (req, res, next) => {
  try {
    const { questionId } = req.params;

    // Check if question exists
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        status: 'error',
        message: 'Question not found'
      });
    }

    // Check if already saved
    if (req.user.savedQuestions.includes(questionId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Question already saved'
      });
    }

    // Add to saved questions
    req.user.savedQuestions.push(questionId);
    await req.user.save();

    res.status(200).json({
      status: 'success',
      message: 'Question saved successfully',
      data: {
        savedQuestions: req.user.savedQuestions
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove saved question
// @route   DELETE /api/users/save-question/:questionId
// @access  Private
exports.removeSavedQuestion = async (req, res, next) => {
  try {
    const { questionId } = req.params;

    // Remove from saved questions
    req.user.savedQuestions = req.user.savedQuestions.filter(
      id => id.toString() !== questionId
    );
    await req.user.save();

    res.status(200).json({
      status: 'success',
      message: 'Question removed from saved',
      data: {
        savedQuestions: req.user.savedQuestions
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get saved questions
// @route   GET /api/users/saved-questions
// @access  Private
exports.getSavedQuestions = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('savedQuestions');

    res.status(200).json({
      status: 'success',
      data: {
        savedQuestions: user.savedQuestions
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
exports.getStats = async (req, res, next) => {
  try {
    const user = req.user;

    // Get subject-wise performance
    const subjectPerformance = await TestResult.aggregate([
      {
        $match: {
          user: user._id,
          status: 'completed'
        }
      },
      {
        $lookup: {
          from: 'tests',
          localField: 'test',
          foreignField: '_id',
          as: 'testInfo'
        }
      },
      {
        $unwind: '$testInfo'
      },
      {
        $group: {
          _id: '$testInfo.subject',
          testsTaken: { $sum: 1 },
          averageScore: { $avg: '$score.percentage' },
          bestScore: { $max: '$score.percentage' }
        }
      },
      {
        $sort: { testsTaken: -1 }
      }
    ]);

    // Get weekly activity
    const weeklyActivity = await TestResult.aggregate([
      {
        $match: {
          user: user._id,
          status: 'completed',
          createdAt: {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          testsTaken: { $sum: 1 },
          averageScore: { $avg: '$score.percentage' }
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
          accuracy: user.getAccuracy(),
          testsCompleted: user.progress.testsCompleted,
          interviewsCompleted: user.progress.interviewsCompleted,
          streakDays: user.progress.streakDays
        },
        subjectPerformance,
        weeklyActivity
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(filter)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      data: {
        users,
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

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
