import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCharacters } from '../hooks/useCharacters';
import { useAudio } from '../context/AudioContext';

function CharacterImage({ character, className, style }) {
  const [imgError, setImgError] = useState(false);
  const { IMG } = useCharacters();
  const hasImg = IMG[character.id] && !imgError;

  if (hasImg) {
    return (
      <img
        src={IMG[character.id]}
        alt={character.name}
        className={className}
        style={style}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className={className ? `${className} fallback-char` : 'fallback-char'}
      style={{
        ...style,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${character.accentColor}30, ${character.accentColor}08)`,
        border: `2px solid ${character.accentColor}40`,
        borderRadius: '12px',
        fontSize: '3rem',
        fontWeight: 900,
        fontFamily: 'var(--font-header)',
        color: character.accentColor,
        textShadow: `0 0 30px ${character.accentColor}60`,
      }}
    >
      {character.name.charAt(0)}
    </div>
  );
}

function HeroCharacterSelector({ activeIdx, setActiveIdx, featured }) {
  const audio = useAudio();

  return (
    <div className="hero-char-select">
      {featured.map((c, i) => (
        <motion.button
          key={c.id}
          className={`hero-char-btn${i === activeIdx ? ' active' : ''}`}
          onClick={() => {
            setActiveIdx(i);
            audio?.playSelect?.();
          }}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          style={{
            '--accent': c.accentColor,
          }}
        >
          <span className="char-btn-dot" />
          <span className="char-btn-label">{c.name.split(' ')[0]}</span>
        </motion.button>
      ))}
    </div>
  );
}

function StatsSection({ characterCount }) {
  const stats = [
    { value: String(characterCount || 23), label: 'Fighters', accent: 'var(--red)' },
    { value: '∞', label: 'Combos', accent: 'var(--gold)' },
    { value: '1997', label: 'Released', accent: 'var(--cyan)' },
    { value: '#1', label: 'Arcade Game', accent: 'var(--red)' },
  ];

  return (
    <motion.section
      className="home-stats"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="stats-grid">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            style={{ '--stat-accent': s.accent }}
          >
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

function FeaturedGrid({ fighters }) {
  const navigate = useNavigate();
  const audio = useAudio();

  return (
    <motion.section
      className="home-fighters-section"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6 }}
    >
      <div className="section-header">
        <span className="section-tag">Select Your Fighter</span>
        <h2 className="section-title">The Roster</h2>
        <div className="section-line" />
      </div>

      <div className="fighters-grid">
        {fighters.map((c, i) => (
          <motion.div
            key={c.id}
            className="fighter-grid-card"
            onClick={() => {
              navigate(`/character/${c.id}`);
              audio?.playClick?.();
            }}
            whileHover={{ y: -8, scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            onMouseEnter={() => audio?.playHover?.()}
            style={{ '--card-accent': c.accentColor }}
          >
            <div className="fgc-image-wrap">
              <CharacterImage character={c} className="fgc-image" />
              <div className="fgc-shine" />
            </div>
            <div className="fgc-info">
              <h3 className="fgc-name">{c.name}</h3>
              <span className="fgc-style">{c.style}</span>
            </div>
            <div className="fgc-accent-bar" />
          </motion.div>
        ))}
      </div>

      <motion.div
        className="section-cta"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
      >
        <motion.button
          className="btn-view-all"
          onClick={() => {
            navigate('/roster');
            audio?.playClick?.();
          }}
          whileHover={{ scale: 1.05, y: -3 }}
          whileTap={{ scale: 0.95 }}
          onMouseEnter={() => audio?.playHover?.()}
        >
          <span>View All Fighters</span>
          <span className="btn-arrow">→</span>
        </motion.button>
      </motion.div>
    </motion.section>
  );
}

function LorePreview() {
  const navigate = useNavigate();
  const audio = useAudio();

  return (
    <motion.section
      className="home-lore-preview"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7 }}
    >
      <div className="lore-preview-inner">
        <div className="lore-preview-text">
          <span className="section-tag">The Story</span>
          <h2 className="lore-title">The Mishima Saga</h2>
          <p className="lore-desc">
            The King of Iron Fist Tournament 3. An ancient god awakens. 
            The Mishima bloodline faces its darkest chapter. 
            Twenty-three warriors. One ultimate prize. 
            The fate of the world hangs in the balance.
          </p>
          <motion.button
            className="btn-lore"
            onClick={() => {
              navigate('/lore');
              audio?.playClick?.();
            }}
            whileHover={{ scale: 1.05, x: 5 }}
            whileTap={{ scale: 0.95 }}
            onMouseEnter={() => audio?.playHover?.()}
          >
            <span>Explore the Lore</span>
            <span className="btn-arrow">→</span>
          </motion.button>
        </div>
        <div className="lore-preview-visual">
          <div className="lore-timeline-peek">
            {['Ancient Times', '1996', '1997', 'Final Battle'].map((year, i) => (
              <motion.div
                key={year}
                className="lore-peek-item"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                <div className="lore-peek-dot" />
                <span className="lore-peek-year">{year}</span>
              </motion.div>
            ))}
            <div className="lore-peek-line" />
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function QuickLinks() {
  const navigate = useNavigate();
  const audio = useAudio();

  const links = [
    { to: '/roster', label: 'Enter the Roster', desc: '23 unique fighters', icon: '◈' },
    { to: '/lore', label: 'The Mishima Saga', desc: 'The complete timeline', icon: '◇' },
    { to: '/arcade', label: 'Arcade Mode', desc: 'Test your skills', icon: '▣' },
  ];

  return (
    <motion.div
      className="home-links"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {links.map((link, i) => (
        <motion.div
          key={link.to}
          className="quick-link"
          onClick={() => {
            navigate(link.to);
            audio.playClick();
          }}
          whileHover={{ scale: 1.04, y: -5 }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 + i * 0.1 }}
          onMouseEnter={() => audio?.playHover?.()}
        >
          <span className="ql-icon">{link.icon}</span>
          <div className="ql-text">
            <span className="ql-label">{link.label}</span>
            <span className="ql-desc">{link.desc}</span>
          </div>
          <span className="ql-arrow">→</span>
        </motion.div>
      ))}
    </motion.div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const audio = useAudio();
  const { characters } = useCharacters();
  const [heroIdx, setHeroIdx] = useState(0);

  const FEATURED = useMemo(() => {
    const find = (id) => characters.find((c) => c.id === id);
    return [
      find('jin'), find('hwoarang'), find('nina'),
      find('paul'), find('yoshimitsu'), find('heihachi'),
    ].filter(Boolean);
  }, [characters]);

  const HIGHLIGHT_FIGHTERS = useMemo(() => characters.slice(0, 12), [characters]);
  const safeIdx = FEATURED.length > 0 ? heroIdx % FEATURED.length : 0;
  const heroChar = FEATURED[safeIdx] || FEATURED[0] || characters[0];

  useEffect(() => {
    // Clamp heroIdx if FEATURED shrank (admin deleted characters)
    setHeroIdx((i) => (i >= FEATURED.length ? 0 : i));
  }, [FEATURED.length]);

  useEffect(() => {
    if (FEATURED.length === 0) return;
    const t = setInterval(() => {
      setHeroIdx((i) => (i + 1) % FEATURED.length);
    }, 6000);
    return () => clearInterval(t);
  }, [FEATURED.length]);

  const navigateTo = useCallback(
    (to) => {
      navigate(to);
      audio.playClick();
    },
    [navigate, audio]
  );

  return (
    <div className="home-page">
      {/* ══════ HERO SECTION ══════ */}
      <section className="hero-section">
        <div className="hero-container">
          {/* Left: Text Content */}
          <div className="hero-content">
            <motion.div
              className="hero-badge"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span className="badge-dot" />
              The King of Iron Fist Tournament 3
            </motion.div>

            <motion.h1
              className="hero-title"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="hero-title-main">Choose</span>
              <span className="hero-title-main">Your</span>
              <span className="hero-title-accent">Fighter.</span>
            </motion.h1>

            <motion.p
              className="hero-description"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Twenty-three warriors from across the globe. One ultimate prize.
              Master devastating combos, unlock hidden techniques, and claim
              your place in fighting game history.
            </motion.p>

            <motion.div
              className="hero-actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <motion.button
                className="hero-btn primary"
                onClick={() => navigateTo('/roster')}
                whileHover={{ scale: 1.05, boxShadow: '0 0 40px var(--red-glow)' }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={() => audio?.playHover?.()}
              >
                <span>Explore Roster</span>
                <span className="btn-arrow">→</span>
              </motion.button>
              <motion.button
                className="hero-btn secondary"
                onClick={() => navigateTo('/arcade')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={() => audio?.playHover?.()}
              >
                <span>Play Arcade</span>
              </motion.button>
            </motion.div>

            <HeroCharacterSelector activeIdx={safeIdx} setActiveIdx={setHeroIdx} featured={FEATURED} />
          </div>

          {/* Right: Character Display */}
          <div className="hero-visual">
            {heroChar && (
              <motion.div
                className="hero-character-frame"
                key={heroChar.id}
                initial={{ opacity: 0, scale: 0.9, x: 40 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: -40 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Glow backdrop */}
                <div
                  className="hero-glow"
                  style={{
                    background: `radial-gradient(ellipse at center, ${heroChar.accentColor}20 0%, transparent 70%)`,
                  }}
                />

                {/* Character image */}
                <div className="hero-img-container">
                  <CharacterImage
                    character={heroChar}
                    className="hero-character-img"
                  />
                  <div className="hero-img-shadow" />
                </div>

                {/* Character info overlay */}
                <div className="hero-char-info">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={heroChar.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <span className="hci-name" style={{ color: heroChar.accentColor }}>
                        {heroChar.name}
                      </span>
                      <span className="hci-detail">
                        {heroChar.origin} • {heroChar.style}
                      </span>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Decorative corners */}
                <div className="frame-corner tl" />
                <div className="frame-corner tr" />
                <div className="frame-corner bl" />
                <div className="frame-corner br" />
              </motion.div>
            )}

            {/* Ambient particles around character */}
            <div className="hero-particles">
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="hero-particle"
                  animate={{
                    y: [0, -30 - i * 10, 0],
                    x: [0, (i % 2 ? 15 : -15), 0],
                    opacity: [0.2, 0.6, 0.2],
                  }}
                  transition={{
                    duration: 4 + i,
                    repeat: Infinity,
                    delay: i * 0.5,
                    ease: 'easeInOut',
                  }}
                  style={{
                    left: `${15 + i * 14}%`,
                    top: `${30 + (i % 3) * 20}%`,
                    background: heroChar?.accentColor || 'var(--red)',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Decorative divider */}
        <motion.div
          className="hero-divider"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        />
      </section>

      {/* ══════ STATS SECTION ══════ */}
      <StatsSection characterCount={characters.length} />

      {/* ══════ FEATURED FIGHTERS GRID ══════ */}
      <FeaturedGrid fighters={HIGHLIGHT_FIGHTERS} />

      {/* ══════ LORE PREVIEW ══════ */}
      <LorePreview />

      {/* ══════ QUICK LINKS ══════ */}
      <QuickLinks />
    </div>
  );
}
