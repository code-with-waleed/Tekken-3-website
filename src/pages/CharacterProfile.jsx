import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useCharacters } from '../hooks/useCharacters';
import { useAudio } from '../context/AudioContext';

export default function CharacterProfile() {
  const { id } = useParams();
  const { characters } = useCharacters();
  const char = useMemo(() => characters.find((c) => c.id === id), [characters, id]);
  const navigate = useNavigate();
  const audio = useAudio();
  const [showLore, setShowLore] = useState(false);

  if (!char) {
    return (
      <div className="not-found">
        <motion.h1
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          404
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Fighter not found
        </motion.p>
        <motion.button
          className="btn-arcade"
          onClick={() => navigate('/roster')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Back to Roster
        </motion.button>
      </div>
    );
  }

  useEffect(() => {
    const t = setTimeout(() => setShowLore(true), 500);
    return () => clearTimeout(t);
  }, []);

  const TYPE_SPEED = 20;
  const [displayedText, setDisplayed] = useState('');
  const loreRef = useRef(null);
  const inView = useInView(loreRef, { once: true, margin: '-100px' });

  useEffect(() => {
    if (!inView || !showLore) return;
    setDisplayed('');
    let i = 0;
    const t = setInterval(() => {
      if (i < char.backstory.length) {
        setDisplayed(char.backstory.slice(0, i + 1));
        i++;
      } else clearInterval(t);
    }, TYPE_SPEED);
    return () => clearInterval(t);
  }, [inView, showLore, char.backstory]);

  const diffColor =
    char.difficulty <= 4
      ? '#2ecc71'
      : char.difficulty <= 7
      ? '#f4a261'
      : '#e63946';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="char-profile"
      style={{
        background: `linear-gradient(180deg, ${char.accentColor}12 0%, var(--black) 35%, var(--black) 100%)`,
      }}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: 'fixed',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '500px',
          height: '500px',
          background: `radial-gradient(circle, ${char.accentColor}08 0%, transparent 70%)`,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Hero */}
      <motion.div className="profile-hero" variants={itemVariants}>
        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
        >
          <span
            className="profile-glitch"
            style={{
              background: `linear-gradient(180deg, var(--white), ${char.accentColor}CC)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {char.name}
          </span>
        </motion.h1>
        <div className="profile-hud">
          <motion.div
            className="hud-item"
            whileHover={{ borderColor: char.accentColor, y: -3, boxShadow: `0 4px 20px ${char.accentColor}20` }}
            onMouseEnter={() => audio?.playHover?.()}
          >
            <span className="hud-label">Origin</span>
            <span className="hud-value">{char.origin}</span>
          </motion.div>
          <motion.div
            className="hud-item"
            whileHover={{ borderColor: char.accentColor, y: -3, boxShadow: `0 4px 20px ${char.accentColor}20` }}
            onMouseEnter={() => audio?.playHover?.()}
          >
            <span className="hud-label">Style</span>
            <span className="hud-value">{char.style}</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Difficulty */}
      <motion.div className="diff-meter" variants={itemVariants}>
        <div className="diff-label">
          <span>DIFFICULTY</span>
          <span style={{ color: diffColor }}>{char.difficulty}/10</span>
        </div>
        <div className="diff-track">
          <motion.div
            className="diff-fill"
            initial={{ width: 0 }}
            animate={{ width: `${char.difficulty * 10}%` }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ background: `linear-gradient(90deg, ${diffColor}, ${diffColor}CC)` }}
          />
        </div>
        <div className="diff-stats">
          <span>Novice</span>
          <span>Expert</span>
        </div>
      </motion.div>

      {/* Description */}
      <motion.div className="profile-lore" variants={itemVariants}>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          style={{
            textAlign: 'center',
            fontSize: '1.1rem',
            color: 'var(--white-dim)',
            maxWidth: '600px',
            margin: '0 auto',
            fontStyle: 'italic',
          }}
        >
          {char.description}
        </motion.p>
      </motion.div>

      {/* Lore */}
      <motion.div className="profile-lore" ref={loreRef} variants={itemVariants}>
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          Biography
        </motion.h2>
        <p className={showLore ? 'typewriter-cursor' : ''}>
          {displayedText}
        </p>
      </motion.div>

      {/* Traits */}
      <div className="profile-traits">
        {char.traits.map((t, i) => (
          <motion.div
            key={i}
            className="trait-tag"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            whileHover={{
              borderColor: char.accentColor,
              boxShadow: `0 0 25px ${char.accentColor}30`,
              background: `${char.accentColor}10`,
              y: -3,
            }}
          >
            {t}
          </motion.div>
        ))}
      </div>

      {/* Moves */}
      <motion.div className="profile-moves" variants={itemVariants}>
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          Move List
        </motion.h2>
        <ul className="move-list">
          {char.moves.map((m, i) => (
            <motion.li
              key={i}
              className="move-item"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              whileHover={{
                borderColor: char.accentColor,
                background: `${char.accentColor}08`,
                x: 4,
              }}
            >
              <span className="move-name">{m.name}</span>
              <span className="move-input">{m.input}</span>
              <span
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--white-muted)',
                  display: 'block',
                  marginTop: '0.15rem',
                  width: '100%',
                }}
              >
                {m.description}
              </span>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* Quote */}
      <motion.div className="profile-quote" variants={itemVariants}>
        <motion.blockquote
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          style={{
            borderLeft: `3px solid ${char.accentColor}`,
            paddingLeft: '1.5rem',
            textAlign: 'left',
          }}
        >
          {char.quote}
        </motion.blockquote>
      </motion.div>

      {/* Back */}
      <motion.div className="profile-back" variants={itemVariants}>
        <motion.button
          className="btn-arcade"
          whileHover={{ scale: 1.05, boxShadow: `0 0 40px ${char.accentColor}40` }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            navigate('/roster');
            audio.playClick();
          }}
          onMouseEnter={() => audio?.playHover?.()}
          style={{ borderColor: char.accentColor, color: char.accentColor }}
        >
          <span>&larr; Back to Roster</span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
