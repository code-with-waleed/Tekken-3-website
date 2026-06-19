import { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react';

const AudioCtx = createContext(null);

export function AudioProvider({ children }) {
  const ctxRef = useRef(null);
  const droneRef = useRef(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    try {
      const aCtx = new (window.AudioContext || window.webkitAudioContext)();
      ctxRef.current = aCtx;
      const osc = aCtx.createOscillator();
      const gain = aCtx.createGain();
      gain.gain.value = 1.5;
      osc.type = 'sawtooth';
      osc.frequency.value = 35;
      const osc2 = aCtx.createOscillator();
      const gain2 = aCtx.createGain();
      gain2.gain.value = 0.8;
      osc2.type = 'sine';
      osc2.frequency.value = 52;
      const lpf = aCtx.createBiquadFilter();
      lpf.type = 'lowpass';
      lpf.frequency.value = 120;
      const masterGain = aCtx.createGain();
      masterGain.gain.value = 0;
      osc.connect(gain);
      gain.connect(lpf);
      osc2.connect(gain2);
      gain2.connect(lpf);
      lpf.connect(masterGain);
      masterGain.connect(aCtx.destination);
      osc.start();
      osc2.start();
      droneRef.current = { masterGain, osc, gain, osc2, gain2, lpf };
      if (!muted) masterGain.gain.value = 0.08;
    } catch (e) {
      console.log('Audio unavailable');
    }
    return () => {
      try {
        droneRef.current?.osc?.stop();
        droneRef.current?.osc2?.stop();
        ctxRef.current?.close();
      } catch (e) {}
    };
  }, []);

  useEffect(() => {
    if (droneRef.current) {
      droneRef.current.masterGain.gain.setTargetAtTime(
        muted ? 0 : 0.1,
        ctxRef.current?.currentTime || 0,
        0.3
      );
    }
  }, [muted]);

  const toggle = useCallback(() => setMuted((m) => !m), []);

  const playClick = useCallback(() => {
    if (muted || !ctxRef.current) return;
    try {
      const osc = ctxRef.current.createOscillator();
      const gain = ctxRef.current.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, ctxRef.current.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctxRef.current.currentTime + 0.04);
      gain.gain.setValueAtTime(0.06, ctxRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctxRef.current.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(ctxRef.current.destination);
      osc.start();
      osc.stop(ctxRef.current.currentTime + 0.06);
    } catch (e) {}
  }, [muted]);

  const playHover = useCallback(() => {
    if (muted || !ctxRef.current) return;
    try {
      const osc = ctxRef.current.createOscillator();
      const gain = ctxRef.current.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ctxRef.current.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctxRef.current.currentTime + 0.03);
      gain.gain.setValueAtTime(0.02, ctxRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctxRef.current.currentTime + 0.03);
      osc.connect(gain);
      gain.connect(ctxRef.current.destination);
      osc.start();
      osc.stop(ctxRef.current.currentTime + 0.03);
    } catch (e) {}
  }, [muted]);

  const playCoin = useCallback(() => {
    if (muted || !ctxRef.current) return;
    try {
      const osc = ctxRef.current.createOscillator();
      const gain = ctxRef.current.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctxRef.current.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctxRef.current.currentTime + 0.1);
      osc.frequency.exponentialRampToValueAtTime(1200, ctxRef.current.currentTime + 0.2);
      osc.frequency.exponentialRampToValueAtTime(600, ctxRef.current.currentTime + 0.35);
      gain.gain.setValueAtTime(0.08, ctxRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctxRef.current.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctxRef.current.destination);
      osc.start();
      osc.stop(ctxRef.current.currentTime + 0.4);
    } catch (e) {}
  }, [muted]);

  const playSelect = useCallback(() => {
    if (muted || !ctxRef.current) return;
    try {
      const osc = ctxRef.current.createOscillator();
      const gain = ctxRef.current.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, ctxRef.current.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, ctxRef.current.currentTime + 0.08);
      gain.gain.setValueAtTime(0.05, ctxRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctxRef.current.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctxRef.current.destination);
      osc.start();
      osc.stop(ctxRef.current.currentTime + 0.12);
    } catch (e) {}
  }, [muted]);

  const playFight = useCallback(() => {
    if (muted || !ctxRef.current) return;
    try {
      // Low rumble
      const osc1 = ctxRef.current.createOscillator();
      const gain1 = ctxRef.current.createGain();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(60, ctxRef.current.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(30, ctxRef.current.currentTime + 0.5);
      gain1.gain.setValueAtTime(0.08, ctxRef.current.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctxRef.current.currentTime + 0.5);
      osc1.connect(gain1);
      gain1.connect(ctxRef.current.destination);
      osc1.start();
      osc1.stop(ctxRef.current.currentTime + 0.5);

      // High impact
      const osc2 = ctxRef.current.createOscillator();
      const gain2 = ctxRef.current.createGain();
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(200, ctxRef.current.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(40, ctxRef.current.currentTime + 0.3);
      gain2.gain.setValueAtTime(0.06, ctxRef.current.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctxRef.current.currentTime + 0.3);
      osc2.connect(gain2);
      gain2.connect(ctxRef.current.destination);
      osc2.start();
      osc2.stop(ctxRef.current.currentTime + 0.3);

      // Bell-like strike
      const osc3 = ctxRef.current.createOscillator();
      const gain3 = ctxRef.current.createGain();
      osc3.type = 'triangle';
      osc3.frequency.setValueAtTime(400, ctxRef.current.currentTime + 0.1);
      osc3.frequency.exponentialRampToValueAtTime(800, ctxRef.current.currentTime + 0.2);
      gain3.gain.setValueAtTime(0.05, ctxRef.current.currentTime + 0.1);
      gain3.gain.exponentialRampToValueAtTime(0.001, ctxRef.current.currentTime + 0.4);
      osc3.connect(gain3);
      gain3.connect(ctxRef.current.destination);
      osc3.start();
      osc3.stop(ctxRef.current.currentTime + 0.4);
    } catch (e) {}
  }, [muted]);

  return (
    <AudioCtx.Provider value={{ muted, toggle, playClick, playHover, playCoin, playSelect, playFight }}>
      {children}
    </AudioCtx.Provider>
  );
}

export function useAudio() {
  return useContext(AudioCtx);
}
