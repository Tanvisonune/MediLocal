const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

// BOOK appointment (patients only)
exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, slot, symptoms } = req.body;

    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if slot already taken
    const existing = await Appointment.findOne({
      doctorId,
      date,
      slot,
      status: { $ne: 'cancelled' }
    });

    if (existing) {
      return res.status(400).json({ message: 'This slot is already booked' });
    }

    const appointment = await Appointment.create({
      doctorId,
      patientId: req.user.id,
      date,
      slot,
      symptoms
    });

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET patient's own appointments
exports.getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patientId: req.user.id
    })
      .populate('doctorId', 'name specialty clinicName address fee')
      .sort({ date: 1 });

    res.json({ count: appointments.length, appointments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET doctor's appointments (doctors only)
exports.getDoctorAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const appointments = await Appointment.find({
      doctorId: doctor._id
    })
      .populate('patientId', 'name phone')
      .sort({ date: 1 });

    res.json({ count: appointments.length, appointments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE appointment status (doctor confirms/completes)
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json({ message: 'Status updated', appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CANCEL appointment (patient cancels their own)
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      patientId: req.user.id
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel completed appointment' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({ message: 'Appointment cancelled', appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET available slots for a doctor on a date
exports.getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    // All possible slots
    const allSlots = [
      '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
      '11:00 AM', '11:30 AM', '12:00 PM',
      '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
      '4:00 PM', '4:30 PM', '5:00 PM'
    ];

    // Find already booked slots
    const booked = await Appointment.find({
      doctorId,
      date,
      status: { $ne: 'cancelled' }
    }).select('slot');

    const bookedSlots = booked.map(a => a.slot);

    // Return only available ones
    const availableSlots = allSlots.filter(
      slot => !bookedSlots.includes(slot)
    );

    res.json({ date, availableSlots });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};