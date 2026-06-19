import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbGet, dbAll, dbRun } from '../db.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const TOKEN_EXPIRY = '24h';

// ── POST /api/auth/login ──────────────────────────────────────────
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const user = dbGet('SELECT * FROM users WHERE email = ?', [email]);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );

  res.json({
    token,
    user: { id: user.id, email: user.email, role: user.role },
  });
});

// ── POST /api/auth/change-password ────────────────────────────────
router.post('/change-password', (req, res) => {
  const { email, currentPassword, newPassword } = req.body;
  if (!email || !currentPassword || !newPassword) {
    return res.status(400).json({ error: 'All fields required' });
  }
  if (newPassword.length < 4) {
    return res.status(400).json({ error: 'New password must be at least 4 characters' });
  }

  const user = dbGet('SELECT * FROM users WHERE email = ?', [email]);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const valid = bcrypt.compareSync(currentPassword, user.password);
  if (!valid) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  const hash = bcrypt.hashSync(newPassword, 10);
  dbRun('UPDATE users SET password = ? WHERE id = ?', [hash, user.id]);

  res.json({ message: 'Password changed successfully' });
});

export default router;
