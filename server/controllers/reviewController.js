const Review = require('../models/Review');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

// Add review
exports.addReview = async (req, res) => {
  try {
    const { doctorId, rating, comment, appointmentId } = req.body;

    // Check if patient had a completed appointment with this doctor
    const appointment = await Appointment.findOne({
      doctorId,
      patientId: req.user.id,
      status: 'completed'
    });

    if (!appointment) {
      return res.status(403).json({
        message: 'You can only review doctors after a completed appointment'
      });
    }

    // Check if already reviewed
    const existing = await Review.findOne({
      doctorId,
      patientId: req.user.id
    });

    if (existing) {
      return res.status(400).json({
        message: 'You have already reviewed this doctor'
      });
    }

    // Create review
    const review = await Review.create({
      doctorId,
      patientId: req.user.id,
      appointmentId: appointment._id,
      rating,
      comment
    });

    // Update doctor's average rating
    const allReviews = await Review.find({ doctorId });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await Doctor.findByIdAndUpdate(doctorId, {
      rating: Math.round(avgRating * 10) / 10,
      totalReviews: allReviews.length
    });

    res.status(201).json({ message: 'Review added successfully', review });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this doctor' });
    }
    res.status(500).json({ message: error.message });
  }
};

// Get all reviews for a doctor
exports.getDoctorReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ doctorId: req.params.doctorId })
      .populate('patientId', 'name')
      .sort({ createdAt: -1 });

    res.json({ count: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};