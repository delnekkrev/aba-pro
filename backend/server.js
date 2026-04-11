// server.js — ABA Pro Coach API Entry Point
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  // In production, replace * with your actual frontend domain
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json()); // Parse JSON request bodies

// ─── Serve Frontend Files ─────────────────────────────────────────────────────
const path = require('path');
app.use(express.static(path.join(__dirname)));       // serves files from backend/ folder (aba-toolkit.html lives here)
app.use(express.static(path.join(__dirname, '..'))); // also serves from parent folder (app_photos, etc.)

// ─── Routes ───────────────────────────────────────────────────────────────────
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ABA Pro Coach API is running 🚀' });
});

// ─── 404 Handler (only for /api routes) ───────────────────────────────────────
app.use('/api', (req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 ABA Pro Coach API running at http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
  console.log(`   Register:     POST http://localhost:${PORT}/api/auth/register`);
  console.log(`   Login:        POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   Me:           GET  http://localhost:${PORT}/api/auth/me\n`);
});
