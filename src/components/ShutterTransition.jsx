import { useEffect, useRef, useState } from 'react';
import { useLocation, Routes } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function ShutterTransition({ children }) {
  const location = useLocation();
  const [phase, setPhase] = useState('idle');
  const [renderLoc, setRenderLoc] = useState(location);
  const pending = useRef(null);

  useEffect(() => {
    if (location.pathname !== renderLoc.pathname) {
      pending.current = location;
      setPhase('closing');
    }
  }, [location.pathname]);

  const onCloseDone = () => {
    if (pending.current) {
      setRenderLoc(pending.current);
      // Small delay so the shutter doesn't open instantly
      setTimeout(() => setPhase('opening'), 30);
    }
  };

  const onOpenDone = () => setPhase('idle');

  return (
    <div style={{ position: 'relative' }}>
      <AnimatePresence mode="wait">
        {(phase === 'closing' || phase === 'opening') && (
          <motion.div
            className="shutter-overlay"
            key="shutter"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {/* Top bar: slides down from top */}
            <motion.div
              className="shutter-bar-top"
              initial={{ scaleY: 0, transformOrigin: 'top' }}
              animate={{
                scaleY: phase === 'closing' ? 1 : 0,
                transformOrigin: phase === 'closing' ? 'top' : 'top',
              }}
              onAnimationComplete={
                phase === 'closing' ? onCloseDone : onOpenDone
              }
              transition={{ duration: 0.25, ease: [0.76, 0, 0.24, 1] }}
            />
            {/* Bottom bar: slides up from bottom */}
            <motion.div
              className="shutter-bar-bottom"
              initial={{ scaleY: 0, transformOrigin: 'bottom' }}
              animate={{
                scaleY: phase === 'closing' ? 1 : 0,
                transformOrigin: phase === 'closing' ? 'bottom' : 'bottom',
              }}
              transition={{ duration: 0.25, ease: [0.76, 0, 0.24, 1] }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <div
        style={{
          opacity: phase === 'closing' ? 0 : 1,
          transition: 'opacity 0.1s ease',
        }}
      >
        <Routes location={renderLoc}>{children}</Routes>
      </div>
    </div>
  );
}
