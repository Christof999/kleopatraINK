import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import KleopatraHead from './components/KleopatraHead';
import Background from './components/Background';
import InstagramFeed from './components/InstagramFeed';

const KleopatraHead3D = lazy(() => import('./components/KleopatraHead3D'));
const Body3DViewer    = lazy(() => import('./components/Body3DViewer'));
import { useTweaks, TweaksPanel, TweakSection, TweakSlider, TweakRadio } from './components/TweaksPanel';
import { GAL_FILTERS } from './gallery-items';
import { useGallery }  from './hooks/useGallery';
import { useWannados } from './hooks/useWannados';
import { useAuth } from './hooks/useAuth';
import { usePiercingPrices } from './hooks/usePiercingPrices';
import { auth, db, firebaseConfigured } from './firebase';
import './styles.css';

const NAV = [
  { id: 'gallery',      label: 'Galerie',        sub: 'Werke',       angle: -90  },
  { id: 'about',        label: 'Das sind wir',   sub: 'Studio',      angle: -45  },
  { id: 'booking',      label: 'Termin buchen',  sub: 'Appointment', angle:   0  },
  { id: 'piercing',     label: 'Piercing',       sub: 'Preise',      angle:  45  },
  { id: 'testimonials', label: 'Unsere Kunden',  sub: 'Stimmen',     angle:  90  },
  { id: 'socials',      label: 'Instagram',      sub: 'Follow',      angle: 150  },
  { id: 'wannados',     label: 'Wanna-dos',      sub: 'Flash',       angle: 210  },
];

const EUR_FORMATTER = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
});

function formatEuro(price) {
  const value = Number(price);
  return Number.isFinite(value) ? EUR_FORMATTER.format(value) : 'Preis auf Anfrage';
}

function getAuthErrorMessage(error) {
  switch (error?.code) {
    case 'auth/email-already-in-use':
      return 'Diese E-Mail-Adresse ist bereits registriert.';
    case 'auth/invalid-email':
      return 'Bitte gib eine gültige E-Mail-Adresse ein.';
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'E-Mail oder Passwort ist nicht korrekt.';
    case 'auth/weak-password':
      return 'Bitte wähle ein stärkeres Passwort mit mindestens 6 Zeichen.';
    default:
      return 'Die Anmeldung ist gerade nicht möglich. Bitte versuche es erneut.';
  }
}

function getFirstName(profile) {
  if (profile?.firstName) return profile.firstName;
  if (profile?.fullName) return profile.fullName.trim().split(/\s+/)[0] || '';
  return '';
}

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

// ── Landing ───────────────────────────────────────────────────────────────────

// Prüfen ob ein .glb vorhanden ist (Feature-Flag)
const HAS_3D_MODEL = false; // → auf true setzen sobald kleopatra-3d.glb hochgeladen ist

function Landing({ onNav, tweaks }) {
  const dialRef = useRef(null);
  const [dialSize, setDialSize] = useState(600);
  const [hoveredNav, setHoveredNav] = useState(null);

  useEffect(() => {
    const measure = () => {
      if (dialRef.current) {
        const w = dialRef.current.offsetWidth;
        setDialSize((prev) => (Math.abs(prev - w) > 1 ? w : prev));
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  return (
    <div className="stage">
      <Background mode={tweaks.bgMode} goldIntensity={tweaks.gold} />

      <div className="chrome">
        <div className="brand">
          <img
            className="brand-logo-img"
            src="/IMG_0708.jpeg"
            alt="Kleopatra INK Logo"
            onError={(event) => { event.currentTarget.style.display = 'none'; }}
          />
          <div className="brand-copy">
            <div>KLEOPATRA <span style={{ color: 'var(--ivory-dim)' }}>INK</span></div>
            <div className="brand-sub">Tattoo &amp; Piercing</div>
          </div>
        </div>
        <div className="chrome-actions">
          <div className="chrome-meta">
            <span>EST 2018</span>
            <span>GUNZENHAUSEN</span>
            <span>DI — SA</span>
          </div>
          <AccountStatus onAccount={() => onNav('account')} />
        </div>
      </div>

      <div className="composition">
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
                className="node"
                style={{ left: `${x}%`, top: `${y}%` }}
                onClick={() => onNav(n.id)}
                onMouseEnter={(e) => { e.currentTarget.classList.add('is-hover'); setHoveredNav(n.id); }}
                onMouseLeave={(e) => { e.currentTarget.classList.remove('is-hover'); setHoveredNav(null); }}
              >
                <span className="node-dot" />
                <span>
                  <div className="node-lbl">{n.label}</div>
                  <div className="node-sub">{n.sub}</div>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <nav className="mobile-nav" aria-label="Navigation">
        {NAV.map((n) => (
          <button
            key={n.id}
            className="mobile-nav-item"
            onClick={() => onNav(n.id)}
          >
            <span className="mobile-nav-dot" />
            <span className="mobile-nav-lbl">{n.label}</span>
            <span className="mobile-nav-sub">{n.sub}</span>
          </button>
        ))}
      </nav>

      <div className="corner bl">
        <div>Marktplatz 7</div>
        <div>91710 Gunzenhausen</div>
        <div><span className="gold">+49 9831 6 84 21</span></div>
      </div>
      <div className="corner br">
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

// ── Page shell ────────────────────────────────────────────────────────────────

function PageHead({ kicker, title, titleEm, meta, onBack }) {
  return (
    <>
      <button className="page-back" onClick={onBack}>← Zurück</button>
      <div className="page-head">
        <div>
          <div className="page-kicker">{kicker}</div>
          <h1 className="page-title">{title}{titleEm && <> <em>{titleEm}</em></>}</h1>
        </div>
        {meta && <div className="page-meta">{meta}</div>}
      </div>
    </>
  );
}

// ── Gallery ───────────────────────────────────────────────────────────────────

function Gallery({ onBack }) {
  const [filter, setFilter] = useState('Alle');
  const { items: allItems, loading } = useGallery();
  const items = filter === 'Alle' ? allItems : allItems.filter((i) => i.style === filter);

  return (
    <div className="page with-bg">
      <PageHead
        kicker="Portfolio · Kleopatra INK"
        title="Werke &" titleEm="Wunden"
        meta={<>
          <b>{loading ? '…' : allItems.length > 0 ? `${allItems.length} Arbeiten` : 'Demnächst'}</b>
          <div>2018 — 2026</div>
        </>}
        onBack={onBack}
      />
      <div className="gal-filters">
        {GAL_FILTERS.map((f) => (
          <button key={f}
            className={`gal-chip ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>
      {loading ? (
        <div className="fb-loading"><div className="ig-spinner" /></div>
      ) : items.length === 0 ? (
        <p className="gal-empty">
          {filter === 'Alle' ? 'Bilder folgen bald.' : `Noch keine ${filter}-Arbeiten vorhanden.`}
        </p>
      ) : (
        <div className="gal-grid">
          {items.map((it) => (
            <div key={it.id} className="gal-item">
              <img className="gal-img" src={it.src} alt={it.piece || it.style} loading="lazy" />
              {(it.piece || it.style) && (
                <div className="gal-caption">
                  <div className="gal-caption-style">{it.style}</div>
                  {it.piece && <div className="gal-caption-piece">{it.piece}</div>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── About ─────────────────────────────────────────────────────────────────────

function About({ onBack }) {
  return (
    <div className="page with-bg">
      <PageHead
        kicker="Über uns · Est. 2018"
        title="Das sind" titleEm="wir"
        meta={<>
          <b>Seit 2018</b>
          <div>Gunzenhausen</div>
          <div>Kleopatra INK</div>
        </>}
        onBack={onBack}
      />
      <div className="about-hero">
        <div className="about-copy">
          <p>Kleopatra INK ist ein Familienstudio in Gunzenhausen — gegründet 2018, gewachsen aus echter Leidenschaft für Tätowierkunst. Ein Künstler, eine Familie, eine Handschrift. Und der Glaube, dass jedes Tattoo ein Einzelstück sein muss.</p>
          <p>Jede Arbeit beginnt mit einem persönlichen Gespräch. Wir hören zu, skizzieren, verwerfen und zeichnen wieder — bis das Motiv so scharf ist wie die Nadel, die es setzt. Kein Motiv verlässt unser Studio zweimal.</p>
          <p>Hygiene nach DIN EN 17141. Pigmente nach EU-REACH. Kein Small-Talk, keine Kompromisse.</p>
        </div>
        <div className="placeholder about-img">
          <div className="ph-label">STUDIO SHOT</div>
          <div className="ph-sub">Innenraum, warmes Licht, Arbeitsplatz</div>
        </div>
      </div>

      <h3 className="serif" style={{ fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold)', margin: '0 0 24px' }}>Der Künstler</h3>
      <div className="team-grid solo">
        <div className="team-card">
          <div className="placeholder">
            <div className="ph-label">PORTRAIT</div>
            <div className="ph-sub">Im Studio, bei der Arbeit</div>
          </div>
          <div className="team-info">
            <h4 className="team-name">Kleopatra INK</h4>
            <div className="team-role">Tätowierer · Gründer</div>
            <div className="team-bio">Seit 2018 in Gunzenhausen zuhause. Spezialisiert auf präzises Fineline, Realism und Neotraditional. Jede Arbeit ein Einzelstück — nichts wird doppelt getätowiert.</div>
            <div className="team-specs">
              <span className="spec">Fineline</span>
              <span className="spec">Dotwork</span>
              <span className="spec">Realism</span>
              <span className="spec">Black & White</span>
              <span className="spec">Neotraditional</span>
              <span className="spec">Oldschool</span>
            </div>
          </div>
        </div>
      </div>

      <h3 className="serif" style={{ fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold)', margin: '60px 0 24px' }}>Die Familie</h3>
      <div className="family-section">
        <div className="placeholder family-img">
          <div className="ph-label">FAMILIENFOTO</div>
          <div className="ph-sub">Familie · Kinder · Hund</div>
        </div>
        <div className="family-copy">
          <p className="cormorant">Hinter Kleopatra INK steckt mehr als ein Studio — es ist ein Familienunternehmen. Termine, Organisation und das herzliche Empfangen der Kunden liegen in familiärer Hand. Wer herkommt, ist kein Laufkundschaft, sondern Gast.</p>
          <p className="cormorant">Das spürt man vom ersten Anruf an.</p>
        </div>
      </div>
    </div>
  );
}

// ── Booking — Beratungstermin ─────────────────────────────────────────────────

const SLOTS = ['10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '19:00'];
const DISABLED = new Set(['13:00', '17:30']);

const INTERESTS = [
  { id: 'fineline',       name: 'Fineline'       },
  { id: 'dotwork',        name: 'Dotwork'        },
  { id: 'realism',        name: 'Realism'        },
  { id: 'blackandwhite',  name: 'Black & White'  },
  { id: 'neotraditional', name: 'Neotraditional' },
  { id: 'oldschool',      name: 'Oldschool'      },
  { id: 'unsure',         name: 'Noch unsicher'  },
];

// ── Wanna-dos ─────────────────────────────────────────────────────────────────

const HAS_3D_BODY = true;

function WannaDos({ onBack, onBook }) {
  const [filter,   setFilter]   = useState('Alle');
  const [viewItem, setViewItem] = useState(null);
  const { items: allItems, loading } = useWannados();

  const available = allItems.filter((i) => i.available !== false);
  const items = filter === 'Alle'
    ? allItems
    : allItems.filter((i) => i.target === filter || i.target === 'Alle');

  return (
    <div className="page with-bg">
      <PageHead
        kicker="Flash & Wanna-dos · Kleopatra INK"
        title="Wanna-" titleEm="dos"
        meta={<>
          <b>{available.length > 0 ? `${available.length} verfügbar` : 'Demnächst'}</b>
          <div>Flash & Unikate</div>
        </>}
        onBack={onBack}
      />

      <div className="gal-filters" style={{ marginBottom: 32 }}>
        {['Alle', 'Frau', 'Mann'].map((f) => (
          <button key={f}
            className={`gal-chip ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >{f}</button>
        ))}
      </div>

      {loading ? (
        <div className="fb-loading"><div className="ig-spinner" /></div>
      ) : items.length === 0 ? (
        <p className="gal-empty">
          {filter === 'Alle' ? 'Neue Motive folgen bald.' : `Keine Motive für ${filter} verfügbar.`}
        </p>
      ) : (
        <div className="wd-grid">
          {items.map((item) => (
            <div key={item.id} className={`wd-card${item.available === false ? ' wd-taken' : ''}${viewItem === item ? ' wd-viewing' : ''}`}>
              <div className="wd-img-wrap">
                <img src={item.src} alt={item.title} className="wd-img" loading="lazy" />
                {item.available === false && (
                  <div className="wd-overlay-taken">Vergeben</div>
                )}
              </div>
              <div className="wd-info">
                <div className="wd-badges">
                  <span className="wd-badge">{item.style}</span>
                  <span className="wd-badge wd-badge-target">{item.target}</span>
                </div>
                <h3 className="wd-title">{item.title}</h3>
                <div className="wd-meta">{item.placement}</div>
                {item.desc && <p className="wd-desc">{item.desc}</p>}
                <div className="wd-actions">
                  {HAS_3D_BODY && item.available !== false && (
                    <button
                      className={`wd-btn-view${viewItem === item ? ' active' : ''}`}
                      onClick={() => setViewItem(viewItem === item ? null : item)}
                    >
                      {viewItem === item ? '3D aktiv ✓' : 'Auf Körper zeigen'}
                    </button>
                  )}
                  <button
                    className="wd-btn"
                    disabled={item.available === false}
                    onClick={() => item.available !== false && onBook(item)}
                  >
                    {item.available === false ? 'Vergeben' : 'Ich will das →'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {HAS_3D_BODY && (
        <div className="wd-3d-section">
          <div className="wd-3d-header">
            <h3 className="wd-3d-title">Tattoo visualisieren</h3>
            <p className="wd-3d-sub">
              {viewItem
                ? `„${viewItem.title}" — klick auf den Körper um es zu platzieren`
                : 'Wähle ein Motiv aus und klicke auf „Auf Körper zeigen"'}
            </p>
          </div>
          <Suspense fallback={<div className="body3d-loading">3D-Modell wird geladen …</div>}>
            <Body3DViewer tatSrc={viewItem?.src ?? null} placement3d={viewItem?.placement3d ?? null} />
          </Suspense>
        </div>
      )}
    </div>
  );
}

// ── Piercing prices ───────────────────────────────────────────────────────────

function PiercingPrices({ onBack, onBook }) {
  const { items, loading, error } = usePiercingPrices();

  return (
    <div className="page with-bg">
      <PageHead
        kicker="Piercings · Preise"
        title="Piercing" titleEm="Preise"
        meta={<>
          <b>{loading ? '…' : items.length > 0 ? `${items.length} Einträge` : 'Bald'}</b>
          <div>Aus Firestore</div>
          <div>inkl. Erstschmuck</div>
        </>}
        onBack={onBack}
      />

      <div className="book-intro piercing-intro">
        <p>
          <b className="gold">Aktuelle Piercing-Preise direkt aus dem Studio.</b> Die Liste wird im Admin-Portal gepflegt und hier automatisch aus demselben Firebase-Projekt angezeigt.
        </p>
      </div>

      {loading ? (
        <div className="fb-loading"><div className="ig-spinner" /></div>
      ) : error ? (
        <p className="gal-empty">Preisliste konnte nicht geladen werden.</p>
      ) : items.length === 0 ? (
        <p className="gal-empty">Piercing-Preise folgen bald.</p>
      ) : (
        <div className="piercing-grid">
          {items.map((item) => (
            <article key={item.id} className="piercing-card">
              <div>
                <h3 className="piercing-title">{item.title}</h3>
                {item.desc && <p className="piercing-desc">{item.desc}</p>}
              </div>
              <div className="piercing-card-side">
                <div className="piercing-price">{formatEuro(item.price)}</div>
                <button className="piercing-request" onClick={() => onBook(item)}>
                  Termin anfragen
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Booking ───────────────────────────────────────────────────────────────────

function Booking({ onBack, wannado, piercing }) {
  const { user } = useAuth();
  const [interest, setInterest] = useState('unsure');
  const [slot, setSlot] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [desc, setDesc] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const isPiercingBooking = !!piercing;

  useEffect(() => {
    if (isPiercingBooking) {
      setInterest('piercing');
      setDesc((current) => current || `Piercing-Anfrage: ${piercing.title}${piercing.desc ? ` — ${piercing.desc}` : ''}`);
    }
  }, [isPiercingBooking, piercing]);

  useEffect(() => {
    if (!user) return;

    if (user.email) setEmail((current) => current || user.email);
    if (user.displayName) setName((current) => current || user.displayName);

    if (!db) return;

    let active = true;

    getDoc(doc(db, 'users', user.uid))
      .then((snap) => {
        if (!active || !snap.exists()) return;

        const profile = snap.data();
        const fullName = profile.fullName || [profile.firstName, profile.lastName].filter(Boolean).join(' ');

        if (fullName) setName((current) => current || fullName);
        if (profile.email) setEmail((current) => current || profile.email);
        if (profile.phone) setPhone((current) => current || profile.phone);
      })
      .catch((err) => {
        console.warn('[Booking] User profile fetch failed:', err);
      });

    return () => { active = false; };
  }, [user]);

  if (submitted) {
    return (
      <div className="page with-bg" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
        <div style={{ maxWidth: 540, textAlign: 'center', padding: '20px' }}>
          <div className="page-kicker">Beratungstermin angefragt</div>
          <h1 className="page-title" style={{ marginBottom: 24 }}>Bis <em>bald</em></h1>
          <p className="cormorant" style={{ fontSize: 20, color: 'var(--ivory)', opacity: 0.9, lineHeight: 1.5 }}>
            Ich bestätige deinen Beratungstermin innerhalb von 48 Stunden per Mail an <b style={{ color: 'var(--gold)' }}>{email || 'dich'}</b>. Bring gerne Referenzen mit — und viel Zeit für Fragen.
          </p>
          <button className="page-back" style={{ marginTop: 32 }} onClick={onBack}>← Zurück zur Seite</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page with-bg">
      <PageHead
        kicker={isPiercingBooking ? 'Piercing-Anfrage · Kleopatra INK' : 'Beratungstermin · kostenlos'}
        title={isPiercingBooking ? 'Piercing' : 'Termin'} titleEm={isPiercingBooking ? 'anfragen' : 'buchen'}
        meta={<>
          <b>{isPiercingBooking ? 'Anfrage' : '~45 min'}</b>
          <div>{isPiercingBooking ? piercing.title : 'Kostenfrei'}</div>
          <div>Unverbindlich</div>
        </>}
        onBack={onBack}
      />
      {wannado && (
        <div className="wd-booking-banner">
          <img src={wannado.src} alt={wannado.title} className="wd-booking-img" />
          <div>
            <div className="wd-booking-label">Ausgewähltes Motiv</div>
            <div className="wd-booking-name">{wannado.title}</div>
            <div className="wd-booking-meta">{wannado.style} · {wannado.placement}</div>
          </div>
        </div>
      )}
      {piercing && (
        <div className="wd-booking-banner piercing-booking-banner">
          <div>
            <div className="wd-booking-label">Ausgewähltes Piercing</div>
            <div className="wd-booking-name">{piercing.title}</div>
            <div className="wd-booking-meta">
              {piercing.desc ? `${piercing.desc} · ` : ''}{formatEuro(piercing.price)}
            </div>
          </div>
        </div>
      )}

      <div className="book-intro">
        <p className="cormorant">
          {isPiercingBooking ? (
            <>
              <b className="gold">Deine Piercing-Anfrage ist vorbereitet.</b> Name und Kontaktdaten werden aus deinem Account übernommen, wenn du eingeloggt bist. Wähle noch einen Wunsch-Slot und ergänze bei Bedarf Hinweise.
            </>
          ) : (
            <>
              <b className="gold">Jedes Tattoo beginnt mit einem Gespräch.</b> Bevor die Nadel ansetzt, treffen wir uns für eine unverbindliche Beratung — im Studio oder per Video. Wir besprechen dein Motiv, schauen Referenzen an, ich skizziere, wir klären Platzierung, Aufwand und einen realistischen Preis. Erst danach vereinbaren wir den eigentlichen Tattoo-Termin.
            </>
          )}
        </p>
      </div>
      <div className="booking-wrap">
        <div className="book-col">
          <h3>01 · Worum geht&apos;s ungefähr?</h3>
          {isPiercingBooking ? (
            <div className="booking-selected-service">
              <div className="booking-selected-label">Piercing</div>
              <div className="booking-selected-title">{piercing.title}</div>
              {piercing.desc && <div className="booking-selected-desc">{piercing.desc}</div>}
            </div>
          ) : (
            <div className="style-grid">
              {INTERESTS.map((s) => (
                <div key={s.id}
                  className={`style-card ${interest === s.id ? 'selected' : ''}`}
                  onClick={() => setInterest(s.id)}>
                  <div className="style-name">{s.name}</div>
                </div>
              ))}
            </div>
          )}

          <h3 style={{ marginTop: 36 }}>02 · Dein Wunsch-Slot — Di 12. Mai</h3>
          <div className="slot-grid">
            {SLOTS.map((s) => (
              <button key={s}
                className={`slot ${slot === s ? 'selected' : ''} ${DISABLED.has(s) ? 'disabled' : ''}`}
                disabled={DISABLED.has(s)}
                onClick={() => setSlot(s)}>{s}</button>
            ))}
          </div>
          <div style={{ fontSize: 10, color: 'var(--ivory-dim)', letterSpacing: '0.08em', marginBottom: 24, marginTop: -8 }}>
            Dauer ca. 45 Minuten. Andere Tage? Schreib&apos;s unten ins Freitextfeld.
          </div>

          <h3 style={{ marginTop: 12 }}>03 · Deine Details</h3>
          <div className="field">
            <label>Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Vor- und Nachname" />
          </div>
          <div className="field">
            <label>E-Mail</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="deine@email.de" />
          </div>
          <div className="field">
            <label>Telefon <span style={{ opacity: 0.5, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+49 …" />
          </div>
          <div className="field">
            <label>Kurz zu deiner Idee</label>
            <textarea rows={4} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Motiv, Körperstelle, ungefähre Größe, Referenzen — alles was dir einfällt. Keine Angst, noch muss nichts feststehen." />
          </div>
        </div>

        <div className="summary">
          <h4>Dein Beratungstermin</h4>
          <div className="sum-row"><span className="sum-k">Art</span><span className="sum-v">{isPiercingBooking ? 'Piercing-Anfrage' : 'Erstberatung'}</span></div>
          <div className="sum-row"><span className="sum-k">Thema</span><span className="sum-v">{isPiercingBooking ? piercing.title : INTERESTS.find((s) => s.id === interest)?.name}</span></div>
          {name && <div className="sum-row"><span className="sum-k">Name</span><span className="sum-v">{name}</span></div>}
          <div className="sum-row"><span className="sum-k">Termin</span><span className={`sum-v ${slot ? '' : 'empty'}`}>{slot ? `Di 12. Mai · ${slot}` : 'noch nicht gewählt'}</span></div>
          <div className="sum-row"><span className="sum-k">Dauer</span><span className="sum-v">~45 Min</span></div>
          <div className="sum-row"><span className="sum-k">Kosten</span><span className="sum-v gold">{isPiercingBooking ? formatEuro(piercing.price) : 'Kostenfrei'}</span></div>
          <button
            className="btn-primary"
            style={{ marginTop: 24, opacity: (slot && name && email) ? 1 : 0.4, cursor: (slot && name && email) ? 'pointer' : 'not-allowed' }}
            disabled={!(slot && name && email)}
            onClick={() => setSubmitted(true)}>
            {isPiercingBooking ? 'Piercing anfragen →' : 'Beratung anfragen →'}
          </button>
          <div style={{ marginTop: 14, fontSize: 10, color: 'var(--ivory-dim)', letterSpacing: '0.06em', lineHeight: 1.5 }}>
            Unverbindlich. Bestätigung per Mail binnen 48 Stunden. Der eigentliche Tattoo-Termin wird im Anschluss gemeinsam vereinbart.
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Testimonials ──────────────────────────────────────────────────────────────

const TESTIS = [
  { name: 'Sam78',           info: 'vor 6 Monaten',  stars: 5, text: 'Super sympathisches Tattoo-Studio! Hat uns als Familie total ernst genommen und unsere Wünsche ehrlich und professionell beurteilt, sodass wir alle mit einem tollen Ergebnis nach Hause gegangen sind.' },
  { name: 'Janine',          info: 'vor 9 Monaten',  stars: 5, text: 'Bin absolut begeistert. Ich war vor 2 Wochen in diesem Tattoostudio, um mir mein allererstes Tattoo stechen zu lassen. Es wurde mir empfohlen und ich bekam echt das beste Ergebnis, das ich mir vorstellen konnte.' },
  { name: 'Mareen Bickel',   info: 'vor 7 Monaten',  stars: 5, text: 'Ich habe mir heute ein Tattoo bei den beiden stechen lassen und ein weiteres verschönern. Ich bin mehr als begeistert und meeeega happy damit! Besser hätte man es nicht umsetzen können.' },
  { name: 'Sina Le',         info: 'vor 9 Monaten',  stars: 5, text: 'Hier kommt man gerne her. Super lieb, tolle Atmosphäre und geniale Umsetzung. Bin einfach begeistert.' },
  { name: 'Angela Weidner',  info: 'vor 3 Jahren',   stars: 5, text: 'Super Arbeit richtige Kunstwerke werden da gemacht. Ich habe 4 Tattoos stechen lassen und jedes einzelne ist so schön geworden. Man nimmt sich total viel Zeit für jeden Kunden.' },
  { name: 'Sven Höfler',     info: 'vor einem Jahr', stars: 5, text: 'Das Studio wurde mir empfohlen und ich muss sagen, dass mein Tattoo absolut Klasse geworden ist. Vom Beratungsgespräch bis zum Endergebnis ist absolute Professionalität zu spüren.' },
  { name: 'Laura-Jane Büscher', info: 'vor 2 Jahren', stars: 5, text: 'Bin mehr als zufrieden mit meinem Tattoo. Sehr präzise und professionell gestochen.' },
  { name: 'Klara Popp',      info: 'vor 2 Jahren',   stars: 5, text: 'Das Studio wurde mir von meiner Freundin empfohlen. Hinter einem unscheinbaren Studio steckt absolute Leidenschaft und Professionalität!' },
  { name: 'Frank Carlet',    info: 'vor 2 Jahren',   stars: 5, text: 'Ich habe heute mein erstes Tattoo bekommen. Das Studio wurde mir von einer Freundin empfohlen und ich traf auf einen Künstler der seine Arbeit mit totaler Hingabe ausführt.' },
  { name: 'Maria Sillinger', info: 'vor 3 Jahren',   stars: 5, text: 'Ich hatte nur einen Termin zur Besprechung, aber da er Zeit hatte, hat er mir das Tattoo direkt ohne neuen Termin gestochen, war echt super.' },
  { name: 'Jürgen M.',       info: 'vor 3 Jahren',   stars: 5, text: 'Sehr tollen Eindruck von dort bekommen und es ist ganz einfach zu finden. Meine Erwartungen wurden übertroffen 👍 einfach genial.' },
  { name: 'Melany Deinzer',  info: 'vor 2 Jahren',   stars: 5, text: 'Absolut tolle und freundliche Beratung. Wurde so herzlich und lieb behandelt. Alles ist absolut professionell und auch das Stechen hat super wunderbar funktioniert.' },
  { name: 'Jannis Rabus',    info: 'vor 3 Jahren',   stars: 5, text: 'Durch Zufall auf diesen KÜNSTLER gestoßen. Seine Arbeit ist mehr als perfekt, nimmt sich Zeit für seinen Kunden und geht auf jeden Wunsch ein.' },
  { name: 'Thomas',          info: 'vor 3 Jahren',   stars: 5, text: 'Ich bin durch meinen besten Freund an dieses Studio geraten — und wahnsinnig glücklich darüber!' },
  { name: 'Vanessa Zapke',   info: 'vor 3 Jahren',   stars: 5, text: 'Bin sehr begeistert. Ganz liebe Besitzer und ein sauberes Studio. Man fühlt sich von Anfang an sehr wohl und gut aufgehoben. Eine super Beratung im Vorfeld.' },
  { name: 'Julia M.',        info: 'vor 2 Jahren',   stars: 5, text: 'Ich bin mehr als zufrieden. Mein Tattoo ist sehr sauber gestochen und war innerhalb kürzester Zeit ohne Komplikationen abgeheilt. Ich bin absolut glücklich damit und bereue es keine Sekunde. Gerne wieder ❤️' },
  { name: 'Celine Weissmann',info: 'vor 2 Jahren',   stars: 5, text: 'Ich bin mega zufrieden mit meinem Tattoo. Alle beide sind super sympathisch und wissen genau was sie machen. Es wurde super beraten und man bekommt schnell einen Termin.' },
  { name: 'Lisa',            info: 'vor 4 Jahren',   stars: 5, text: 'Super tolles Team! Mega saubere, akkurate Arbeit und immer freundlich. Sind aus Sachsen und zufällig auf dieses Tattoostudio gestoßen. Beide waren sehr herzlich und zuvorkommend.' },
  { name: 'Sabrina Fichtner',info: 'vor 3 Jahren',   stars: 5, text: 'TOP Tattoostudio! Kompetente und freundliche Beratung, ich bin was Tattoos angeht durch ganz Deutschland getingelt, meine Motive wurden aber nie so umgesetzt wie hier.' },
  { name: 'Evelyn Root',     info: 'vor 2 Jahren',   stars: 5, text: 'Ich war heute mittlerweile zum fünften Mal dort. Ich kann dieses Studio jedem wirklich nur ans Herz legen, mit Abstand das beste Studio in dem ich bisher war.' },
  { name: 'S. Winkler',      info: 'vor 3 Jahren',   stars: 5, text: 'Absolut empfehlenswert, die Besitzer sind sehr freundlich und kommen gerne den Wünschen nach. Mein Beratungstermin wurde anschließend direkt zum Tattoo-Termin.' },
  { name: 'Sigrid Grüner',   info: 'vor einem Jahr', stars: 5, text: 'Tolle Arbeit, super nett. Sehr talentiert. Mega Ergebnis. Seine Frau macht Termine und sie ist sehr freundlich und hat die angenehmste Stimme die ich je hörte am Telefon.' },
  { name: 'Kipfl',           info: 'vor 2 Jahren',   stars: 5, text: '100% Vertrauen in ein Cover-Up gelegt und nicht enttäuscht worden! Super Studio, modern und sauber — der Tätowierer ist unfassbar begabt.' },
];

function Testimonials({ onBack }) {
  return (
    <div className="page with-bg">
      <PageHead
        kicker="Stimmen · Google"
        title="Was unsere" titleEm="Kunden sagen"
        meta={<>
          <b>5,0 ★</b>
          <div>23 Bewertungen</div>
          <div>Google</div>
        </>}
        onBack={onBack}
      />
      <div className="testi-grid">
        {TESTIS.map((t, i) => (
          <div key={i} className="testi">
            <div className="testi-stars">{'★'.repeat(t.stars)}{'☆'.repeat(5 - t.stars)}</div>
            <div className="testi-quote">{t.text}</div>
            <div className="testi-meta">
              <div className="testi-name">{t.name}</div>
              <div className="testi-info">{t.info}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Socials ───────────────────────────────────────────────────────────────────

function Socials({ onBack }) {
  return (
    <div className="page with-bg">
      <PageHead
        kicker="Instagram · @kleopatra.ink"
        title="Unsere" titleEm="Arbeiten"
        meta={<>
          <div>Tägliche Posts</div>
          <div>DM offen</div>
        </>}
        onBack={onBack}
      />
      <InstagramFeed />
    </div>
  );
}

// ── Account ───────────────────────────────────────────────────────────────────

function Account({ onBack }) {
  const { user, loading: authLoading } = useAuth();
  const [mode, setMode] = useState('login');
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
  });
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    if (!user || !db) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    let active = true;
    setProfileLoading(true);

    getDoc(doc(db, 'users', user.uid))
      .then((snap) => {
        if (!active) return;
        if (snap.exists()) {
          const firestoreProfile = { uid: user.uid, ...snap.data() };
          setProfile(firestoreProfile);
        } else {
          setProfile(null);
        }
      })
      .catch((err) => {
        console.warn('[Account] User profile fetch failed:', err);
      })
      .finally(() => {
        if (active) setProfileLoading(false);
      });

    return () => { active = false; };
  }, [user]);

  const updateLoginForm = (field, value) => {
    setLoginForm((current) => ({ ...current, [field]: value }));
  };

  const updateRegisterForm = (field, value) => {
    setRegisterForm((current) => ({ ...current, [field]: value }));
  };

  const updateProfileForm = (field, value) => {
    setProfileForm((current) => ({ ...current, [field]: value }));
  };

  useEffect(() => {
    if (!user) {
      setProfileForm({ firstName: '', lastName: '', phone: '', email: '' });
      return;
    }

    setProfileForm({
      firstName: getFirstName(profile) || user.displayName || '',
      lastName: profile?.lastName || '',
      phone: profile?.phone || '',
      email: profile?.email || user.email || '',
    });
  }, [profile, user]);

  const handleLogin = async (event) => {
    event.preventDefault();
    if (!auth) return;

    setSubmitting(true);
    setNotice(null);

    try {
      await signInWithEmailAndPassword(
        auth,
        loginForm.email.trim().toLowerCase(),
        loginForm.password
      );
      setLoginForm({ email: '', password: '' });
      setNotice({ type: 'success', text: 'Du bist eingeloggt.' });
    } catch (error) {
      setNotice({ type: 'error', text: getAuthErrorMessage(error) });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    if (!auth || !db) return;

    const firstName = registerForm.firstName.trim();
    const lastName = registerForm.lastName.trim();
    const phone = registerForm.phone.trim();
    const email = registerForm.email.trim().toLowerCase();

    setSubmitting(true);
    setNotice(null);

    try {
      const credential = await createUserWithEmailAndPassword(auth, email, registerForm.password);
      await updateProfile(credential.user, { displayName: firstName }).catch((err) => {
        console.warn('[Account] Auth display name update failed:', err);
      });

      const displayProfile = {
        uid: credential.user.uid,
        email,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        phone,
      };

      const profileData = {
        ...displayProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'users', credential.user.uid), profileData, { merge: true });
      setProfile(displayProfile);
      setRegisterForm({ firstName: '', lastName: '', phone: '', email: '', password: '' });
      setNotice({ type: 'success', text: 'Dein Kunden-Account wurde erstellt.' });
    } catch (error) {
      const isLoggedInAfterRegister = auth.currentUser?.email?.toLowerCase() === email;
      setNotice({
        type: isLoggedInAfterRegister ? 'warning' : 'error',
        text: isLoggedInAfterRegister
          ? 'Dein Account wurde erstellt, aber das Profil konnte nicht in Firestore gespeichert werden.'
          : getAuthErrorMessage(error),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();
    if (!auth?.currentUser || !db) return;

    const firstNameValue = profileForm.firstName.trim();
    const lastNameValue = profileForm.lastName.trim();
    const phoneValue = profileForm.phone.trim();
    const emailValue = profileForm.email.trim().toLowerCase();

    setSubmitting(true);
    setNotice(null);

    try {
      await updateProfile(auth.currentUser, { displayName: firstNameValue }).catch((err) => {
        console.warn('[Account] Auth display name update failed:', err);
      });

      const profileData = {
        uid: auth.currentUser.uid,
        email: emailValue,
        firstName: firstNameValue,
        lastName: lastNameValue,
        fullName: `${firstNameValue} ${lastNameValue}`,
        phone: phoneValue,
        updatedAt: serverTimestamp(),
      };

      if (!profile) {
        profileData.createdAt = serverTimestamp();
      }

      await setDoc(doc(db, 'users', auth.currentUser.uid), profileData, { merge: true });

      const displayProfile = {
        uid: auth.currentUser.uid,
        email: emailValue,
        firstName: firstNameValue,
        lastName: lastNameValue,
        fullName: `${firstNameValue} ${lastNameValue}`,
        phone: phoneValue,
      };

      setProfile(displayProfile);
      setNotice({ type: 'success', text: 'Dein Profil wurde gespeichert.' });
    } catch (error) {
      console.error('[Account] User profile save failed:', error);
      setNotice({ type: 'error', text: 'Dein Profil konnte nicht gespeichert werden.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    if (!auth) return;

    setSubmitting(true);
    setNotice(null);

    try {
      await signOut(auth);
      setProfile(null);
      setMode('login');
      setNotice({ type: 'success', text: 'Du bist ausgeloggt.' });
    } catch (error) {
      setNotice({ type: 'error', text: 'Logout konnte nicht ausgeführt werden.' });
    } finally {
      setSubmitting(false);
    }
  };

  const firstName = getFirstName(profile) || user?.displayName || '';
  const lastName = profile?.lastName || '';
  const phone = profile?.phone || '';
  const email = profile?.email || user?.email || '';
  const displayName = firstName || 'Dein Account';

  return (
    <div className="page with-bg">
      <PageHead
        kicker="Kundenbereich · Kleopatra INK"
        title="Dein" titleEm="Account"
        meta={<>
          <b>{user ? 'Eingeloggt' : 'Login'}</b>
          <div>Firebase Auth</div>
          <div>Kundenprofil</div>
        </>}
        onBack={onBack}
      />

      {!firebaseConfigured ? (
        <p className="gal-empty">Firebase ist für diese Umgebung nicht konfiguriert.</p>
      ) : authLoading ? (
        <div className="fb-loading"><div className="ig-spinner" /></div>
      ) : user ? (
        <div className="account-layout">
          <section className="account-panel">
            <div className="account-kicker">Angemeldet als</div>
            <h2 className="account-title">{profileLoading && !firstName ? 'Profil wird geladen …' : displayName}</h2>
            <p className="account-copy">
              Ergänze hier deine Kontaktdaten. Nach dem Speichern stehen sie auch im Admin-Portal zur Verfügung.
            </p>
            {notice && <div className={`account-notice ${notice.type}`}>{notice.text}</div>}
            <form className="account-form account-profile-form" onSubmit={handleProfileSave}>
              <div className="account-form-grid">
                <div className="field">
                  <label>Vorname</label>
                  <input
                    type="text"
                    autoComplete="given-name"
                    required
                    value={profileForm.firstName}
                    onChange={(event) => updateProfileForm('firstName', event.target.value)}
                    placeholder="Vorname"
                  />
                </div>
                <div className="field">
                  <label>Nachname</label>
                  <input
                    type="text"
                    autoComplete="family-name"
                    required
                    value={profileForm.lastName}
                    onChange={(event) => updateProfileForm('lastName', event.target.value)}
                    placeholder="Nachname"
                  />
                </div>
              </div>
              <div className="field">
                <label>Telefonnummer</label>
                <input
                  type="tel"
                  autoComplete="tel"
                  required
                  value={profileForm.phone}
                  onChange={(event) => updateProfileForm('phone', event.target.value)}
                  placeholder="+49 …"
                />
              </div>
              <div className="field">
                <label>E-Mail im Profil</label>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={profileForm.email}
                  onChange={(event) => updateProfileForm('email', event.target.value)}
                  placeholder="deine@email.de"
                />
              </div>
              <div className="account-actions">
                <button className="btn-primary" disabled={submitting}>
                  {submitting ? 'Bitte warten …' : 'Profil speichern'}
                </button>
                <button className="account-secondary-btn" type="button" onClick={handleLogout} disabled={submitting}>
                  Logout
                </button>
              </div>
            </form>
          </section>

          <aside className="summary">
            <h4>Profil</h4>
            <div className="sum-row"><span className="sum-k">E-Mail</span><span className="sum-v account-email-value">{email}</span></div>
            <div className="sum-row"><span className="sum-k">Vorname</span><span className={`sum-v ${firstName ? '' : 'empty'}`}>{firstName || 'nicht gesetzt'}</span></div>
            <div className="sum-row"><span className="sum-k">Nachname</span><span className={`sum-v ${lastName ? '' : 'empty'}`}>{lastName || 'nicht gesetzt'}</span></div>
            <div className="sum-row"><span className="sum-k">Telefon</span><span className={`sum-v ${phone ? '' : 'empty'}`}>{phone || 'nicht gesetzt'}</span></div>
          </aside>
        </div>
      ) : (
        <div className="account-layout">
          <section className="account-panel">
            <div className="account-tabs" role="tablist" aria-label="Account Formular">
              <button
                className={`gal-chip ${mode === 'login' ? 'active' : ''}`}
                type="button"
                onClick={() => { setMode('login'); setNotice(null); }}
              >
                Login
              </button>
              <button
                className={`gal-chip ${mode === 'register' ? 'active' : ''}`}
                type="button"
                onClick={() => { setMode('register'); setNotice(null); }}
              >
                Registrierung
              </button>
            </div>

            {mode === 'login' ? (
              <form className="account-form" onSubmit={handleLogin}>
                <div className="field">
                  <label>E-Mail</label>
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    value={loginForm.email}
                    onChange={(event) => updateLoginForm('email', event.target.value)}
                    placeholder="deine@email.de"
                  />
                </div>
                <div className="field">
                  <label>Passwort</label>
                  <input
                    type="password"
                    autoComplete="current-password"
                    required
                    value={loginForm.password}
                    onChange={(event) => updateLoginForm('password', event.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                {notice && <div className={`account-notice ${notice.type}`}>{notice.text}</div>}
                <button className="btn-primary" disabled={submitting}>
                  {submitting ? 'Bitte warten …' : 'Einloggen'}
                </button>
              </form>
            ) : (
              <form className="account-form" onSubmit={handleRegister}>
                <div className="account-form-grid">
                  <div className="field">
                    <label>Vorname</label>
                    <input
                      type="text"
                      autoComplete="given-name"
                      required
                      value={registerForm.firstName}
                      onChange={(event) => updateRegisterForm('firstName', event.target.value)}
                      placeholder="Max"
                    />
                  </div>
                  <div className="field">
                    <label>Nachname</label>
                    <input
                      type="text"
                      autoComplete="family-name"
                      required
                      value={registerForm.lastName}
                      onChange={(event) => updateRegisterForm('lastName', event.target.value)}
                      placeholder="Mustermann"
                    />
                  </div>
                </div>
                <div className="field">
                  <label>Telefonnummer</label>
                  <input
                    type="tel"
                    autoComplete="tel"
                    required
                    value={registerForm.phone}
                    onChange={(event) => updateRegisterForm('phone', event.target.value)}
                    placeholder="+49 170 1234567"
                  />
                </div>
                <div className="field">
                  <label>E-Mail</label>
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    value={registerForm.email}
                    onChange={(event) => updateRegisterForm('email', event.target.value)}
                    placeholder="deine@email.de"
                  />
                </div>
                <div className="field">
                  <label>Passwort</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={registerForm.password}
                    onChange={(event) => updateRegisterForm('password', event.target.value)}
                    placeholder="Mindestens 6 Zeichen"
                  />
                </div>
                {notice && <div className={`account-notice ${notice.type}`}>{notice.text}</div>}
                <button className="btn-primary" disabled={submitting}>
                  {submitting ? 'Bitte warten …' : 'Account erstellen'}
                </button>
              </form>
            )}
          </section>

          <aside className="summary">
            <h4>Hinweis</h4>
            <div className="sum-row"><span className="sum-k">Auth</span><span className="sum-v">Firebase</span></div>
            <div className="sum-row"><span className="sum-k">Profil</span><span className="sum-v">users/uid</span></div>
            <div className="sum-row"><span className="sum-k">Passwort</span><span className="sum-v">nicht in Firestore</span></div>
          </aside>
        </div>
      )}
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────

const TWEAK_DEFAULTS = {
  gold: 70,
  bgMode: 'particles',
  headStyle: 'classic',
};

export default function App() {
  const [page, setPage] = useState('home');
  const [selectedWannado, setSelectedWannado] = useState(null);
  const [selectedPiercing, setSelectedPiercing] = useState(null);
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  const onBack = () => { setPage('home'); setSelectedWannado(null); setSelectedPiercing(null); };

  const onBookWannado = (item) => {
    setSelectedWannado(item);
    setSelectedPiercing(null);
    setPage('booking');
  };

  const onBookPiercing = (item) => {
    setSelectedPiercing(item);
    setSelectedWannado(null);
    setPage('booking');
  };

  return (
    <>
      {page === 'home'         && <Landing onNav={setPage} tweaks={t} />}
      {page === 'gallery'      && <Gallery onBack={onBack} />}
      {page === 'about'        && <About onBack={onBack} />}
      {page === 'booking'      && <Booking onBack={onBack} wannado={selectedWannado} piercing={selectedPiercing} />}
      {page === 'piercing'     && <PiercingPrices onBack={onBack} onBook={onBookPiercing} />}
      {page === 'testimonials' && <Testimonials onBack={onBack} />}
      {page === 'socials'      && <Socials onBack={onBack} />}
      {page === 'account'      && <Account onBack={onBack} />}
      {page === 'wannados'     && <WannaDos onBack={onBack} onBook={onBookWannado} />}

      <TweaksPanel title="Tweaks">
        <TweakSection label="Vibe" />
        <TweakSlider
          label="Gold-Intensität" unit="%"
          value={t.gold} min={20} max={100} step={5}
          onChange={(v) => setTweak('gold', v)}
        />
        <TweakRadio
          label="Hintergrund"
          value={t.bgMode}
          options={[
            { value: 'particles',   label: 'Sand'  },
            { value: 'hieroglyphs', label: 'Hiero' },
            { value: 'clean',       label: 'Clean' },
          ]}
          onChange={(v) => setTweak('bgMode', v)}
        />
        <TweakSection label="Kleopatra" />
        <TweakRadio
          label="3D-Stil"
          value={t.headStyle}
          options={[
            { value: 'classic', label: 'Classic' },
            { value: 'faceted', label: 'Faceted' },
            { value: 'smooth',  label: 'Smooth'  },
          ]}
          onChange={(v) => setTweak('headStyle', v)}
        />
      </TweaksPanel>
    </>
  );
}
