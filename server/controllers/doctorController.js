const Doctor = require('../models/Doctor');

// CREATE doctor profile
exports.createProfile = async (req, res) => {
  try {
    const existing = await Doctor.findOne({ userId: req.user.id });
    if (existing) {
      return res.status(400).json({ message: 'Profile already exists' });
    }
    const doctor = await Doctor.create({
      userId: req.user.id,
      ...req.body
    });
    res.status(201).json({ message: 'Profile created', doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET single doctor profile
exports.getProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('userId', 'name email phone');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE doctor profile
exports.updateProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOneAndUpdate(
      { userId: req.user.id },
      req.body,
      { new: true }
    );
    res.json({ message: 'Profile updated', doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// SEARCH doctors — FIXED: case-insensitive + partial match
exports.searchDoctors = async (req, res) => {
  try {
    const { city, specialty, maxFee, language, lat, lng } = req.query;

    let query = { isAvailable: true };

    // City: case-insensitive partial match
    if (city) {
      query.city = { $regex: city.trim(), $options: 'i' };
    }

    // Specialty: smart matching
    // e.g. "Cardiology" should match "Cardiologist", "Cardiac Surgeon" etc.
    // "General Physician" should match "General Physician", "GP" etc.
    if (specialty && specialty !== 'All Categories') {
      // Build a flexible regex from the specialty filter
      // Strip common suffixes to get root word for matching
      const specialtyMap = {
        'cardiology':        ['cardiolog', 'cardiac', 'heart'],
        'pediatrics':        ['pediatr', 'paediatr', 'child'],
        'dentistry':         ['dent', 'oral', 'tooth'],
        'ophthalmology':     ['ophthalm', 'eye', 'vision'],
        'general physician': ['general physician', 'gp', 'general medicine', 'family medicine'],
        'orthopedic':        ['orthop', 'orthopaed', 'bone', 'joint'],
        'dermatology':       ['dermatol', 'skin'],
        'neurology':         ['neurolog', 'neuro', 'brain'],
        'gynecology':        ['gynecol', 'gynaecol', 'obstet', 'women'],
        'psychiatry':        ['psychiatr', 'mental'],
        'ent':               ['ent', 'ear', 'nose', 'throat'],
        'oncology':          ['oncol', 'cancer'],
        'nephrology':        ['nephrol', 'kidney'],
        'urology':           ['urol', 'bladder'],
        'pulmonology':       ['pulmonol', 'lung', 'respiratory'],
        'gastroenterology':  ['gastro', 'stomach', 'digestive'],
        'endocrinology':     ['endocrinol', 'diabetes', 'thyroid', 'hormone'],
      };

      const key = specialty.toLowerCase().trim();
      const keywords = specialtyMap[key];

      if (keywords) {
        // Match any of the keywords
        query.specialty = {
          $regex: keywords.join('|'),
          $options: 'i'
        };
      } else {
        // Fallback: partial match on the specialty itself
        query.specialty = { $regex: specialty.trim(), $options: 'i' };
      }
    }

    if (maxFee) query.fee = { $lte: Number(maxFee) };
    if (language) query.languages = { $in: [language] };

    // Geospatial search
    if (lat && lng) {
      const doctors = await Doctor.find({
        ...query,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            $maxDistance: 10000
          }
        }
      }).populate('userId', 'name phone');
      return res.json({ count: doctors.length, doctors });
    }

    // Normal search — sorted by rating
    const doctors = await Doctor.find(query)
      .populate('userId', 'name phone')
      .sort({ rating: -1 });

    res.json({ count: doctors.length, doctors });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET all doctors
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ isAvailable: true })
      .populate('userId', 'name phone')
      .sort({ rating: -1 })
      .limit(20);
    res.json({ count: doctors.length, doctors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};