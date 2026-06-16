const express = require('express');
const router = express.Router();
const {
  createProfile,
  getProfile,
  updateProfile,
  searchDoctors,
  getAllDoctors
} = require('../controllers/doctorController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Public routes (no login needed)
router.get('/search', searchDoctors);
router.get('/', getAllDoctors);
router.get('/:id', getProfile);

// Protected routes (login required)
router.post('/profile', protect, restrictTo('doctor'), createProfile);
router.put('/profile', protect, restrictTo('doctor'), updateProfile);

module.exports = router;