import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '../context/AudioContext';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const audio = useAudio();
  const location = useLocation();
  const isAdmin = location.pathname === '/admin';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { to: '/', label: 'Home', icon: '⬡' },
    { to: '/roster', label: 'Roster', icon: '◈' },
    { to: '/lore', label: 'Lore', icon: '◇' },
    { to: '/arcade', label: 'Arcade', icon: '▣' },
  ];

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}${isAdmin ? ' admin-nav' : ''}`}>
      <motion.div
        className="nav-brand"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <span className="brand-icon">⚡</span>
        <span className="brand-text">TEKKEN</span>
        <span className="brand-number">3</span>
        <span className="brand-dot" />
      </motion.div>

      <div className={`nav-links${open ? ' open' : ''}`}>
        {links.map((l, i) => (
          <motion.div
            key={l.to}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
          >
            <NavLink
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={() => {
                setOpen(false);
                if (!audio.muted) audio.playClick();
              }}
              onMouseEnter={() => audio?.playHover?.()}
            >
              <span className="nav-icon">{l.icon}</span>
              <span className="nav-label">{l.label}</span>
              <span className="nav-glow" />
            </NavLink>
          </motion.div>
        ))}


      </div>

      <motion.button
        className="nav-toggle"
        onClick={() => {
          setOpen((o) => !o);
          audio?.playClick?.();
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <span className={`hamburger${open ? ' open' : ''}`}>
          <span />
          <span />
          <span />
        </span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="nav-mobile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </nav>
  );
}
