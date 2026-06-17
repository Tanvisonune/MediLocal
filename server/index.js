const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://medi-local-git-main-tans-projects-71f77ff6.vercel.app/'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ── ROUTES ──
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/records', require('./routes/recordRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));  

app.get('/', (req, res) => {
  res.json({ message: '🏥 Doctor App API running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));