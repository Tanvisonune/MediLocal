const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  uploadedBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User'
},
uploadedByRole: {
  type: String,
  enum: ['doctor', 'patient'],
  default: 'patient'
},
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  name: {
    type: String,
    required: true  // e.g. "CBC Blood Report"
  },
  type: {
    type: String,
    enum: ['Lab Result', 'Prescription', 'Radiology', 'Vaccination', 'Other'],
    default: 'Other'
  },
  fileUrl: {
    type: String,   // file path
    required: true
  },
  fileName: {
    type: String
  },
  issuedBy: {
    type: String    // clinic or doctor name
  },
  notes: {
    type: String
  }
},
 { timestamps: true });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);