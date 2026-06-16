const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String,  // e.g. "2026-05-25"
    required: true
  },
  slot: {
    type: String,  // e.g. "10:00 AM"
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  symptoms: {
    type: String,  // patient describes their problem
    default: ''
  },
  notes: {
    type: String,  // doctor adds notes after visit
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);