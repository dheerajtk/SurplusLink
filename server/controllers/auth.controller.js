const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Partner = require('../models/Partner');

function signToken(user) {
  return jwt.sign(
    { userId: user._id, role: user.role, cafeteriaId: user.cafeteriaId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, cafeteriaId, orgName, type, phone } = req.body;

    if (!['staff', 'partner'].includes(role)) {
      return res.status(400).json({ error: 'Role must be staff or partner' });
    }

    // passwordHash field triggers bcrypt in the pre-save hook
    const user = await User.create({
      name, email, passwordHash: password, role,
      cafeteriaId: role === 'staff' ? cafeteriaId : null,
    });

    // If partner, create the Partner profile (unapproved by default)
    if (role === 'partner') {
      await Partner.create({ userId: user._id, orgName, type, phone });
    }

    const token = signToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Partners must be approved before logging in
    if (user.role === 'partner') {
      const partner = await Partner.findOne({ userId: user._id });
      if (!partner?.approved) {
        return res.status(403).json({ error: 'Your account is awaiting admin approval' });
      }
    }

    const token = signToken(user);
    res.json({ token, user });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me  (returns current user from token)
exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
};
