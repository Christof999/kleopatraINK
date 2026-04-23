import { useRef, useEffect, useState } from 'react';
import kleopatraImg from '../assets/kleopatra.png';

export default function KleopatraHead({ style = 'classic', goldIntensity = 70 }) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [smoothed, setSmoothed] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e) => {
      setMouse({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useEffect(() => {
    let raf;
    const tick = () => {
      setSmoothed((s) => ({
        x: s.x + (mouse.x - s.x) * 0.07,
        y: s.y + (mouse.y - s.y) * 0.07,
      }));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mouse]);

  const filters = {
    classic: 'contrast(1.08) saturate(1.05) brightness(0.98)',
    faceted: 'contrast(1.15) saturate(0.85) brightness(0.95) sepia(0.15)',
    smooth:  'contrast(1.02) saturate(1.15) brightness(1.02) blur(0.3px)',
  };

  const goldGlow = 0.2 + (goldIntensity / 100) * 0.5;

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'grid', placeItems: 'center',
      perspective: '1400px',
      perspectiveOrigin: '50% 45%',
      position: 'relative',
    }}>
      {/* Ambient gold aura */}
      <div style={{
        position: 'absolute',
        inset: '-8%',
        background: `radial-gradient(circle at ${50 + smoothed.x * 8}% ${42 + smoothed.y * 6}%, rgba(240,200,96,${goldGlow}) 0%, rgba(212,165,55,${goldGlow * 0.4}) 25%, transparent 55%)`,
        filter: 'blur(20px)',
        pointerEvents: 'none',
        transform: `translate3d(${smoothed.x * 4}px, ${smoothed.y * 3}px, 0)`,
      }} />

      {/* Main photo with 3D parallax */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        transform: `
          translate3d(${smoothed.x * 10}px, ${smoothed.y * 6}px, 0)
          rotateY(${smoothed.x * 9}deg)
          rotateX(${-smoothed.y * 6}deg)
        `,
        transformStyle: 'preserve-3d',
        transition: 'transform 50ms linear',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          overflow: 'hidden',
          boxShadow: `
            inset 0 0 60px 10px rgba(10,8,6,0.95),
            inset 0 0 120px 20px rgba(10,8,6,0.7),
            0 0 80px rgba(240,200,96,${goldGlow * 0.5})
          `,
        }}>
          <img
            src={kleopatraImg}
            alt="Kleopatra"
            style={{
              width: '120%',
              height: '120%',
              objectFit: 'cover',
              objectPosition: `${50 - smoothed.x * 3}% ${38 - smoothed.y * 2}%`,
              position: 'absolute',
              left: '-10%',
              top: '-10%',
              filter: filters[style] || filters.classic,
              transition: 'object-position 80ms linear, filter 400ms',
            }}
          />

          {/* Gold overlay tint */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 50% 35%, rgba(240,200,96,0.08), transparent 60%)',
            mixBlendMode: 'overlay',
            opacity: goldIntensity / 100,
            pointerEvents: 'none',
          }} />

          {/* Dark vignette ring */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 50% 45%, transparent 45%, rgba(10,8,6,0.4) 65%, rgba(10,8,6,0.95) 85%, rgba(10,8,6,1) 100%)',
            pointerEvents: 'none',
          }} />
        </div>

        {/* Floating sparkle layer */}
        <div style={{
          position: 'absolute',
          inset: 0,
          transform: `translate3d(${smoothed.x * 20}px, ${smoothed.y * 14}px, 0)`,
          pointerEvents: 'none',
        }}>
          <svg viewBox="0 0 400 400" style={{ width: '100%', height: '100%' }}>
            {[[60,80,1.5],[340,120,1.2],[80,320,1.8],[330,340,1.3],[200,40,1],[370,220,1.4],[30,200,1.1]].map(([x,y,r], i) => (
              <circle key={i} cx={x} cy={y} r={r} fill="#f0c860"
                opacity={0.5 + Math.sin(Date.now() / 600 + i) * 0.3} />
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}
