import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCharacters } from '../hooks/useCharacters';
import { useAudio } from '../context/AudioContext';

export default function ArcadePage() {
  const audio = useAudio();
  const { characters } = useCharacters();
  const [fight, setFight] = useState(false);

  // Build leaderboard from characters that have arcadeScore > 0
  const leaderboard = useMemo(() => {
    return characters
      .filter((c) => c.arcadeScore > 0)
      .sort((a, b) => b.arcadeScore - a.arcadeScore)
      .slice(0, 10)
      .map((c, i) => ({
        rank: i + 1,
        name: c.name.split(' ')[0].toUpperCase(),
        score: c.arcadeScore,
        color: c.accentColor,
      }));
  }, [characters]);

  const handleCoin = useCallback(() => {
    if (fight) return;
    audio.playCoin();
    setFight(true);
    setTimeout(() => {
      audio?.playFight?.();
    }, 800);
    setTimeout(() => setFight(false), 3500);
  }, [fight, audio]);

  return (
    <div className="page arcade-page">
      {/* Ambient glow */}
      <div
        style={{
          position: 'fixed',
          top: '30%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(230,57,70,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <motion.div
        className="arcade-cabinet"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="arcade-shine" />

        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          ARCADE MODE
        </motion.h1>

        <div className="leaderboard">
          <h2>HIGH SCORES</h2>
          {leaderboard.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                textAlign: 'center',
                color: 'var(--white-muted)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.1em',
                padding: '1.5rem 0',
              }}
            >
              No scores yet — set scores in the admin panel
            </motion.p>
          ) : (
            leaderboard.map((e, i) => (
              <motion.div
                key={e.name}
                className={`lb-entry${i < 3 ? ' lb-top' : ''}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                whileHover={{
                  x: 6,
                  background: 'rgba(255,255,255,0.04)',
                }}
              >
                <span className="lb-rank">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${e.rank}.`}
                </span>
                <span className="lb-name" style={e.color ? { textShadow: `0 0 10px ${e.color}40` } : {}}>
                  {e.name}
                </span>
                <span className="lb-score">
                  {e.score.toLocaleString()}
                </span>
              </motion.div>
            ))
          )}
        </div>

        <div className="arcade-actions">
          <motion.button
            className="btn-coin"
            disabled={fight}
            whileHover={{ scale: 1.05, boxShadow: '0 0 50px var(--red-glow), 0 0 100px rgba(230,57,70,0.2)' }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCoin}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {fight ? '▶ CREDITS ACTIVE' : '● INSERT COIN'}
          </motion.button>

          {/* Arcade instructions */}
          <motion.p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              color: 'var(--white-muted)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginTop: '0.5rem',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {fight ? 'STANDING BY...' : 'PRESS INSERT COIN TO CONTINUE'}
          </motion.p>
        </div>
      </motion.div>

      <AnimatePresence>
        {fight && (
          <motion.div
            className="fight-overlay"
            key="fight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              initial={{ scale: 3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: 'spring',
                stiffness: 150,
                damping: 12,
              }}
            >
              <div className="fight-text">ROUND 1</div>
              <div className="fight-sub">... FIGHT!</div>
            </motion.div>

            {/* Decorative particles in fight overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                overflow: 'hidden',
              }}
            >
              {Array.from({ length: 30 }, (_, i) => (
                <motion.div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    width: Math.random() * 4 + 1,
                    height: Math.random() * 4 + 1,
                    borderRadius: '50%',
                    background: `rgba(230, 57, 70, ${Math.random() * 0.5 + 0.2})`,
                  }}
                  animate={{
                    y: [0, -30 * (Math.random() + 0.5)],
                    opacity: [1, 0],
                  }}
                  transition={{
                    duration: Math.random() * 2 + 1,
                    repeat: Infinity,
                    ease: 'easeOut',
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
