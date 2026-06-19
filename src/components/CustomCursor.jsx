import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const HOVER_SELECTOR = 'a,button,input,[role="button"],[tabindex],.quick-link,.character-card,.filter-pill,.trait-tag,.btn-arcade,.btn-coin,.featured-card,.nav-brand,.nav-links a,.hero-char-btn,.fighter-grid-card,.stat-card,.hero-btn,.btn-view-all,.btn-lore,.nav-toggle';

export default function CustomCursor() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const hoverCountRef = useRef(0);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const cursorScale = useMotionValue(1);
  const cursorOpacity = useMotionValue(1);

  // Snappy spring for tight cursor following
  const springConfig = { stiffness: 1500, damping: 32, mass: 0.2 };
  const springX = useSpring(cursorX, springConfig);
  const springY = useSpring(cursorY, springConfig);

  // Detect touch devices on mount
  useEffect(() => {
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(hasTouch);
    if (hasTouch) {
      cursorOpacity.set(0);
    }
  }, []);

  // Event delegation approach — works with dynamically added elements
  useEffect(() => {
    if (isTouchDevice) return;

    const move = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const onEnter = () => cursorOpacity.set(1);
    const onLeave = () => cursorOpacity.set(0);

    const onMouseOver = (e) => {
      const target = e.target.closest(HOVER_SELECTOR);
      if (target) {
        hoverCountRef.current++;
        setIsHovering(true);
      }
    };

    const onMouseOut = (e) => {
      const target = e.target.closest(HOVER_SELECTOR);
      if (target) {
        hoverCountRef.current--;
        if (hoverCountRef.current <= 0) {
          hoverCountRef.current = 0;
          setIsHovering(false);
        }
      }
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);

    // Hide cursor when it leaves the window
    const onMouseMoveGlobal = (e) => {
      const atEdge = e.clientX <= 0 || e.clientY <= 0 || 
        e.clientX >= window.innerWidth - 1 || e.clientY >= window.innerHeight - 1;
      setIsHidden(atEdge);
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseenter', onEnter);
    window.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseover', onMouseOver, true);
    document.addEventListener('mouseout', onMouseOut, true);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mousemove', onMouseMoveGlobal);

    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseenter', onEnter);
      window.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseover', onMouseOver, true);
      document.removeEventListener('mouseout', onMouseOut, true);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mousemove', onMouseMoveGlobal);
    };
  }, [isTouchDevice]);

  // Animate scale based on hover/click state
  useEffect(() => {
    if (isClicking) {
      cursorScale.set(0.7);
    } else if (isHovering) {
      cursorScale.set(1.6);
    } else {
      cursorScale.set(1);
    }
  }, [isHovering, isClicking]);

  // Don't render anything on touch devices
  if (isTouchDevice) return null;

  const outerSize = isHovering ? 48 : 36;
  const ringBorder = isHovering ? '1.5px solid rgba(230,57,70,0.35)' : '1px solid rgba(230,57,70,0.2)';
  const ringGlow = isHovering 
    ? '0 0 20px rgba(230,57,70,0.3), inset 0 0 15px rgba(230,57,70,0.08)' 
    : '0 0 8px rgba(230,57,70,0.15), inset 0 0 8px transparent';

  return (
    <>
      {/* Outer ring / cursor halo */}
      <motion.div
        style={{
          x: springX,
          y: springY,
          opacity: isHidden ? 0 : cursorOpacity,
          position: 'fixed',
          left: 0,
          top: 0,
          pointerEvents: 'none',
          zIndex: 99998,
          width: outerSize,
          height: outerSize,
          transform: 'translate(-50%, -50%)',
          transition: 'width 0.25s cubic-bezier(0.34,1.56,0.64,1), height 0.25s cubic-bezier(0.34,1.56,0.64,1), border 0.2s ease, box-shadow 0.2s ease',
          border: ringBorder,
          borderRadius: '50%',
          background: isHovering 
            ? 'radial-gradient(circle, rgba(230,57,70,0.06) 0%, transparent 70%)' 
            : 'radial-gradient(circle, rgba(230,57,70,0.04) 0%, transparent 70%)',
          boxShadow: ringGlow,
          mixBlendMode: 'difference',
        }}
      />

      {/* Inner crosshair dot */}
      <motion.div
        id="custom-cursor"
        style={{
          x: springX,
          y: springY,
          scale: cursorScale,
          opacity: isHidden ? 0 : cursorOpacity,
          position: 'fixed',
          left: 0,
          top: 0,
          pointerEvents: 'none',
          zIndex: 99999,
          width: 20,
          height: 20,
          mixBlendMode: 'difference',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="crosshair">
          <div className="crosshair-ring" />
        </div>
      </motion.div>

      {/* Trail particle effect on hover */}
      {isHovering && (
        <motion.div
          style={{
            x: springX,
            y: springY,
            opacity: 0.15,
            position: 'fixed',
            left: 0,
            top: 0,
            pointerEvents: 'none',
            zIndex: 99997,
            width: 60,
            height: 60,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(230,57,70,0.2) 0%, transparent 70%)',
            filter: 'blur(8px)',
            transition: 'opacity 0.3s ease',
          }}
        />
      )}
    </>
  );
}
