const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

// Protected routes
router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, userController.updateProfile);
router.get('/dashboard', protect, userController.getDashboard);
router.get('/stats', protect, userController.getStats);
router.get('/saved-questions', protect, userController.getSavedQuestions);
router.post('/save-question/:questionId', protect, userController.saveQuestion);
router.delete('/save-question/:questionId', protect, userController.removeSavedQuestion);

// Admin only routes
router.get('/', protect, adminOnly, userController.getAllUsers);
router.delete('/:id', protect, adminOnly, userController.deleteUser);

module.exports = router;
