const express = require('express');
const router = express.Router();
const { uploadRecord, getMyRecords, deleteRecord } = require('../controllers/recordController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Patient views records
router.get('/my', protect, restrictTo('patient'), getMyRecords);


// Both doctor and patient can upload
router.post('/upload', protect, upload.single('file'), uploadRecord);

// Delete record
router.delete('/:id', protect, deleteRecord);

module.exports = router;