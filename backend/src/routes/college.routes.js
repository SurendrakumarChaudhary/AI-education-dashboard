const express = require('express');
const router = express.Router();
const collegeController = require('../controllers/college.controller');
const { protect } = require('../middleware/auth.middleware');

// Public routes
router.get('/subjects', collegeController.getSubjects);
router.get('/mcq/:subject', collegeController.getMCQs);
router.get('/qa/:subject', collegeController.getQA);

// Protected routes
router.post('/mcq/:id/check', protect, collegeController.checkMCQAnswer);
router.post('/generate', protect, collegeController.generateQuestions);
router.get('/progress', protect, collegeController.getProgress);
router.get('/recommendations', protect, collegeController.getRecommendations);

module.exports = router;
