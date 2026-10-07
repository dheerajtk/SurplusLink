const jwt = require('jsonwebtoken');

/**
 * protect — verifies the JWT in the Authorization header.
 * Attaches decoded payload as req.user = { userId, role }.
 */
exports.protect = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = auth.split(' ')[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * requireRole(...roles) — must be used AFTER protect.
 * Example: router.get('/admin', protect, requireRole('admin'), handler)
 */
exports.requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden: insufficient role' });
  }
  next();
};
