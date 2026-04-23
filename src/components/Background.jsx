import { useRef, useEffect } from 'react';

const HIEROGLYPHS = ['𓂀', '𓆣', '𓁹', '𓋹', '𓊹', '𓇳', '𓆃', '𓃭', '𓅓', '𓊖', '𓈖', '𓏏', '𓇯', '𓂻'];

export default function Background({ mode = 'particles', goldIntensity = 70 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (mode === 'clean') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;

    const resize = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    const count = mode === 'hieroglyphs' ? 28 : 90;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.2,
        vy: -Math.random() * 0.3 - 0.05,
        size: mode === 'hieroglyphs' ? 14 + Math.random() * 20 : 1 + Math.random() * 2,
        life: Math.random(),
        glyph: HIEROGLYPHS[Math.floor(Math.random() * HIEROGLYPHS.length)],
        rot: Math.random() * Math.PI * 2,
      });
    }

    const alphaBase = goldIntensity / 100;

    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.life += 0.002;
        if (p.y < -50 || p.life > 1) {
          p.x = Math.random() * window.innerWidth;
          p.y = window.innerHeight + 20;
          p.life = 0;
        }
        const alpha = Math.sin(p.life * Math.PI) * 0.6 * alphaBase;
        if (mode === 'hieroglyphs') {
          ctx.fillStyle = `rgba(212, 165, 55, ${alpha * 0.35})`;
          ctx.font = `${p.size}px serif`;
          ctx.fillText(p.glyph, p.x, p.y);
        } else {
          ctx.fillStyle = `rgba(240, 200, 96, ${alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          if (p.size > 2) {
            ctx.fillStyle = `rgba(240, 200, 96, ${alpha * 0.15})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [mode, goldIntensity]);

  return <canvas ref={canvasRef} className="bg-canvas" />;
}
