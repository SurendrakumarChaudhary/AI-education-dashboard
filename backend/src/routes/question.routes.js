const express = require('express');
const router = express.Router();
const questionController = require('../controllers/question.controller');
const { protect, optionalAuth } = require('../middleware/auth.middleware');

// Public routes
router.get('/', optionalAuth, questionController.getQuestions);
router.get('/subjects', questionController.getSubjects);
router.get('/tags', questionController.getTags);
router.get('/subject/:subject', questionController.getBySubject);
router.get('/:id', questionController.getQuestion);

// Protected routes
router.post('/:id/answer', protect, questionController.submitAnswer);
router.post('/:id/explain', protect, questionController.getExplanation);
router.post('/generate', protect, questionController.generateQuestions);

// Admin only routes
router.post('/', protect, questionController.createQuestion);
router.put('/:id', protect, questionController.updateQuestion);
router.delete('/:id', protect, questionController.deleteQuestion);

module.exports = router;
