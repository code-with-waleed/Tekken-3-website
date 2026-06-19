import { useEffect, useRef } from 'react';

export default function GlobalBackground() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let particles = [];
    let stars = [];
    let embers = [];
    let gridLines = [];
    let lightning = [];
    let lightningFlash = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
      initStars();
      initEmbers();
      initGrid();
    };

    function initParticles() {
      particles = [];
      const count = Math.min(100, Math.floor((canvas.width * canvas.height) / 12000));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: -(Math.random() * 0.8 + 0.3),
          size: Math.random() * 2.5 + 0.5,
          alpha: Math.random() * 0.5 + 0.15,
          life: Math.random() * 1,
        });
      }
    }

    function initStars() {
      stars = [];
      const count = Math.min(150, Math.floor((canvas.width * canvas.height) / 8000));
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.5 + 0.3,
          alpha: Math.random() * 0.5 + 0.1,
          twinkleSpeed: Math.random() * 3 + 1,
          twinklePhase: Math.random() * Math.PI * 2,
        });
      }
    }

    function initEmbers() {
      embers = [];
      const count = Math.min(25, Math.floor((canvas.width * canvas.height) / 40000));
      for (let i = 0; i < count; i++) {
        embers.push({
          x: Math.random() * canvas.width,
          y: canvas.height + Math.random() * 100,
          vx: (Math.random() - 0.5) * 0.6,
          vy: -(Math.random() * 0.5 + 0.2),
          size: Math.random() * 4 + 2,
          alpha: Math.random() * 0.3 + 0.1,
          life: Math.random() * 1,
        });
      }
    }

    function initGrid() {
      gridLines = [];
      const w = canvas.width, h = canvas.height;
      const cx = w / 2, cy = h / 2 + 100;
      const perspective = 0.08;
      for (let i = -30; i <= 30; i++) {
        if (Math.random() > 0.35) continue;
        gridLines.push({
          type: 'v',
          x1: cx + i * 35,
          y1: cy + 180,
          x2: cx + i * 10 + (Math.random() - 0.5) * 20,
          y2: cy - 400,
          alpha: Math.random() * 0.03 + 0.01,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.5 + 0.3,
        });
      }
      for (let j = 0; j < 22; j++) {
        if (Math.random() > 0.4) continue;
        const yy = cy + 180 - j * 30;
        const spread = (j + 1) * 35;
        gridLines.push({
          type: 'h',
          x1: cx - spread + (Math.random() - 0.5) * 30,
          y1: yy,
          x2: cx + spread + (Math.random() - 0.5) * 30,
          y2: yy,
          alpha: Math.random() * 0.03 + 0.01,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.5 + 0.3,
        });
      }
    }

    function drawGrid(time) {
      gridLines.forEach((g) => {
        const pulse = Math.sin(time * 0.001 * g.speed + g.phase) * 0.5 + 0.5;
        ctx.strokeStyle = `rgba(255,255,255,${g.alpha * pulse})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(g.x1, g.y1);
        ctx.lineTo(g.x2, g.y2);
        ctx.stroke();
      });
    }

    function drawStars(time) {
      stars.forEach((s) => {
        const twinkle = Math.sin(time * 0.001 * s.twinkleSpeed + s.twinklePhase) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(255,255,255,${s.alpha * twinkle})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function drawParticles() {
      particles.forEach((p) => {
        p.x += p.vx + Math.sin(p.life * 20) * 0.2;
        p.y += p.vy;
        p.life += 0.004;
        if (p.life > 1 || p.y < -10 || p.x < -10 || p.x > canvas.width + 10) {
          p.x = Math.random() * canvas.width;
          p.y = canvas.height + 10;
          p.life = 0;
        }
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 5);
        const alpha = p.alpha * (1 - p.life) * (0.8 + Math.sin(p.life * 30) * 0.2);
        gradient.addColorStop(0, `rgba(230,57,70,${alpha})`);
        gradient.addColorStop(0.3, `rgba(244,162,97,${alpha * 0.6})`);
        gradient.addColorStop(0.6, `rgba(0,240,255,${alpha * 0.2})`);
        gradient.addColorStop(1, `rgba(230,57,70,0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 5, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function drawEmbers(time) {
      embers.forEach((e) => {
        e.x += e.vx + Math.sin(time * 0.002 + e.life * 15) * 0.4;
        e.y += e.vy + Math.cos(time * 0.001 + e.life * 10) * 0.2;
        e.life += 0.005;
        if (e.life > 1 || e.y < -20) {
          e.x = Math.random() * canvas.width;
          e.y = canvas.height + Math.random() * 50;
          e.life = 0;
        }
        const alpha = e.alpha * (1 - e.life) * (0.7 + Math.sin(e.life * 25) * 0.3);
        const gradient = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.size * 3);
        gradient.addColorStop(0, `rgba(230,57,70,${alpha * 0.8})`);
        gradient.addColorStop(0.4, `rgba(244,162,97,${alpha * 0.4})`);
        gradient.addColorStop(1, `rgba(230,57,70,0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size * 3, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function drawLightning(time) {
      if (Math.random() < 0.002) {
        lightningFlash = 0.08;
        const startX = Math.random() * canvas.width;
        const startY = 0;
        const points = [{ x: startX, y: startY }];
        let x = startX, y = startY;
        for (let i = 0; i < 8; i++) {
          x += (Math.random() - 0.5) * 60;
          y += 40 + Math.random() * 60;
          points.push({ x, y });
        }
        lightning = points;
      }

      if (lightningFlash > 0) {
        ctx.fillStyle = `rgba(200, 220, 255, ${lightningFlash * 0.03})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = `rgba(200, 220, 255, ${lightningFlash * 0.8})`;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = 'rgba(200, 220, 255, 0.3)';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.moveTo(lightning[0]?.x || 0, lightning[0]?.y || 0);
        for (let i = 1; i < lightning.length; i++) {
          ctx.lineTo(lightning[i].x, lightning[i].y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        lightningFlash -= 0.008;
      }
    }

    function animate(time) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Subtle gradient background
      const bgGrad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height * 0.3, 0,
        canvas.width / 2, canvas.height * 0.3, canvas.height * 0.8
      );
      bgGrad.addColorStop(0, 'rgba(15, 10, 15, 1)');
      bgGrad.addColorStop(0.5, 'rgba(8, 5, 10, 1)');
      bgGrad.addColorStop(1, 'rgba(5, 5, 5, 1)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawGrid(time);
      drawStars(time);
      drawLightning(time);
      drawEmbers(time);
      drawParticles();
      animId = requestAnimationFrame(animate);
    }

    resize();
    animate(0);
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas id="bg-canvas" ref={ref} />;
}
