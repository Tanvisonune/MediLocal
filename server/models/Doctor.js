const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  specialty: {
    type: String,
    required: true
    // e.g. "Cardiologist", "Dermatologist", "General Physician"
  },
  clinicName: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  fee: {
    type: Number,
    required: true
  },
  languages: {
    type: [String],
    default: ['Hindi', 'English']
  },
  timings: {
    type: String,
    default: '9:00 AM - 5:00 PM'
  },
  experience: {
    type: Number,  // years
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// This enables location-based search
doctorSchema.index({ location: '2dsphere' });
// This speeds up city/specialty search
doctorSchema.index({ city: 1, specialty: 1 });

module.exports = mongoose.model('Doctor', doctorSchema);