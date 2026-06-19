import { motion } from 'framer-motion';
import { useRef } from 'react';
import { useMotionValue, useTransform } from 'framer-motion';
import { IMG } from '../data/characters';
import { useAudio } from '../context/AudioContext';

export default function CharacterCard({ char, onClick, index = 0 }) {
  const tiltRef = useRef(null);
  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const audio = useAudio();

  const tilt = (e) => {
    const el = tiltRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mvX.set(((e.clientX - r.left) / r.width - 0.5) * 20);
    mvY.set(-((e.clientY - r.top) / r.height - 0.5) * 20);
  };

  const reset = () => {
    mvX.set(0);
    mvY.set(0);
  };

  const cardRotX = useTransform(mvY, (v) => v);
  const cardRotY = useTransform(mvX, (v) => v);
  const hasImage = !!IMG[char.id];

  return (
    <motion.div
      className="character-card"
      ref={tiltRef}
      onMouseMove={tilt}
      onMouseLeave={reset}
      onMouseEnter={() => audio?.playHover?.()}
      onClick={() => {
        onClick?.();
        audio?.playSelect?.();
      }}
      style={{
        rotateX: cardRotX,
        rotateY: cardRotY,
        perspective: 800,
      }}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.03 }}
      whileHover={{
        borderColor: char.accentColor,
        y: -8,
        scale: 1.02,
        boxShadow: `0 20px 50px rgba(0,0,0,0.4), 0 0 30px ${char.accentColor}20`,
      }}
    >
      <div className="card-holo" />
      {/* Glow effect on hover */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '14px',
          background: `radial-gradient(circle at 50% 0%, ${char.accentColor}08, transparent 70%)`,
          opacity: 0,
          transition: 'opacity 0.4s ease',
          pointerEvents: 'none',
        }}
        className="card-glow"
      />
      <div
        style={{
          position: 'relative',
          width: 110,
          height: 135,
          margin: '0 auto 0.8rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {hasImage ? (
          <img
            src={IMG[char.id]}
            alt={char.name}
            className="char-card-img"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none';
              if (e.target.nextElementSibling)
                e.target.nextElementSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className="char-card-placeholder"
          style={{
            display: hasImage ? 'none' : 'flex',
            background: `linear-gradient(135deg, ${char.accentColor}25, ${char.accentColor}08)`,
            borderColor: char.accentColor,
          }}
        >
          {char.name.charAt(0)}
        </div>
      </div>
      <h3>{char.name}</h3>
      <div className="char-style">{char.style}</div>
      <div className="char-diff">
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            className={`diff-dot${i < char.difficulty ? ' filled' : ''}${
              i < char.difficulty && char.difficulty > 7 ? ' gold' : ''
            }${i < char.difficulty && char.difficulty > 8 ? ' cyan' : ''}`}
          />
        ))}
      </div>
    </motion.div>
  );
}
