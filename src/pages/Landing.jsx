import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import Background from '../components/Background';
import KleopatraHead from '../components/KleopatraHead';
import { useAuth } from '../context/AuthContext';
import { getFirstName } from '../lib/format';
import { db } from '../firebase';
import { NAV } from '../data/navigation';

const KleopatraHead3D = lazy(() => import('../components/KleopatraHead3D'));

// Set to true once kleopatra-3d.glb has been uploaded to /public.
const HAS_3D_MODEL = false;

function AccountStatus({ onAccount }) {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState('');

  useEffect(() => {
    if (!user || !db) {
      setFirstName('');
      return;
    }

    let active = true;

    getDoc(doc(db, 'users', user.uid))
      .then((snap) => {
        if (!active) return;
        setFirstName(snap.exists() ? getFirstName(snap.data()) : '');
      })
      .catch((err) => {
        console.warn('[AccountStatus] User profile fetch failed:', err);
        if (active) setFirstName('');
      });

    return () => { active = false; };
  }, [user]);

  const label = user
    ? `Eingeloggt als ${firstName || user.displayName || user.email || 'User'}`
    : 'Account / Login';

  return (
    <button className={`account-top ${user ? 'is-logged-in' : ''}`} onClick={onAccount}>
      <span className="account-top-dot" />
      <span>{label}</span>
    </button>
  );
}

export default function Landing({ onNav, tweaks }) {
  const dialRef = useRef(null);
  const [hoveredNav, setHoveredNav] = useState(null);

  return (
    <div className="stage">
      <Background mode={tweaks.bgMode} goldIntensity={tweaks.gold} />

      <header className="chrome">
        <h1 className="brand">
          <img
            className="brand-logo-img"
            src="/IMG_0708.jpeg"
            alt=""
            aria-hidden="true"
            onError={(event) => { event.currentTarget.style.display = 'none'; }}
          />
          <span className="brand-copy">
            <span>KLEOPATRA <span style={{ color: 'var(--ivory-dim)' }}>INK</span></span>
            <span className="brand-sub">Tattoo &amp; Piercing · Gunzenhausen</span>
          </span>
        </h1>
        <div className="chrome-actions">
          <div className="chrome-meta" aria-hidden="true">
            <span>EST 2018</span>
            <span>GUNZENHAUSEN</span>
            <span>DI — SA</span>
          </div>
          <AccountStatus onAccount={() => onNav('account')} />
        </div>
      </header>

      <div className="composition" role="navigation" aria-label="Hauptnavigation">
        <div className="dial" ref={dialRef}>
          <div className="dial-ring outer" />
          <div className="dial-ring" />
          <div className="dial-ring inner" />

          <svg className="dial-ticks" viewBox="0 0 100 100" preserveAspectRatio="none">
            {Array.from({ length: 60 }).map((_, i) => {
              const a = (i / 60) * Math.PI * 2;
              const major = i % 5 === 0;
              const r1 = major ? 47 : 48.5;
              const r2 = 50;
              return (
                <line key={i}
                  x1={50 + Math.cos(a) * r1} y1={50 + Math.sin(a) * r1}
                  x2={50 + Math.cos(a) * r2} y2={50 + Math.sin(a) * r2}
                  stroke={major ? 'rgba(212,165,55,0.5)' : 'rgba(212,165,55,0.18)'}
                  strokeWidth={major ? 0.3 : 0.15}
                />
              );
            })}
          </svg>

          {!HAS_3D_MODEL && <div className="head-halo" />}
          <div className="head-slot" style={HAS_3D_MODEL ? { inset: '-8%', overflow: 'visible' } : {}}>
            {HAS_3D_MODEL
              ? <Suspense fallback={<KleopatraHead style={tweaks.headStyle} goldIntensity={tweaks.gold} />}>
                  <KleopatraHead3D hoveredNav={hoveredNav} />
                </Suspense>
              : <KleopatraHead style={tweaks.headStyle} goldIntensity={tweaks.gold} />
            }
          </div>

          {NAV.map((n) => {
            const rad = (n.angle * Math.PI) / 180;
            const x = 50 + Math.cos(rad) * 58;
            const y = 50 + Math.sin(rad) * 58;
            return (
              <button
                key={n.id}
                className={`node node-${n.id}`}
                data-nav={n.id}
                style={{ left: `${x}%`, top: `${y}%` }}
                aria-label={`${n.label} – ${n.sub}`}
                onClick={() => onNav(n.id)}
                onMouseEnter={(e) => { e.currentTarget.classList.add('is-hover'); setHoveredNav(n.id); }}
                onMouseLeave={(e) => { e.currentTarget.classList.remove('is-hover'); setHoveredNav(null); }}
                onFocus={() => setHoveredNav(n.id)}
                onBlur={() => setHoveredNav(null)}
              >
                <span className="node-dot" aria-hidden="true" />
                <span>
                  <span className="node-lbl">{n.label}</span>
                  <span className="node-sub">{n.sub}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <nav className="mobile-nav" aria-label="Hauptnavigation Mobil">
        {NAV.map((n) => (
          <button
            key={n.id}
            className={`mobile-nav-item mobile-nav-${n.id}`}
            data-nav={n.id}
            aria-label={`${n.label} – ${n.sub}`}
            onClick={() => onNav(n.id)}
          >
            <span className="mobile-nav-dot" aria-hidden="true" />
            <span className="mobile-nav-lbl">{n.label}</span>
            <span className="mobile-nav-sub">{n.sub}</span>
          </button>
        ))}
      </nav>

      <address className="corner bl">
        <div>Marktplatz 7</div>
        <div>91710 Gunzenhausen</div>
        <div><a className="gold corner-tel" href="tel:+49983168421">+49 9831 6 84 21</a></div>
      </address>
      <div className="corner br" aria-hidden="true">
        <div>Beratung · Termin</div>
        <div>Fineline · Dotwork · Realism</div>
        <div>Neotraditional · Oldschool</div>
      </div>

      <div className="tagline">
        <div className="tagline-kicker">SEIT 2018 · GUNZENHAUSEN</div>
        <div className="tagline-main">Kunst auf deiner Haut.</div>
      </div>
    </div>
  );
}
