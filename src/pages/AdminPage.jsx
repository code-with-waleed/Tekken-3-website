import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '../context/AudioContext';
import { useCharacters } from '../hooks/useCharacters';
import { getToken, clearToken, createCharacter, updateCharacter, deleteCharacter } from '../api/client';
import AdminLogin from '../components/AdminLogin';

const EMPTY_CHAR = {
  id: '',
  name: '',
  origin: '',
  style: '',
  difficulty: 5,
  accentColor: '#e63946',
  quote: '""',
  description: '',
  backstory: '',
  traits: [],
  moves: [],
  image: '',
  arcadeScore: 0,
};

const ACCENT_COLORS = [
  '#e63946', '#f4a261', '#2ecc71', '#9b59b6', '#e67e22',
  '#f1c40f', '#00f0ff', '#8e44ad', '#c0392b', '#3498db', '#8B4513',
];

export default function AdminPage() {
  const audio = useAudio();
  const navigate = useNavigate();
  const { characters, refresh } = useCharacters();
  const [authenticated, setAuthenticated] = useState(() => !!getToken());
  const [editing, setEditing] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_CHAR });
  const [activeTab, setActiveTab] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState(null);
  const [saving, setSaving] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const showNotification = useCallback((msg, type = 'success') => {
    clearTimeout(timerRef.current);
    setNotification({ msg, type });
    timerRef.current = setTimeout(() => setNotification(null), 2500);
  }, []);

  const filtered = characters.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.origin.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Build FormData for image upload ────────────────────────────
  const buildFormData = (data) => {
    const fd = new FormData();
    const { imageFile, ...rest } = data;
    if (imageFile) {
      fd.append('image', imageFile);
    }
    fd.append('data', JSON.stringify(rest));
    return fd;
  };

  // ── Save character (create or update) ──────────────────────────
  const handleSave = async () => {
    if (!form.id || !form.name) {
      showNotification('ID and Name are required', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form };
      if (isAdding) {
        await createCharacter(buildFormData(payload));
        showNotification(`${form.name} added successfully`);
      } else {
        await updateCharacter(editing, buildFormData(payload));
        showNotification(`${form.name} updated successfully`);
      }
      setEditing(null);
      setIsAdding(false);
      setForm({ ...EMPTY_CHAR });
      setActiveTab('list');
      refresh();
    } catch (err) {
      showNotification(err.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete character ───────────────────────────────────────────
  const handleDelete = async (id) => {
    const char = characters.find((c) => c.id === id);
    try {
      await deleteCharacter(id);
      showNotification(`${char?.name || id} deleted`, 'success');
      refresh();
    } catch (err) {
      showNotification(err.message || 'Delete failed', 'error');
    }
  };

  const startEdit = (char) => {
    setForm({
      ...char,
      moves: [...(char.moves || [])],
      traits: [...(char.traits || [])],
      image: char.image || '',
      arcadeScore: char.arcadeScore || 0,
    });
    setEditing(char.id);
    setIsAdding(false);
    setActiveTab('form');
  };

  const startAdd = () => {
    setForm({ ...EMPTY_CHAR, id: `char_${Date.now()}` });
    setEditing(null);
    setIsAdding(true);
    setActiveTab('form');
  };

  const updateMove = (idx, field, value) => {
    const moves = [...form.moves];
    moves[idx] = { ...moves[idx], [field]: value };
    setForm((f) => ({ ...f, moves }));
  };

  const addMove = () => {
    setForm((f) => ({
      ...f,
      moves: [...f.moves, { name: '', input: '', description: '' }],
    }));
  };

  const removeMove = (idx) => {
    setForm((f) => ({
      ...f,
      moves: f.moves.filter((_, i) => i !== idx),
    }));
  };

  const updateTrait = (idx, value) => {
    const traits = [...form.traits];
    traits[idx] = value;
    setForm((f) => ({ ...f, traits }));
  };

  const addTrait = () => {
    setForm((f) => ({ ...f, traits: [...f.traits, ''] }));
  };

  const removeTrait = (idx) => {
    setForm((f) => ({
      ...f,
      traits: f.traits.filter((_, i) => i !== idx),
    }));
  };

  const handleLogout = () => {
    clearToken();
    setAuthenticated(false);
  };

  if (!authenticated) {
    return <AdminLogin onAuthenticated={() => setAuthenticated(true)} />;
  }

  return (
    <div className="admin-page">
      <AnimatePresence>
        {notification && (
          <motion.div
            className={`admin-notification ${notification.type}`}
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
          >
            {notification.type === 'success' ? '✓' : '✗'} {notification.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="admin-container">
        <div className="admin-header">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Admin Panel
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Manage characters, stats, and moves
          </motion.p>
          <motion.button
            className="admin-btn secondary"
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ marginTop: '1rem', fontSize: '0.65rem' }}
          >
            🔒 Lock Admin Panel
          </motion.button>
        </div>

        <div className="admin-tabs">
          {[
            { key: 'list', label: 'Character List', icon: '◈' },
            { key: 'form', label: isAdding ? 'Add Character' : editing ? 'Edit Character' : 'Add / Edit', icon: '✎' },
          ].map((tab) => (
            <motion.button
              key={tab.key}
              className={`admin-tab${activeTab === tab.key ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span>{tab.icon}</span> {tab.label}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'list' && (
            <motion.div
              key="list"
              className="admin-list-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="admin-search-bar">
                <input
                  type="text"
                  placeholder="Search characters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="admin-search"
                />
                <motion.button
                  className="admin-btn primary"
                  onClick={startAdd}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  + Add Character
                </motion.button>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Origin</th>
                      <th>Style</th>
                      <th>Diff</th>
                      <th>Moves</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((char, i) => (
                      <motion.tr
                        key={char.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.02 }}
                      >
                        <td className="mono">{char.id}</td>
                        <td>
                          {char.image ? (
                            <img
                              src={char.image.startsWith('http') ? char.image : `http://localhost:3001${char.image}`}
                              alt={char.name}
                              style={{
                                width: '28px', height: '28px', borderRadius: '4px',
                                objectFit: 'cover', marginRight: '0.5rem', verticalAlign: 'middle',
                                border: '1px solid rgba(255,255,255,0.1)',
                              }}
                            />
                          ) : (
                            <span className="admin-color-dot" style={{ background: char.accentColor }} />
                          )}
                          {char.name}
                        </td>
                        <td>{char.origin}</td>
                        <td className="mono small">{char.style}</td>
                        <td>
                          <span className="diff-badge" style={{
                            background: char.difficulty <= 4 ? '#2ecc71' : char.difficulty <= 7 ? '#f4a261' : '#e63946',
                          }}>
                            {char.difficulty}/10
                          </span>
                        </td>
                        <td>{char.moves?.length || 0}</td>
                        <td className="actions-cell">
                          <motion.button
                            className="admin-btn-sm edit"
                            onClick={() => startEdit(char)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            Edit
                          </motion.button>
                          <motion.button
                            className="admin-btn-sm delete"
                            onClick={() => handleDelete(char.id)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            Delete
                          </motion.button>
                          <motion.button
                            className="admin-btn-sm view"
                            onClick={() => navigate(`/character/${char.id}`)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            View
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="admin-stats-row">
                <span>Total: {characters.length} characters</span>
                <span>Showing: {filtered.length}</span>
              </div>
            </motion.div>
          )}

          {activeTab === 'form' && (
            <motion.div
              key="form"
              className="admin-form-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2>{isAdding ? 'Add New Character' : `Editing: ${form.name}`}</h2>

              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label>Character ID</label>
                  <input
                    type="text"
                    value={form.id}
                    onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))}
                    disabled={!isAdding}
                    placeholder="e.g. jin, hwoarang"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Jin Kazama"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Origin</label>
                  <input
                    type="text"
                    value={form.origin}
                    onChange={(e) => setForm((f) => ({ ...f, origin: e.target.value }))}
                    placeholder="e.g. Japan"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Style</label>
                  <input
                    type="text"
                    value={form.style}
                    onChange={(e) => setForm((f) => ({ ...f, style: e.target.value }))}
                    placeholder="e.g. Mishima Style Karate"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Difficulty (1-10)</label>
                  <div className="diff-slider-wrap">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={form.difficulty}
                      onChange={(e) => setForm((f) => ({ ...f, difficulty: parseInt(e.target.value) }))}
                      className="diff-slider"
                    />
                    <span className="diff-display">{form.difficulty}</span>
                  </div>
                </div>
                <div className="admin-form-group">
                  <label>Accent Color</label>
                  <div className="color-picker">
                    {ACCENT_COLORS.map((c) => (
                      <button
                        key={c}
                        className={`color-swatch${form.accentColor === c ? ' selected' : ''}`}
                        style={{ background: c }}
                        onClick={() => setForm((f) => ({ ...f, accentColor: c }))}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Character Image */}
              <div className="admin-section" style={{ marginBottom: '1.5rem' }}>
                <div className="admin-section-header">
                  <h3>Character Image</h3>
                  {(form.image || form.imageFile) && (
                    <motion.button
                      className="admin-btn-sm delete"
                      onClick={() => setForm((f) => ({ ...f, image: '', imageFile: null }))}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      Remove Image
                    </motion.button>
                  )}
                </div>
                <div className="admin-image-upload">
                  {form.image || form.imageFile ? (
                    <div className="admin-image-preview">
                      <img
                        src={form.imageFile ? URL.createObjectURL(form.imageFile) : (form.image.startsWith('http') ? form.image : `http://localhost:3001${form.image}`)}
                        alt="Character preview"
                      />
                    </div>
                  ) : (
                    <label className="admin-image-dropzone">
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 2 * 1024 * 1024) {
                            showNotification('Image too large (max 2MB)', 'error');
                            return;
                          }
                          setForm((f) => ({ ...f, imageFile: file }));
                          showNotification('Image selected');
                        }}
                      />
                      <span className="dropzone-icon">📷</span>
                      <span className="dropzone-text">Click to upload character image</span>
                      <span className="dropzone-hint">PNG, JPG, WebP — max 2MB</span>
                    </label>
                  )}
                </div>
              </div>

              {/* Arcade Score */}
              <div className="admin-form-group full">
                <label>Arcade Score (for leaderboard)</label>
                <input
                  type="number"
                  min="0"
                  max="9999999"
                  value={form.arcadeScore}
                  onChange={(e) => setForm((f) => ({ ...f, arcadeScore: parseInt(e.target.value) || 0 }))}
                  placeholder="e.g. 9999999"
                  style={{ fontFamily: 'var(--font-mono)' }}
                />
              </div>

              <div className="admin-form-group full">
                <label>Quote</label>
                <input
                  type="text"
                  value={form.quote}
                  onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value }))}
                  placeholder="Character quote"
                />
              </div>

              <div className="admin-form-group full">
                <label>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  placeholder="Short character description"
                />
              </div>

              <div className="admin-form-group full">
                <label>Backstory</label>
                <textarea
                  value={form.backstory}
                  onChange={(e) => setForm((f) => ({ ...f, backstory: e.target.value }))}
                  rows={4}
                  placeholder="Full character backstory"
                />
              </div>

              {/* Traits */}
              <div className="admin-section">
                <div className="admin-section-header">
                  <h3>Traits</h3>
                  <motion.button
                    className="admin-btn-sm add"
                    onClick={addTrait}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    + Add Trait
                  </motion.button>
                </div>
                <div className="traits-editor">
                  {form.traits.map((trait, i) => (
                    <div key={i} className="trait-row">
                      <input
                        type="text"
                        value={trait}
                        onChange={(e) => updateTrait(i, e.target.value)}
                        placeholder="Trait name"
                      />
                      <motion.button
                        className="admin-btn-sm delete"
                        onClick={() => removeTrait(i)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        ✕
                      </motion.button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Moves */}
              <div className="admin-section">
                <div className="admin-section-header">
                  <h3>Moves ({form.moves.length})</h3>
                  <motion.button
                    className="admin-btn-sm add"
                    onClick={addMove}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    + Add Move
                  </motion.button>
                </div>
                <div className="moves-editor">
                  {form.moves.map((move, i) => (
                    <div key={i} className="move-row">
                      <div className="move-fields">
                        <input
                          type="text"
                          value={move.name}
                          onChange={(e) => updateMove(i, 'name', e.target.value)}
                          placeholder="Move name"
                          className="move-name-input"
                        />
                        <input
                          type="text"
                          value={move.input}
                          onChange={(e) => updateMove(i, 'input', e.target.value)}
                          placeholder="Input (e.g. f,N,d,d/f+2)"
                          className="move-input-input"
                        />
                        <input
                          type="text"
                          value={move.description}
                          onChange={(e) => updateMove(i, 'description', e.target.value)}
                          placeholder="Description"
                          className="move-desc-input"
                        />
                      </div>
                      <motion.button
                        className="admin-btn-sm delete"
                        onClick={() => removeMove(i)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        ✕
                      </motion.button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="admin-form-actions">
                <motion.button
                  className="admin-btn primary"
                  onClick={handleSave}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : isAdding ? 'Add Character' : 'Save Changes'}
                </motion.button>
                <motion.button
                  className="admin-btn secondary"
                  onClick={() => {
                    setEditing(null);
                    setIsAdding(false);
                    setForm({ ...EMPTY_CHAR });
                    setActiveTab('list');
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
