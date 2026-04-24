const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interview.controller');
const { protect } = require('../middleware/auth.middleware');

// All routes are protected
router.post('/start', protect, interviewController.startSession);
router.get('/session', protect, interviewController.getActiveSession);
router.get('/session/:id', protect, interviewController.getSession);
router.post('/chat', protect, interviewController.chat);
router.post('/generate-questions', protect, interviewController.generateQuestions);
router.post('/get-answer', protect, interviewController.getAnswer);
router.post('/evaluate', protect, interviewController.evaluateAnswer);
router.post('/complete', protect, interviewController.completeSession);
router.post('/abandon', protect, interviewController.abandonSession);
router.get('/history', protect, interviewController.getHistory);

module.exports = router;
