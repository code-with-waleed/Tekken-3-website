const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// ── Token management ──────────────────────────────────────────────
let _token = localStorage.getItem('tekken3_token') || '';

export function getToken() { return _token; }
export function setToken(t) { _token = t; localStorage.setItem('tekken3_token', t); }
export function clearToken() { _token = ''; localStorage.removeItem('tekken3_token'); }

// ── Base fetch wrapper ────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const headers = { ...options.headers };
  if (_token) headers['Authorization'] = `Bearer ${_token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    clearToken();
    throw new Error('Unauthorized');
  }

  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
  return json;
}

// ── Auth ──────────────────────────────────────────────────────────
export async function login(email, password) {
  const data = await apiFetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  setToken(data.token);
  return data;
}

export async function changePassword(email, currentPassword, newPassword) {
  return apiFetch('/api/auth/change-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, currentPassword, newPassword }),
  });
}

// ── Characters ────────────────────────────────────────────────────
export async function fetchCharacters() {
  return apiFetch('/api/characters');
}

export async function fetchCharacter(id) {
  return apiFetch(`/api/characters/${encodeURIComponent(id)}`);
}

export async function createCharacter(formData) {
  return apiFetch('/api/characters', {
    method: 'POST',
    headers: { Authorization: `Bearer ${_token}` },
    body: formData,
  });
}

export async function updateCharacter(id, formData) {
  return apiFetch(`/api/characters/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${_token}` },
    body: formData,
  });
}

export async function deleteCharacter(id) {
  return apiFetch(`/api/characters/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

// ── Leaderboard ───────────────────────────────────────────────────
export async function fetchLeaderboard() {
  return apiFetch('/api/characters/leaderboard/top');
}

// ── Seed (one-time) ───────────────────────────────────────────────
export async function seedCharacters(characters) {
  return apiFetch('/api/characters/seed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ characters }),
  });
}
