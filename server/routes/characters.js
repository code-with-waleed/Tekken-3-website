import { Router } from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/auth.js';
import { dbGet, dbAll, dbRun, saveDB } from '../db.js';

const router = Router();

// ── Image upload config ───────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop();
    cb(null, `char_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    const ext = allowed.test(file.originalname.split('.').pop().toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(null, ext && mime);
  },
});

// ── Helper: get full character with traits + moves ────────────────
function getFullCharacter(id) {
  const char = dbGet('SELECT * FROM characters WHERE id = ?', [id]);
  if (!char) return null;

  const traitRows = dbAll(
    'SELECT trait FROM character_traits WHERE character_id = ? ORDER BY sort_order',
    [id]
  );
  const traits = traitRows.map((r) => r.trait);

  const moves = dbAll(
    'SELECT name, input, description FROM character_moves WHERE character_id = ? ORDER BY sort_order',
    [id]
  );

  return {
    id: char.id,
    name: char.name,
    origin: char.origin,
    style: char.style,
    difficulty: char.difficulty,
    accentColor: char.accent_color,
    quote: char.quote,
    description: char.description,
    backstory: char.backstory,
    image: char.image,
    arcadeScore: char.arcade_score,
    traits,
    moves,
  };
}

function getAllCharacters() {
  const chars = dbAll('SELECT id FROM characters ORDER BY name');
  return chars.map((c) => getFullCharacter(c.id)).filter(Boolean);
}

// ── Seed characters from localStorage data if empty ───────────────
function seedIfEmpty(defaultCharacters) {
  const rows = dbAll('SELECT COUNT(*) as count FROM characters');
  if (rows[0].count > 0 || !defaultCharacters || defaultCharacters.length === 0) return;

  console.log(`[DB] Seeding ${defaultCharacters.length} default characters...`);

  for (const c of defaultCharacters) {
    dbRun(
      `INSERT INTO characters (id, name, origin, style, difficulty, accent_color, quote, description, backstory, image, arcade_score)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [c.id, c.name, c.origin || '', c.style || '', c.difficulty || 5,
       c.accentColor || '#e63946', c.quote || '', c.description || '',
       c.backstory || '', c.image || '', c.arcadeScore || 0]
    );
    if (c.traits) {
      c.traits.forEach((t, i) => {
        dbRun(
          'INSERT INTO character_traits (character_id, trait, sort_order) VALUES (?, ?, ?)',
          [c.id, t, i]
        );
      });
    }
    if (c.moves) {
      c.moves.forEach((m, i) => {
        dbRun(
          'INSERT INTO character_moves (character_id, name, input, description, sort_order) VALUES (?, ?, ?, ?, ?)',
          [c.id, m.name, m.input || '', m.description || '', i]
        );
      });
    }
  }
}

// ── GET /api/characters ───────────────────────────────────────────
router.get('/', (req, res) => {
  res.json(getAllCharacters());
});

// ── GET /api/characters/:id ───────────────────────────────────────
router.get('/:id', (req, res) => {
  const char = getFullCharacter(req.params.id);
  if (!char) return res.status(404).json({ error: 'Character not found' });
  res.json(char);
});

// ── POST /api/characters/seed ─────────────────────────────────────
router.post('/seed', (req, res) => {
  const { characters } = req.body;
  if (!characters || !Array.isArray(characters)) {
    return res.status(400).json({ error: 'characters array required' });
  }
  seedIfEmpty(characters);
  res.json({ message: 'Seed complete', count: getAllCharacters().length });
});

// ── POST /api/characters ──────────────────────────────────────────
router.post('/', authMiddleware, upload.single('image'), (req, res) => {
  let data;
  try {
    data = JSON.parse(req.body.data || '{}');
  } catch {
    return res.status(400).json({ error: 'Invalid JSON data' });
  }

  const { id, name, origin, style, difficulty, accentColor, quote, description, backstory, traits, moves, arcadeScore } = data;

  if (!id || !name) {
    return res.status(400).json({ error: 'ID and name are required' });
  }

  const exists = dbGet('SELECT id FROM characters WHERE id = ?', [id]);
  if (exists) {
    return res.status(409).json({ error: 'Character ID already exists' });
  }

  const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

  dbRun(
    `INSERT INTO characters (id, name, origin, style, difficulty, accent_color, quote, description, backstory, image, arcade_score)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, name, origin || '', style || '', difficulty || 5,
     accentColor || '#e63946', quote || '', description || '',
     backstory || '', imageUrl, arcadeScore || 0]
  );

  if (Array.isArray(traits)) {
    traits.forEach((t, i) => {
      dbRun('INSERT INTO character_traits (character_id, trait, sort_order) VALUES (?, ?, ?)', [id, t, i]);
    });
  }
  if (Array.isArray(moves)) {
    moves.forEach((m, i) => {
      dbRun('INSERT INTO character_moves (character_id, name, input, description, sort_order) VALUES (?, ?, ?, ?, ?)',
        [id, m.name, m.input || '', m.description || '', i]);
    });
  }

  res.json(getFullCharacter(id));
});

// ── PUT /api/characters/:id ───────────────────────────────────────
router.put('/:id', authMiddleware, upload.single('image'), (req, res) => {
  let data;
  try {
    data = JSON.parse(req.body.data || '{}');
  } catch {
    return res.status(400).json({ error: 'Invalid JSON data' });
  }

  const existing = dbGet('SELECT * FROM characters WHERE id = ?', [req.params.id]);
  if (!existing) {
    return res.status(404).json({ error: 'Character not found' });
  }

  const { name, origin, style, difficulty, accentColor, quote, description, backstory, traits, moves, arcadeScore } = data;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : existing.image;

  dbRun(
    `UPDATE characters SET
      name = ?, origin = ?, style = ?, difficulty = ?, accent_color = ?,
      quote = ?, description = ?, backstory = ?, image = ?, arcade_score = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`,
    [
      name || existing.name,
      origin ?? existing.origin,
      style ?? existing.style,
      difficulty ?? existing.difficulty,
      accentColor || existing.accent_color,
      quote ?? existing.quote,
      description ?? existing.description,
      backstory ?? existing.backstory,
      imageUrl,
      arcadeScore ?? existing.arcade_score,
      req.params.id,
    ]
  );

  // Replace traits
  dbRun('DELETE FROM character_traits WHERE character_id = ?', [req.params.id]);
  if (Array.isArray(traits)) {
    traits.forEach((t, i) => {
      dbRun('INSERT INTO character_traits (character_id, trait, sort_order) VALUES (?, ?, ?)', [req.params.id, t, i]);
    });
  }

  // Replace moves
  dbRun('DELETE FROM character_moves WHERE character_id = ?', [req.params.id]);
  if (Array.isArray(moves)) {
    moves.forEach((m, i) => {
      dbRun('INSERT INTO character_moves (character_id, name, input, description, sort_order) VALUES (?, ?, ?, ?, ?)',
        [req.params.id, m.name, m.input || '', m.description || '', i]);
    });
  }

  res.json(getFullCharacter(req.params.id));
});

// ── DELETE /api/characters/:id ────────────────────────────────────
router.delete('/:id', authMiddleware, (req, res) => {
  const existing = dbGet('SELECT id FROM characters WHERE id = ?', [req.params.id]);
  if (!existing) {
    return res.status(404).json({ error: 'Character not found' });
  }

  dbRun('DELETE FROM character_traits WHERE character_id = ?', [req.params.id]);
  dbRun('DELETE FROM character_moves WHERE character_id = ?', [req.params.id]);
  dbRun('DELETE FROM characters WHERE id = ?', [req.params.id]);

  res.json({ message: 'Character deleted' });
});

// ── GET /api/characters/leaderboard/top ───────────────────────────
// NOTE: This route MUST be defined before /:id to avoid route conflict
router.get('/leaderboard/top', (req, res) => {
  const leaders = dbAll(
    'SELECT id, name, accent_color, arcade_score FROM characters WHERE arcade_score > 0 ORDER BY arcade_score DESC LIMIT 10'
  ).map((r) => ({
    rank: 0,
    id: r.id,
    name: r.name.split(' ')[0].toUpperCase(),
    score: r.arcade_score,
    color: r.accent_color,
  })).map((e, i) => ({ ...e, rank: i + 1 }));

  res.json(leaders);
});

export default router;
