// routes/auth.js — Register, Login, and Me endpoints
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { requireAuth, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// ─── Helper: generate a JWT token ─────────────────────────────────────────────
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' } // token valid for 7 days
  );
}

// ─── POST /api/auth/register ──────────────────────────────────────────────────
// Body: { name, email, password, role?, org? }
router.post('/register', async (req, res) => {
  const { name, email, password, role, org } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  // Password must be at least 8 characters
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  // Check if email is already taken
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  // Hash the password (never store plain text!)
  const hashedPassword = await bcrypt.hash(password, 12);

  // Insert new user
  const stmt = db.prepare(`
    INSERT INTO users (name, email, password, role, org)
    VALUES (?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    name.trim(),
    email.toLowerCase().trim(),
    hashedPassword,
    role || 'Behavior Technician',
    org ? org.trim() : null
  );

  const newUser = db.prepare('SELECT id, name, email, role, org, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
  const token = generateToken(newUser);

  return res.status(201).json({
    message: 'Account created successfully!',
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      org: newUser.org
    }
  });
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
// Body: { email, password }
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  // Find user by email
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (!user) {
    // Generic message to avoid revealing whether the email exists
    return res.status(401).json({ error: 'Incorrect email or password.' });
  }

  // Compare password with hash
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({ error: 'Incorrect email or password.' });
  }

  const token = generateToken(user);

  return res.json({
    message: 'Logged in successfully!',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      org: user.org
    }
  });
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
// Returns current user info. Requires valid JWT.
router.get('/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT id, name, email, role, org, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }
  return res.json({ user });
});

// ─── PUT /api/auth/profile ────────────────────────────────────────────────────
// Updates name, role, and org for the logged-in user. Requires valid JWT.
// Body: { name, role, org }
router.put('/profile', requireAuth, (req, res) => {
  const { name, role, org } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required.' });
  }

  const validRoles = ['Behavior Technician', 'RBT', 'BCBA', 'BCaBA', 'BCBA-D', 'Supervisor', 'Other'];
  if (role && !validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role selected.' });
  }

  db.prepare(`
    UPDATE users SET name = ?, role = ?, org = ? WHERE id = ?
  `).run(
    name.trim(),
    role || 'Behavior Technician',
    org ? org.trim() : null,
    req.user.id
  );

  const updated = db.prepare('SELECT id, name, email, role, org, created_at FROM users WHERE id = ?').get(req.user.id);

  // Issue a fresh token with updated name/role
  const newToken = jwt.sign(
    { id: updated.id, email: updated.email, name: updated.name, role: updated.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({
    message: 'Profile updated successfully!',
    token: newToken,
    user: {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      org: updated.org
    }
  });
});

// ─── PUT /api/auth/password ───────────────────────────────────────────────────
// Changes the password for the logged-in user. Requires valid JWT.
// Body: { currentPassword, newPassword }
router.put('/password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new passwords are required.' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters.' });
  }

  // Fetch full user row (need the hashed password)
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const passwordMatch = await bcrypt.compare(currentPassword, user.password);
  if (!passwordMatch) {
    return res.status(401).json({ error: 'Current password is incorrect.' });
  }

  const newHash = await bcrypt.hash(newPassword, 12);
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(newHash, req.user.id);

  return res.json({ message: 'Password changed successfully!' });
});

module.exports = router;
