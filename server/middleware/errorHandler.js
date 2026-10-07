/**
 * Central error handler — must be the last app.use() in index.js.
 * Express identifies error handlers by their 4-parameter signature.
 */
// eslint-disable-next-line no-unused-vars
module.exports = (err, _req, res, _next) => {
  console.error('[error]', err.message);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: messages.join(', ') });
  }

  // Mongoose duplicate key (e.g. unique email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ error: `${field} already in use` });
  }

  // JWT error forwarded manually
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
};
