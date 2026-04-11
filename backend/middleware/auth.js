// middleware/auth.js — JWT verification middleware
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'aba-pro-coach-secret-change-in-production';

/**
 * Protects routes that require a logged-in user.
 * Expects: Authorization: Bearer <token>
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'No token provided. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, name, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token is invalid or expired. Please log in again.' });
  }
}

module.exports = { requireAuth, JWT_SECRET };
