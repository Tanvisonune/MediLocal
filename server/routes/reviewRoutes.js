const express = require('express');
const router = express.Router();
const { addReview, getDoctorReviews } = require('../controllers/reviewController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Get reviews for a doctor (public)
router.get('/:doctorId', getDoctorReviews);

// Add review (patients only)
router.post('/', protect, restrictTo('patient'), addReview);

module.exports = router;