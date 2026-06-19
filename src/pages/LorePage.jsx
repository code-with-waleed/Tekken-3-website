import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { TIMELINE } from '../data/siteData';

function TimelineNode({ item, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <div className="timeline-node" ref={ref}>
      <motion.div
        className="timeline-dot"
        animate={{
          background: inView ? '#f4a261' : '#e63946',
          boxShadow: inView
            ? '0 0 0 12px rgba(244,162,97,0.15), 0 0 40px rgba(244,162,97,0.2)'
            : '0 0 0 0 rgba(230,57,70,0)',
          scale: inView ? 1.2 : 1,
        }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.div
        className="timeline-content"
        initial={{ opacity: 0, x: index % 2 === 0 ? 80 : -80 }}
        animate={{
          opacity: inView ? 1 : 0,
          x: inView ? 0 : index % 2 === 0 ? 80 : -80,
          y: inView ? 0 : 30,
        }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="tl-year">{item.year}</div>
        <h3>{item.title}</h3>
        <p>{item.text}</p>
      </motion.div>
    </div>
  );
}

export default function LorePage() {
  return (
    <div className="page lore-page">
      {/* Background ambient glow */}
      <div
        style={{
          position: 'fixed',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(244,162,97,0.03) 0%, transparent 70%)',
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
          The Mishima Saga
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          The history of the King of Iron Fist Tournament 3
        </motion.p>
      </div>
      <div className="timeline">
        {TIMELINE.map((item, i) => (
          <TimelineNode key={i} item={item} index={i} />
        ))}
      </div>
    </div>
  );
}
