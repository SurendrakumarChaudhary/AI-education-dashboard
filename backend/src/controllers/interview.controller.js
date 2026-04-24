const { InterviewSession } = require('../models');
const aiService = require('../utils/ai.service');

// @desc    Start new interview session
// @route   POST /api/interview/start
// @access  Private
exports.startSession = async (req, res, next) => {
  try {
    const { role, experienceLevel, topics, type = 'technical' } = req.body;

    if (!role) {
      return res.status(400).json({
        status: 'error',
        message: 'Please specify the target role'
      });
    }

    // Check for existing active session
    const existingSession = await InterviewSession.getActiveSession(req.user.id);
    if (existingSession) {
      return res.status(200).json({
        status: 'success',
        message: 'Resuming existing session',
        data: { session: existingSession }
      });
    }

    // Create new session
    const session = await InterviewSession.create({
      user: req.user.id,
      type,
      role,
      experienceLevel: experienceLevel || 'mid',
      topics: topics || [],
      messages: [{
        role: 'ai',
        content: `Hello! I'm your AI interview assistant. I'll help you prepare for a ${role} position. What would you like to focus on? You can ask me for interview questions, practice answers, or get feedback on your responses.`
      }]
    });

    res.status(201).json({
      status: 'success',
      message: 'Interview session started',
      data: { session }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active session
// @route   GET /api/interview/session
// @access  Private
exports.getActiveSession = async (req, res, next) => {
  try {
    const session = await InterviewSession.getActiveSession(req.user.id);

    if (!session) {
      return res.status(404).json({
        status: 'error',
        message: 'No active interview session found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { session }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send message to AI
// @route   POST /api/interview/chat
// @access  Private
exports.chat = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a message'
      });
    }

    // Get or create session
    let session = await InterviewSession.getActiveSession(req.user.id);
    
    if (!session) {
      // Create a default session
      session = await InterviewSession.create({
        user: req.user.id,
        role: 'General',
        messages: []
      });
    }

    // Add user message
    await session.addMessage('user', message);

    // Get AI response
    const aiResponse = await aiService.chatWithAI(
      session.messages,
      session.role
    );

    // Add AI response to session
    await session.addMessage(
      'ai',
      aiResponse.response,
      'gpt-3.5-turbo',
      aiResponse.tokens
    );

    res.status(200).json({
      status: 'success',
      data: {
        response: aiResponse.response,
        session: {
          id: session._id,
          messages: session.messages.slice(-10) // Return last 10 messages
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate interview questions
// @route   POST /api/interview/generate-questions
// @access  Private
exports.generateQuestions = async (req, res, next) => {
  try {
    const { role, experienceLevel, topics, count = 5 } = req.body;

    if (!role) {
      return res.status(400).json({
        status: 'error',
        message: 'Please specify the target role'
      });
    }

    // Get or create session
    let session = await InterviewSession.getActiveSession(req.user.id);
    if (!session) {
      session = await InterviewSession.create({
        user: req.user.id,
        role,
        experienceLevel: experienceLevel || 'mid',
        topics: topics || []
      });
    }

    // Generate questions using AI
    const generatedData = await aiService.generateInterviewQuestions(
      role,
      experienceLevel || 'mid',
      topics || [],
      parseInt(count)
    );

    // Save questions to session
    for (const q of generatedData.questions) {
      await session.addQuestion(q.question, q.category, q.difficulty);
    }

    // Add system message
    await session.addMessage(
      'ai',
      `I've generated ${generatedData.questions.length} interview questions for a ${role} position. Here they are:\n\n${generatedData.questions.map((q, i) => `${i + 1}. [${q.category}] ${q.question}`).join('\n\n')}\n\nWould you like me to provide detailed answers for any of these questions?`
    );

    res.status(200).json({
      status: 'success',
      message: `${generatedData.questions.length} questions generated`,
      data: {
        questions: generatedData.questions,
        session: {
          id: session._id,
          generatedQuestions: session.generatedQuestions
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get question answer/explanation
// @route   POST /api/interview/get-answer
// @access  Private
exports.getAnswer = async (req, res, next) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a question'
      });
    }

    const aiResponse = await aiService.generateExplanation(question);

    res.status(200).json({
      status: 'success',
      data: {
        answer: aiResponse.explanation,
        tokens: aiResponse.tokens
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Evaluate user's answer
// @route   POST /api/interview/evaluate
// @access  Private
exports.evaluateAnswer = async (req, res, next) => {
  try {
    const { question, userAnswer } = req.body;

    if (!question || !userAnswer) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide both question and your answer'
      });
    }

    const evaluation = await aiService.evaluateAnswer(question, userAnswer);

    res.status(200).json({
      status: 'success',
      data: {
        evaluation
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete interview session
// @route   POST /api/interview/complete
// @access  Private
exports.completeSession = async (req, res, next) => {
  try {
    const { feedback } = req.body;

    const session = await InterviewSession.getActiveSession(req.user.id);

    if (!session) {
      return res.status(404).json({
        status: 'error',
        message: 'No active session found'
      });
    }

    // Add feedback if provided
    if (feedback) {
      session.feedback = feedback;
    }

    // Complete session
    await session.complete();

    // Update user progress
    req.user.progress.interviewsCompleted += 1;
    await req.user.save();

    res.status(200).json({
      status: 'success',
      message: 'Session completed',
      data: {
        session: {
          id: session._id,
          metrics: session.metrics,
          generatedQuestions: session.generatedQuestions.length,
          completedAt: session.updatedAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get session history
// @route   GET /api/interview/history
// @access  Private
exports.getHistory = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const history = await InterviewSession.getUserHistory(
      req.user.id,
      parseInt(limit)
    );

    res.status(200).json({
      status: 'success',
      data: { history }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get session details
// @route   GET /api/interview/session/:id
// @access  Private
exports.getSession = async (req, res, next) => {
  try {
    const session = await InterviewSession.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!session) {
      return res.status(404).json({
        status: 'error',
        message: 'Session not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { session }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Abandon session
// @route   POST /api/interview/abandon
// @access  Private
exports.abandonSession = async (req, res, next) => {
  try {
    const session = await InterviewSession.getActiveSession(req.user.id);

    if (!session) {
      return res.status(404).json({
        status: 'error',
        message: 'No active session found'
      });
    }

    session.status = 'abandoned';
    await session.save();

    res.status(200).json({
      status: 'success',
      message: 'Session abandoned'
    });
  } catch (error) {
    next(error);
  }
};
