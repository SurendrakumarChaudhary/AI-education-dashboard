const { Question } = require('../models');
const aiService = require('../utils/ai.service');

// @desc    Get all questions with filters
// @route   GET /api/questions
// @access  Public/Private
exports.getQuestions = async (req, res, next) => {
  try {
    const {
      category,
      type,
      subject,
      role,
      difficulty,
      tags,
      limit = 20,
      page = 1,
      random = false
    } = req.query;

    // Build filter object
    const filter = { isActive: true };
    
    if (category) filter.category = category;
    if (type) filter.type = type;
    if (subject) filter.subject = new RegExp(subject, 'i');
    if (role) filter.role = new RegExp(role, 'i');
    if (difficulty) filter.difficulty = difficulty;
    if (tags) {
      const tagArray = tags.split(',').map(t => t.trim());
      filter.tags = { $in: tagArray };
    }

    let questions;

    if (random === 'true') {
      // Get random questions
      questions = await Question.aggregate([
        { $match: filter },
        { $sample: { size: parseInt(limit) } }
      ]);
    } else {
      // Get paginated questions
      const skip = (parseInt(page) - 1) * parseInt(limit);
      questions = await Question.find(filter)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });
    }

    // Get total count
    const total = await Question.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      data: {
        questions,
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

// @desc    Get single question
// @route   GET /api/questions/:id
// @access  Public
exports.getQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        status: 'error',
        message: 'Question not found'
      });
    }

    // Increment times asked
    question.stats.timesAsked += 1;
    await question.save();

    res.status(200).json({
      status: 'success',
      data: { question }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new question
// @route   POST /api/questions
// @access  Private (Admin)
exports.createQuestion = async (req, res, next) => {
  try {
    const questionData = {
      ...req.body,
      createdBy: req.user.id
    };

    const question = await Question.create(questionData);

    res.status(201).json({
      status: 'success',
      message: 'Question created successfully',
      data: { question }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update question
// @route   PUT /api/questions/:id
// @access  Private (Admin)
exports.updateQuestion = async (req, res, next) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!question) {
      return res.status(404).json({
        status: 'error',
        message: 'Question not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Question updated successfully',
      data: { question }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete question
// @route   DELETE /api/questions/:id
// @access  Private (Admin)
exports.deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);

    if (!question) {
      return res.status(404).json({
        status: 'error',
        message: 'Question not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Question deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get questions by subject
// @route   GET /api/questions/subject/:subject
// @access  Public
exports.getBySubject = async (req, res, next) => {
  try {
    const { subject } = req.params;
    const { category, limit = 20 } = req.query;

    const filter = {
      subject: new RegExp(subject, 'i'),
      isActive: true
    };
    if (category) filter.category = category;

    const questions = await Question.find(filter)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: {
        subject,
        count: questions.length,
        questions
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit answer and get feedback
// @route   POST /api/questions/:id/answer
// @access  Private
exports.submitAnswer = async (req, res, next) => {
  try {
    const { answerIndex, userAnswer } = req.body;
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        status: 'error',
        message: 'Question not found'
      });
    }

    let isCorrect = false;
    let feedback = null;

    if (question.type === 'mcq' && answerIndex !== undefined) {
      isCorrect = answerIndex === question.correctAnswer;
      
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

      feedback = {
        isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation
      };
    } else if (question.type === 'qa' && userAnswer) {
      // For Q&A, we could use AI to evaluate
      feedback = {
        message: 'Answer recorded for review',
        modelAnswer: question.answer
      };
    }

    res.status(200).json({
      status: 'success',
      data: {
        isCorrect,
        feedback
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate AI questions
// @route   POST /api/questions/generate
// @access  Private
exports.generateQuestions = async (req, res, next) => {
  try {
    const { subject, topic, difficulty = 'medium', count = 5, category } = req.body;

    if (!subject || !topic) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide subject and topic'
      });
    }

    let generatedData;

    if (category === 'college') {
      generatedData = await aiService.generateCollegeQuestions(
        subject,
        topic,
        difficulty,
        parseInt(count)
      );
    } else {
      // For placement questions
      generatedData = await aiService.generateInterviewQuestions(
        topic,
        difficulty,
        [subject],
        parseInt(count)
      );
    }

    // Save generated questions to database
    const savedQuestions = [];
    for (const q of generatedData.questions) {
      const questionData = {
        type: q.type || 'qa',
        category: category || 'college',
        subject,
        difficulty: q.difficulty || difficulty,
        question: q.question,
        options: q.options || [],
        correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : null,
        answer: q.answer || q.expectedAnswer,
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

// @desc    Get explanation for question
// @route   POST /api/questions/:id/explain
// @access  Private
exports.getExplanation = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        status: 'error',
        message: 'Question not found'
      });
    }

    // If explanation exists, return it
    if (question.explanation) {
      return res.status(200).json({
        status: 'success',
        data: {
          explanation: question.explanation,
          codeSnippet: question.codeSnippet
        }
      });
    }

    // Otherwise, generate one using AI
    const aiResponse = await aiService.generateExplanation(
      question.question,
      question.answer
    );

    // Save the generated explanation
    question.explanation = aiResponse.explanation;
    await question.save();

    res.status(200).json({
      status: 'success',
      data: {
        explanation: aiResponse.explanation,
        tokens: aiResponse.tokens
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all subjects
// @route   GET /api/questions/subjects
// @access  Public
exports.getSubjects = async (req, res, next) => {
  try {
    const { category } = req.query;
    
    const filter = { isActive: true };
    if (category) filter.category = category;

    const subjects = await Question.distinct('subject', filter);

    res.status(200).json({
      status: 'success',
      data: {
        subjects: subjects.sort()
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tags
// @route   GET /api/questions/tags
// @access  Public
exports.getTags = async (req, res, next) => {
  try {
    const tags = await Question.distinct('tags', { isActive: true });

    res.status(200).json({
      status: 'success',
      data: {
        tags: tags.filter(tag => tag).sort()
      }
    });
  } catch (error) {
    next(error);
  }
};
