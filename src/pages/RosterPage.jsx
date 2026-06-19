import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCharacters } from '../hooks/useCharacters';
import { useAudio } from '../context/AudioContext';
import CharacterCard from '../components/CharacterCard';

export default function RosterPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const audio = useAudio();
  const { characters } = useCharacters();

  const origins = useMemo(() => [...new Set(characters.map((c) => c.origin))], [characters]);
  const filtered = useMemo(() => characters.filter((c) => {
    if (filter !== 'all' && c.origin !== filter) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  }), [characters, filter, search]);

  const handleCardClick = useCallback(
    (id) => {
      navigate(`/character/${id}`);
      audio.playClick();
    },
    [navigate, audio]
  );

  return (
    <div className="page roster-page">
      {/* Background ambient glow */}
      <div
        style={{
          position: 'fixed',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(230,57,70,0.03) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div className="page-header">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Character Roster
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Select your fighter
        </motion.p>
      </div>

      <div className="roster-controls" style={{ position: 'relative', zIndex: 1 }}>
        <motion.input
          className="roster-search"
          placeholder="Search fighter..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        />
        <motion.div
          className="filter-pills"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
        >
          <button
            className={`filter-pill${filter === 'all' ? ' active' : ''}`}
            onClick={() => {
              setFilter('all');
              audio?.playClick?.();
            }}
          >
            All
          </button>
          {origins.slice(0, 6).map((o) => (
            <button
              key={o}
              className={`filter-pill${filter === o ? ' active' : ''}`}
              onClick={() => {
                setFilter(o);
                audio?.playClick?.();
              }}
              onMouseEnter={() => audio?.playHover?.()}
            >
              {o}
            </button>
          ))}
        </motion.div>
      </div>

      {filtered.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            textAlign: 'center',
            color: 'var(--white-muted)',
            fontSize: '1.1rem',
            marginTop: '3rem',
            fontFamily: 'var(--font-body)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          No fighters found
        </motion.p>
      ) : (
        <motion.div
          className="roster-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ position: 'relative', zIndex: 1 }}
        >
          {filtered.map((c, i) => (
            <CharacterCard
              key={c.id}
              char={c}
              index={i}
              onClick={() => handleCardClick(c.id)}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}
