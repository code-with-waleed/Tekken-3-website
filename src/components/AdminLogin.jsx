import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '../context/AudioContext';
import { login } from '../api/client';

export default function AdminLogin({ onAuthenticated }) {
  const audio = useAudio();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shaking, setShaking] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email and password are required');
      setShaking(true);
      setTimeout(() => setShaking(false), 600);
      return;
    }

    setLoading(true);
    setError('');
    try {
      await login(email, password);
      audio?.playClick?.();
      onAuthenticated();
    } catch (err) {
      audio?.playCoin?.();
      setError(err.message || 'Invalid credentials');
      setShaking(true);
      setTimeout(() => setShaking(false), 600);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <motion.div
        className={`admin-login-card${shaking ? ' shake' : ''}`}
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="admin-login-header">
          <motion.div
            className="admin-login-icon"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            🔒
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Admin Access
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Enter your credentials to access the admin panel
          </motion.p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <motion.div
            className="admin-login-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45 }}
          >
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="admin@example.com"
              autoFocus
              autoComplete="email"
              disabled={loading}
            />
          </motion.div>

          <motion.div
            className="admin-login-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={loading}
            />
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div
                className="admin-login-error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                ✗ {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            className="admin-login-btn"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : (
              <>
                <span>Authenticate</span>
                <span className="btn-arrow">→</span>
              </>
            )}
          </motion.button>
        </form>

        <div className="admin-login-footer">
          <span className="admin-login-shield">⚡ TEKKEN 3 ARCHIVE</span>
        </div>
      </motion.div>
    </div>
  );
}
