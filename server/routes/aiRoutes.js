const express = require('express');
const router = express.Router();
const { checkSymptoms } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/symptoms', protect, checkSymptoms);

module.exports = router;