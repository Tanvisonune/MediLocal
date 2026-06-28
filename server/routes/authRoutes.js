const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    // Fetch user info using the access token
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo`,
      { headers: { Authorization: `Bearer ${credential}` } }
    );

    if (!response.ok) throw new Error('Failed to fetch Google user info');

    const { email, name, picture } = await response.json();

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      const hashedPassword = await bcrypt.hash(email + 'google_secret', 10);
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        phone: '0000000000',
        role: 'patient',
        isVerified: true
      });
    }

    const token = generateToken(user._id, user.role);
    res.json({
      message: 'Google login successful',
      token,
      user: { id: user._id, name: user.name, role: user.role }
    });

  } catch (error) {
    console.error('Google login error:', error.message);
    res.status(500).json({ message: 'Google login failed' });
  }
};