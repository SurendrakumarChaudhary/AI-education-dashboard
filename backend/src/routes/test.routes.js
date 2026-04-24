const express = require('express');
const router = express.Router();
const testController = require('../controllers/test.controller');
const { protect } = require('../middleware/auth.middleware');

// Public routes
router.get('/', testController.getTests);
router.get('/:id', testController.getTest);

// Protected routes
router.post('/:id/start', protect, testController.startTest);
router.post('/:id/answer', protect, testController.submitAnswer);
router.post('/:id/complete', protect, testController.completeTest);
router.get('/history/me', protect, testController.getTestHistory);
router.get('/results/:resultId', protect, testController.getTestResult);
router.get('/stats/me', protect, testController.getTestStats);

// Admin only routes
router.post('/', protect, testController.createTest);
router.put('/:id', protect, testController.updateTest);
router.delete('/:id', protect, testController.deleteTest);

module.exports = router;
