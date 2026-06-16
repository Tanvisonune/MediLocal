const MedicalRecord = require('../models/MedicalRecord');
const path = require('path');

// Doctor uploads a record for patient
exports.uploadRecord = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { name, type, issuedBy, notes, appointmentId } = req.body;

    // If doctor uploads → they specify patientId
    // If patient uploads → patientId is themselves
    const patientId = req.user.role === 'doctor'
      ? req.body.patientId
      : req.user.id;

    const record = await MedicalRecord.create({
      patientId,
      uploadedBy: req.user.id,
      uploadedByRole: req.user.role,
      appointmentId,
      name,
      type,
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      issuedBy,
      notes
    });

    res.status(201).json({ message: 'Record uploaded successfully', record });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Patient views their own records
exports.getMyRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find({ patientId: req.user.id })
      .populate('doctorId', 'name specialty')
      .sort({ createdAt: -1 });

    res.json({ count: records.length, records });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a record
exports.deleteRecord = async (req, res) => {
  try {
    await MedicalRecord.findByIdAndDelete(req.params.id);
    res.json({ message: 'Record deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};