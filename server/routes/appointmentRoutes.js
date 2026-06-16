const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  updateStatus,
  cancelAppointment,
  getAvailableSlots
} = require('../controllers/appointmentController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// PUBLIC — no login needed
router.get('/slots', getAvailableSlots);

// All routes below need login
router.use(protect);

// Patient routes
router.post('/book', restrictTo('patient'), bookAppointment);
router.get('/my', restrictTo('patient'), getMyAppointments);
router.put('/cancel/:id', restrictTo('patient'), cancelAppointment);

// Doctor routes
router.get('/doctor', restrictTo('doctor'), getDoctorAppointments);
router.put('/status/:id', restrictTo('doctor'), updateStatus);

module.exports = router;