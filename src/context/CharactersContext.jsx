import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { CHARACTERS, IMG } from '../data/characters';
import { fetchCharacters, fetchLeaderboard } from '../api/client';

const CharactersContext = createContext(null);

export function CharactersProvider({ children }) {
  const [characters, setCharacters] = useState(CHARACTERS);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Load characters from API (keep static data as fallback) ────
  const loadCharacters = useCallback(async () => {
    try {
      const data = await fetchCharacters();
      if (Array.isArray(data) && data.length > 0) {
        setCharacters(data);
      }
    } catch {
      // Server unavailable — keep current characters (initialized with static data)
    }
  }, []);

  // ── Load leaderboard from API ──────────────────────────────────
  const loadLeaderboard = useCallback(async () => {
    try {
      const data = await fetchLeaderboard();
      if (Array.isArray(data)) setLeaderboard(data);
    } catch {
      setLeaderboard([]);
    }
  }, []);

  // ── Initial load ───────────────────────────────────────────────
  useEffect(() => {
    Promise.all([loadCharacters(), loadLeaderboard()]).then(() => setLoading(false));
  }, [loadCharacters, loadLeaderboard]);

  // ── Poll for changes every 5 seconds (lighter than 1s) ─────────
  useEffect(() => {
    const interval = setInterval(() => {
      loadCharacters();
      loadLeaderboard();
    }, 5000);
    return () => clearInterval(interval);
  }, [loadCharacters, loadLeaderboard]);

  // ── Refresh function for after admin edits ─────────────────────
  const refresh = useCallback(() => {
    loadCharacters();
    loadLeaderboard();
  }, [loadCharacters, loadLeaderboard]);

  const value = useMemo(
    () => ({ characters, leaderboard, loading, IMG, refresh }),
    [characters, leaderboard, loading, refresh]
  );

  return (
    <CharactersContext.Provider value={value}>
      {children}
    </CharactersContext.Provider>
  );
}

export function useCharacters() {
  const ctx = useContext(CharactersContext);
  if (!ctx) {
    return { characters: CHARACTERS, leaderboard: [], loading: false, IMG, refresh: () => {} };
  }
  return ctx;
}
