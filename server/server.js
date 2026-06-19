import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initDB } from './db.js';
import authRoutes from './routes/auth.js';
import characterRoutes from './routes/characters.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function start() {
  // Initialize database first
  await initDB();

  const app = express();
  const PORT = process.env.PORT || 3001;

  // ── Middleware ─────────────────────────────────────────────────
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ── Static: uploaded images ───────────────────────────────────
  app.use('/uploads', express.static(join(__dirname, 'uploads')));

  // ── API routes ────────────────────────────────────────────────
  app.use('/api/auth', authRoutes);
  app.use('/api/characters', characterRoutes);

  // ── Health check ──────────────────────────────────────────────
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ── Start server ──────────────────────────────────────────────
  app.listen(PORT, () => {
    console.log(`\n⚡ TEKKEN 3 API Server running on http://localhost:${PORT}`);
    console.log(`  → Health:  GET  /api/health`);
    console.log(`  → Auth:    POST /api/auth/login`);
    console.log(`  → Chars:   GET  /api/characters`);
    console.log(`  → Leader:  GET  /api/characters/leaderboard/top`);
    console.log(`  → Uploads: GET  /uploads/:filename\n`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
