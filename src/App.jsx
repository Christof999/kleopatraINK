import { useState, useEffect, useRef, useId, lazy, Suspense } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { arrayUnion, doc, getDoc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import KleopatraHead from './components/KleopatraHead';
import Background from './components/Background';
import InstagramFeed from './components/InstagramFeed';
import CookieBanner from './components/CookieBanner';
import LanguageToggle from './components/LanguageToggle';
import { formatSegment } from './components/LuckyWheel';
import { WheelInviteModal, WheelModal } from './components/WheelModals';
import { Imprint, Privacy, SiteFooter } from './components/Legal';
import { useI18n } from './i18n';

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

const NAV_LAYOUT = [
  { id: 'gallery',      angle: -90  },
  { id: 'about',        angle: -45  },
  { id: 'booking',      angle:   0  },
  { id: 'piercing',     angle:  45  },
  { id: 'testimonials', angle:  90  },
  { id: 'socials',      angle: 150  },
  { id: 'wannados',     angle: 210  },
];

const EURO_LOCALES = { de: 'de-DE', en: 'en-IE', tr: 'tr-TR' };

function formatEuro(price, lang = 'de', onRequest = 'Preis auf Anfrage') {
  const value = Number(price);
  if (!Number.isFinite(value)) return onRequest;
  return new Intl.NumberFormat(EURO_LOCALES[lang] || 'de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

function getAuthErrorMessage(error, t) {
  const e = t.account.authError;
  switch (error?.code) {
    case 'auth/email-already-in-use':
      return e.emailInUse;
    case 'auth/invalid-email':
      return e.invalidEmail;
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return e.invalidCredential;
    case 'auth/weak-password':
      return e.weakPassword;
    default:
      return e.generic;
  }
}

const SPIN_DATE_LOCALES = { de: 'de-DE', en: 'en-GB', tr: 'tr-TR' };

function formatSpinDate(iso, lang = 'de') {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(SPIN_DATE_LOCALES[lang] || 'de-DE', {
    day: '2-digit', month: 'long', year: 'numeric',
  }).format(date);
}

function getFirstName(profile) {
  if (profile?.firstName) return profile.firstName;
  if (profile?.fullName) return profile.fullName.trim().split(/\s+/)[0] || '';
  return '';
}

function AccountStatus({ onAccount }) {
  const { user } = useAuth();
  const { t } = useI18n();
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
    ? t.landing.loggedInAs(firstName || user.displayName || user.email || 'User')
    : t.landing.accountLogin;

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
  const { t } = useI18n();
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

  const nav = NAV_LAYOUT.map((n) => ({ ...n, ...t.nav[n.id] }));

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
            <span className="brand-sub">{t.landing.brandSub}</span>
          </span>
        </h1>
        <div className="chrome-actions">
          <div className="chrome-meta" aria-hidden="true">
            {t.landing.meta.map((m) => <span key={m}>{m}</span>)}
          </div>
          <AccountStatus onAccount={() => onNav('account')} />
        </div>
      </header>

      <div className="composition" role="navigation" aria-label={t.landing.navAria}>
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

          {nav.map((n) => {
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

      <nav className="mobile-nav" aria-label={t.landing.navAria}>
        {nav.map((n) => (
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
        <div><a className="gold corner-tel" href="tel:+4998316842">+49 9831 6 84 21</a></div>
      </address>
      <div className="corner br" aria-hidden="true">
        <div>{t.landing.cornerConsult}</div>
        <div>{t.landing.cornerStyles1}</div>
        <div>{t.landing.cornerStyles2}</div>
      </div>

      <div className="tagline">
        <div className="tagline-kicker">{t.landing.taglineKicker}</div>
        <div className="tagline-main">{t.landing.taglineMain}</div>
      </div>
    </div>
  );
}

// ── Page shell ────────────────────────────────────────────────────────────────

function PageHead({ kicker, title, titleEm, meta, onBack }) {
  const { t } = useI18n();
  return (
    <>
      <button className="page-back" onClick={onBack}>{t.common.back}</button>
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
  const { t } = useI18n();
  const [filter, setFilter] = useState('Alle');
  const { items: allItems, loading } = useGallery();
  const items = filter === 'Alle' ? allItems : allItems.filter((i) => i.style === filter);

  const filterLabel = (f) => (f === 'Alle' ? t.common.all : f);

  return (
    <div className="page with-bg">
      <PageHead
        kicker={t.gallery.kicker}
        title={t.gallery.title} titleEm={t.gallery.titleEm}
        meta={<>
          <b>{loading ? '…' : allItems.length > 0 ? t.gallery.works(allItems.length) : t.common.soon}</b>
          <div>{t.gallery.years}</div>
        </>}
        onBack={onBack}
      />
      <div className="gal-filters" role="group" aria-label={t.gallery.filterAria}>
        {GAL_FILTERS.map((f) => (
          <button key={f}
            type="button"
            className={`gal-chip ${filter === f ? 'active' : ''}`}
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}>{filterLabel(f)}</button>
        ))}
      </div>
      {loading ? (
        <div className="fb-loading" role="status" aria-live="polite">
          <div className="ig-spinner" aria-hidden="true" />
          <span className="visually-hidden">{t.gallery.loadingAria}</span>
        </div>
      ) : items.length === 0 ? (
        <p className="gal-empty">
          {filter === 'Alle' ? t.gallery.emptyAll : t.gallery.emptyFilter(filter)}
        </p>
      ) : (
        <ul className="gal-grid" aria-label={t.gallery.worksAria(items.length)}>
          {items.map((it) => (
            <li key={it.id} className="gal-item">
              <img className="gal-img" src={it.src} alt={it.piece ? `${it.style}-Tattoo: ${it.piece}` : `${it.style}-Tattoo`} loading="lazy" />
              {(it.piece || it.style) && (
                <div className="gal-caption">
                  <div className="gal-caption-style">{it.style}</div>
                  {it.piece && <div className="gal-caption-piece">{it.piece}</div>}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── About ─────────────────────────────────────────────────────────────────────

function AboutSectionTitle({ children, style, id }) {
  return (
    <h3 className="about-section-title serif" style={style} id={id}>{children}</h3>
  );
}

const ABOUT_PHOTOS = {
  portrait: { src: '/Kleopatra.JPG' },
  studio1:  { src: '/Studio_1.JPG'  },
  studio2:  { src: '/Studio_2.JPG'  },
  pigments: { src: '/Farben.JPG'    },
};

function AboutPhoto({ src, alt, className }) {
  return (
    <figure className={className}>
      <img className="about-photo" src={src} alt={alt} loading="lazy" decoding="async" />
    </figure>
  );
}

function About({ onBack }) {
  const { t } = useI18n();
  const alts = t.about.photoAlts;
  return (
    <div className="page with-bg">
      <PageHead
        kicker={t.about.kicker}
        title={t.about.title} titleEm={t.about.titleEm}
        meta={<>
          <b>{t.about.metaLine1}</b>
          <div>{t.about.metaLine2}</div>
          <div>{t.about.metaLine3}</div>
        </>}
        onBack={onBack}
      />

      <AboutSectionTitle>{t.about.sectionAbout}</AboutSectionTitle>
      <div className="about-hero">
        <div className="about-copy">
          <p>{t.about.p1}</p>
          <p>{t.about.p2}</p>
          <p>{t.about.p3}</p>
        </div>
        <AboutPhoto
          className="about-hero-img"
          src={ABOUT_PHOTOS.portrait.src}
          alt={alts.portrait}
        />
      </div>

      <AboutSectionTitle>{t.about.sectionStudio}</AboutSectionTitle>
      <div className="about-studio-grid">
        <AboutPhoto
          className="about-studio-img"
          src={ABOUT_PHOTOS.studio1.src}
          alt={alts.studio1}
        />
        <AboutPhoto
          className="about-studio-img"
          src={ABOUT_PHOTOS.studio2.src}
          alt={alts.studio2}
        />
      </div>

      <div className="about-material">
        <AboutPhoto
          className="about-material-img"
          src={ABOUT_PHOTOS.pigments.src}
          alt={alts.pigments}
        />
        <div className="about-material-copy">
          <AboutSectionTitle style={{ marginBottom: 16 }}>{t.about.sectionMaterial}</AboutSectionTitle>
          <p>{t.about.material}</p>
        </div>
      </div>

      <div className="about-mv-grid">
        <section className="about-mv-block" aria-labelledby="about-mission-heading">
          <AboutSectionTitle style={{ marginBottom: 20 }} id="about-mission-heading">
            {t.about.sectionMission}
          </AboutSectionTitle>
          <p>{t.about.mission}</p>
        </section>
        <section className="about-mv-block" aria-labelledby="about-vision-heading">
          <AboutSectionTitle style={{ marginBottom: 20 }} id="about-vision-heading">
            {t.about.sectionVision}
          </AboutSectionTitle>
          <p>{t.about.vision}</p>
        </section>
      </div>
    </div>
  );
}

// ── Booking — Beratungstermin ─────────────────────────────────────────────────

const SLOTS = ['10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '19:00'];
const DISABLED = new Set(['13:00', '17:30']);

// ── Wanna-dos ─────────────────────────────────────────────────────────────────

const HAS_3D_BODY = true;

function WannaDos({ onBack, onBook }) {
  const { t } = useI18n();
  const [filter,   setFilter]   = useState('Alle');
  const [viewItem, setViewItem] = useState(null);
  const { items: allItems, loading } = useWannados();

  const available = allItems.filter((i) => i.available !== false);
  const items = filter === 'Alle'
    ? allItems
    : allItems.filter((i) => i.target === filter || i.target === 'Alle');

  const wd = t.wannados;

  return (
    <div className="page with-bg">
      <PageHead
        kicker={wd.kicker}
        title={wd.title} titleEm={wd.titleEm}
        meta={<>
          <b>{available.length > 0 ? wd.available(available.length) : t.common.soon}</b>
          <div>{wd.sub}</div>
        </>}
        onBack={onBack}
      />

      <div className="gal-filters" style={{ marginBottom: 32 }}>
        {['Alle', 'Frau', 'Mann'].map((f) => (
          <button key={f}
            className={`gal-chip ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >{wd.filters[f]}</button>
        ))}
      </div>

      {loading ? (
        <div className="fb-loading"><div className="ig-spinner" /></div>
      ) : items.length === 0 ? (
        <p className="gal-empty">
          {filter === 'Alle' ? wd.emptyAll : wd.emptyFilter(wd.filters[filter])}
        </p>
      ) : (
        <div className="wd-grid">
          {items.map((item) => (
            <div key={item.id} className={`wd-card${item.available === false ? ' wd-taken' : ''}${viewItem === item ? ' wd-viewing' : ''}`}>
              <div className="wd-img-wrap">
                <img src={item.src} alt={item.title} className="wd-img" loading="lazy" />
                {item.available === false && (
                  <div className="wd-overlay-taken">{wd.taken}</div>
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
                      {viewItem === item ? wd.active3d : wd.showOnBody}
                    </button>
                  )}
                  <button
                    className="wd-btn"
                    disabled={item.available === false}
                    onClick={() => item.available !== false && onBook(item)}
                  >
                    {item.available === false ? wd.taken : wd.iWantThis}
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
            <h3 className="wd-3d-title">{wd.visualizeTitle}</h3>
            <p className="wd-3d-sub">
              {viewItem ? wd.visualizeHint(viewItem.title) : wd.visualizeIdle}
            </p>
          </div>
          <Suspense fallback={<div className="body3d-loading">{wd.loading3d}</div>}>
            <Body3DViewer tatSrc={viewItem?.src ?? null} placement3d={viewItem?.placement3d ?? null} />
          </Suspense>
        </div>
      )}
    </div>
  );
}

// ── Piercing world ────────────────────────────────────────────────────────────

const GENERAL_PIERCING_ID = '__piercing_general__';

function buildGeneralPiercingRequest(t) {
  return {
    id: GENERAL_PIERCING_ID,
    title: t.piercing.generalRequest.title,
    desc: t.piercing.generalRequest.desc,
    price: null,
  };
}

const PIERCING_CATEGORY_IDS = ['ohr', 'nase', 'mund', 'gesicht', 'koerper'];
const PIERCING_GUIDE_LAYOUT = [
  { id: 'face', src: '/piercing-guide-face.jpg', aspect: '1 / 1' },
  { id: 'ear',  src: '/piercing-guide-ear.jpg',  aspect: '3 / 4' },
];

function PiercingHero({ onBook }) {
  const { t } = useI18n();
  const h = t.piercing.hero;
  return (
    <section className="piercing-hero">
      <div className="piercing-hero-logo-wrap">
        <img
          className="piercing-hero-logo"
          src="/LOGO_piercing.jpg"
          alt="Kleopatra INK · Piercing Studio Gunzenhausen"
        />
      </div>
      <div className="piercing-hero-copy">
        <div className="piercing-hero-kicker">{h.kicker}</div>
        <h1 className="piercing-hero-title">{h.title[0]}<br/><em>{h.title[1]}</em></h1>
        <p className="piercing-hero-lead">{h.lead}</p>
        <div className="piercing-hero-actions">
          <button type="button" className="pink-cta" onClick={() => onBook(buildGeneralPiercingRequest(t))}>
            {h.cta}
          </button>
          <a className="piercing-hero-tel" href="tel:+4917660957400">
            <span className="piercing-hero-tel-kicker">{h.callKicker}</span>
            <span className="piercing-hero-tel-num">0176 60957400</span>
          </a>
        </div>
      </div>
    </section>
  );
}

function PiercingCategories() {
  const { t } = useI18n();
  const c = t.piercing.categories;
  return (
    <section className="piercing-section piercing-cat-section">
      <div className="piercing-section-head">
        <span className="piercing-section-kicker">{c.kicker}</span>
        <h2 className="piercing-section-title">{c.title}</h2>
      </div>
      <dl className="piercing-cat-list">
        {PIERCING_CATEGORY_IDS.map((id, i) => {
          const cat = c.items[id];
          return (
            <div key={id} className="piercing-cat-row">
              <dt className="piercing-cat-row-label">
                <span className="piercing-cat-row-num">{String(i + 1).padStart(2, '0')}</span>
                {cat.label}
              </dt>
              <dd className="piercing-cat-row-examples" dangerouslySetInnerHTML={{ __html: cat.examples }} />
            </div>
          );
        })}
      </dl>
    </section>
  );
}

function PiercingGuide({ layout, index }) {
  const { t } = useI18n();
  const guide = t.piercing.guides[layout.id];
  const flipped = index % 2 === 1;
  return (
    <section className={`piercing-guide ${flipped ? 'is-flipped' : ''}`}>
      <figure className="piercing-guide-figure" style={{ aspectRatio: layout.aspect || '1 / 1' }}>
        <img
          src={layout.src}
          alt={guide.alt}
          loading="lazy"
          decoding="async"
        />
      </figure>
      <div className="piercing-guide-copy">
        <span className="piercing-section-kicker">{guide.kicker}</span>
        <h2 className="piercing-section-title">{guide.title}</h2>
        <p className="piercing-section-lead">{guide.copy}</p>
        <ul className="piercing-guide-spots">
          {guide.spots.map((s, i) => (
            <li key={i}>
              <span className="piercing-guide-dot" aria-hidden="true" />
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function PiercingHygiene() {
  const { t } = useI18n();
  const q = t.piercing.quality;
  return (
    <section className="piercing-section piercing-quality">
      <div className="piercing-section-head">
        <span className="piercing-section-kicker">{q.kicker}</span>
        <h2 className="piercing-section-title">{q.title}</h2>
      </div>
      <div className="piercing-quality-grid">
        {q.items.map((item, i) => {
          const num = String(i + 1).padStart(2, '0');
          return (
            <article key={num} className="piercing-quality-item">
              <div className="piercing-quality-num">{num}</div>
              <h3 className="piercing-quality-title">{item.title}</h3>
              <p className="piercing-quality-text">{item.text}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function PiercingPricesList({ items, loading, error, onBook }) {
  const { t, lang } = useI18n();
  const p = t.piercing.pricelist;
  return (
    <section className="piercing-section piercing-pricelist">
      <div className="piercing-section-head">
        <span className="piercing-section-kicker">{p.kicker}</span>
        <h2 className="piercing-section-title">{p.title}</h2>
        <p className="piercing-section-lead">{p.lead}</p>
      </div>

      {loading ? (
        <div className="fb-loading"><div className="ig-spinner" /></div>
      ) : error ? (
        <p className="gal-empty">{p.loadError}</p>
      ) : items.length === 0 ? (
        <p className="gal-empty">{p.empty}</p>
      ) : (
        <ul className="piercing-menu">
          {items.map((item) => (
            <li key={item.id} className="piercing-menu-item">
              <div className="piercing-menu-row">
                <h3 className="piercing-menu-title">{item.title}</h3>
                <span className="piercing-menu-dots" aria-hidden="true" />
                <span className="piercing-menu-price">{formatEuro(item.price, lang, t.piercing.priceOnRequest)}</span>
              </div>
              {item.desc && <p className="piercing-menu-desc">{item.desc}</p>}
              <button
                type="button"
                className="piercing-menu-link"
                onClick={() => onBook(item)}
              >
                {p.request}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function PiercingPrices({ onBack, onBook }) {
  const { t } = useI18n();
  const { items, loading, error } = usePiercingPrices();
  const f = t.piercing.finalCta;

  return (
    <div className="page with-bg theme-piercing">
      <PageHead
        kicker={t.piercing.pageKicker}
        title={t.piercing.pageTitle} titleEm={t.piercing.pageTitleEm}
        onBack={onBack}
      />

      <PiercingHero onBook={onBook} />
      <PiercingCategories />

      {PIERCING_GUIDE_LAYOUT.map((g, i) => (
        <PiercingGuide key={g.id} layout={g} index={i} />
      ))}

      <PiercingHygiene />
      <PiercingPricesList items={items} loading={loading} error={error} onBook={onBook} />

      <section className="piercing-final-cta">
        <h2 className="piercing-section-title">{f.title}</h2>
        <p className="piercing-section-lead">{f.lead}</p>
        <button type="button" className="pink-cta" onClick={() => onBook(buildGeneralPiercingRequest(t))}>
          {f.cta}
        </button>
      </section>
    </div>
  );
}

// ── Booking ───────────────────────────────────────────────────────────────────

function Booking({ onBack, wannado, piercing }) {
  const { t, lang } = useI18n();
  const b = t.booking;
  const { user } = useAuth();
  const [interest, setInterest] = useState('unsure');
  const [slot, setSlot] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [desc, setDesc] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const isPiercingBooking = !!piercing;
  const ids = {
    name:  useId(),
    email: useId(),
    phone: useId(),
    desc:  useId(),
  };

  useEffect(() => {
    if (isPiercingBooking) {
      setInterest('piercing');
      setDesc((current) => current || `${b.bannerPiercingLabel}: ${piercing.title}${piercing.desc ? ` — ${piercing.desc}` : ''}`);
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
      <div className={`page with-bg${isPiercingBooking ? ' theme-piercing' : ''}`} style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
        <div style={{ maxWidth: 540, textAlign: 'center', padding: '20px' }}>
          <div className="page-kicker">{isPiercingBooking ? b.sentPiercingKicker : b.sentConsultKicker}</div>
          <h1 className="page-title" style={{ marginBottom: 24 }}>{b.sentTitle} <em>{b.sentTitleEm}</em></h1>
          <p className="cormorant" style={{ fontSize: 20, color: 'var(--ivory)', opacity: 0.9, lineHeight: 1.5 }}>
            {b.sentBody(email || b.sentEmailFallback)}
          </p>
          <button className="page-back" style={{ marginTop: 32 }} onClick={onBack}>{t.common.backToSite}</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`page with-bg${isPiercingBooking ? ' theme-piercing' : ''}`}>
      <PageHead
        kicker={isPiercingBooking ? b.kickerPiercing : b.kickerConsult}
        title={isPiercingBooking ? b.titlePiercing : b.titleConsult}
        titleEm={isPiercingBooking ? b.titlePiercingEm : b.titleConsultEm}
        meta={<>
          <b>{isPiercingBooking ? b.metaRequest : b.metaDuration}</b>
          <div>{isPiercingBooking ? piercing.title : b.metaFree}</div>
          <div>{b.metaNonbinding}</div>
        </>}
        onBack={onBack}
      />
      {wannado && (
        <div className="wd-booking-banner">
          <img src={wannado.src} alt={wannado.title} className="wd-booking-img" />
          <div>
            <div className="wd-booking-label">{b.bannerWannadoLabel}</div>
            <div className="wd-booking-name">{wannado.title}</div>
            <div className="wd-booking-meta">{wannado.style} · {wannado.placement}</div>
          </div>
        </div>
      )}
      {piercing && (
        <div className="wd-booking-banner piercing-booking-banner">
          <div>
            <div className="wd-booking-label">{b.bannerPiercingLabel}</div>
            <div className="wd-booking-name">{piercing.title}</div>
            <div className="wd-booking-meta">
              {piercing.desc ? `${piercing.desc} · ` : ''}{formatEuro(piercing.price, lang, t.piercing.priceOnRequest)}
            </div>
          </div>
        </div>
      )}

      <div className="book-intro">
        <p className="cormorant">
          {isPiercingBooking ? b.introPiercing : b.introConsult}
        </p>
      </div>
      <div className="booking-wrap">
        <div className="book-col">
          <h3>{b.step1}</h3>
          {isPiercingBooking ? (
            <div className="booking-selected-service">
              <div className="booking-selected-label">{b.selectedPiercing}</div>
              <div className="booking-selected-title">{piercing.title}</div>
              {piercing.desc && <div className="booking-selected-desc">{piercing.desc}</div>}
            </div>
          ) : (
            <div className="style-grid" role="radiogroup" aria-label={b.interestAria}>
              {b.interests.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  role="radio"
                  aria-checked={interest === s.id}
                  className={`style-card ${interest === s.id ? 'selected' : ''}`}
                  onClick={() => setInterest(s.id)}
                >
                  <span className="style-name">{s.name}</span>
                </button>
              ))}
            </div>
          )}

          <h3 style={{ marginTop: 36 }}>{b.step2}</h3>
          <div className="slot-grid" role="radiogroup" aria-label={b.slotAria}>
            {SLOTS.map((s) => (
              <button key={s}
                type="button"
                role="radio"
                aria-checked={slot === s}
                className={`slot ${slot === s ? 'selected' : ''} ${DISABLED.has(s) ? 'disabled' : ''}`}
                disabled={DISABLED.has(s)}
                aria-disabled={DISABLED.has(s)}
                onClick={() => setSlot(s)}>{s}</button>
            ))}
          </div>
          <div style={{ fontSize: 10, color: 'var(--ivory-dim)', letterSpacing: '0.08em', marginBottom: 24, marginTop: -8 }}>
            {b.slotNote}
          </div>

          <h3 style={{ marginTop: 12 }}>{b.step3}</h3>
          <div className="field">
            <label htmlFor={ids.name}>{b.labelName}</label>
            <input id={ids.name} type="text" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder={b.phName} />
          </div>
          <div className="field">
            <label htmlFor={ids.email}>{b.labelEmail}</label>
            <input id={ids.email} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={b.phEmail} />
          </div>
          <div className="field">
            <label htmlFor={ids.phone}>{b.labelPhone} <span style={{ opacity: 0.5, textTransform: 'none', letterSpacing: 0 }}>{b.optional}</span></label>
            <input id={ids.phone} type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={b.phPhone} />
          </div>
          <div className="field">
            <label htmlFor={ids.desc}>{b.labelIdea}</label>
            <textarea id={ids.desc} rows={4} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder={b.phIdea} />
          </div>
        </div>

        <div className="summary">
          <h4>{b.summaryTitle}</h4>
          <div className="sum-row"><span className="sum-k">{b.sumKind}</span><span className="sum-v">{isPiercingBooking ? b.sumKindPiercing : b.sumKindConsult}</span></div>
          <div className="sum-row"><span className="sum-k">{b.sumTopic}</span><span className="sum-v">{isPiercingBooking ? piercing.title : b.interests.find((s) => s.id === interest)?.name}</span></div>
          {name && <div className="sum-row"><span className="sum-k">{b.sumName}</span><span className="sum-v">{name}</span></div>}
          <div className="sum-row"><span className="sum-k">{b.sumDate}</span><span className={`sum-v ${slot ? '' : 'empty'}`}>{slot ? b.sumDateValue(slot) : b.sumDateEmpty}</span></div>
          <div className="sum-row"><span className="sum-k">{b.sumDuration}</span><span className="sum-v">{b.sumDurationValue}</span></div>
          <div className="sum-row"><span className="sum-k">{b.sumCost}</span><span className="sum-v gold">{isPiercingBooking ? formatEuro(piercing.price, lang, t.piercing.priceOnRequest) : b.metaFree}</span></div>
          <button
            type="button"
            className="btn-primary"
            style={{ marginTop: 24, opacity: (slot && name && email) ? 1 : 0.4, cursor: (slot && name && email) ? 'pointer' : 'not-allowed' }}
            disabled={!(slot && name && email)}
            aria-disabled={!(slot && name && email)}
            onClick={() => setSubmitted(true)}>
            {isPiercingBooking ? b.submitPiercing : b.submitConsult}
          </button>
          <p style={{ marginTop: 14, fontSize: 10, color: 'var(--ivory-dim)', letterSpacing: '0.06em', lineHeight: 1.5 }}>
            {b.disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Testimonials ──────────────────────────────────────────────────────────────

const TESTIS = [
  { name: 'Sam78',           ago: { n: 6, unit: 'month' }, stars: 5, text: 'Super sympathisches Tattoo-Studio! Hat uns als Familie total ernst genommen und unsere Wünsche ehrlich und professionell beurteilt, sodass wir alle mit einem tollen Ergebnis nach Hause gegangen sind.' },
  { name: 'Janine',          ago: { n: 9, unit: 'month' }, stars: 5, text: 'Bin absolut begeistert. Ich war vor 2 Wochen in diesem Tattoostudio, um mir mein allererstes Tattoo stechen zu lassen. Es wurde mir empfohlen und ich bekam echt das beste Ergebnis, das ich mir vorstellen konnte.' },
  { name: 'Mareen Bickel',   ago: { n: 7, unit: 'month' }, stars: 5, text: 'Ich habe mir heute ein Tattoo bei den beiden stechen lassen und ein weiteres verschönern. Ich bin mehr als begeistert und meeeega happy damit! Besser hätte man es nicht umsetzen können.' },
  { name: 'Sina Le',         ago: { n: 9, unit: 'month' }, stars: 5, text: 'Hier kommt man gerne her. Super lieb, tolle Atmosphäre und geniale Umsetzung. Bin einfach begeistert.' },
  { name: 'Angela Weidner',  ago: { n: 3, unit: 'year'  }, stars: 5, text: 'Super Arbeit richtige Kunstwerke werden da gemacht. Ich habe 4 Tattoos stechen lassen und jedes einzelne ist so schön geworden. Man nimmt sich total viel Zeit für jeden Kunden.' },
  { name: 'Sven Höfler',     ago: { n: 1, unit: 'year'  }, stars: 5, text: 'Das Studio wurde mir empfohlen und ich muss sagen, dass mein Tattoo absolut Klasse geworden ist. Vom Beratungsgespräch bis zum Endergebnis ist absolute Professionalität zu spüren.' },
  { name: 'Laura-Jane Büscher', ago: { n: 2, unit: 'year' }, stars: 5, text: 'Bin mehr als zufrieden mit meinem Tattoo. Sehr präzise und professionell gestochen.' },
  { name: 'Klara Popp',      ago: { n: 2, unit: 'year'  }, stars: 5, text: 'Das Studio wurde mir von meiner Freundin empfohlen. Hinter einem unscheinbaren Studio steckt absolute Leidenschaft und Professionalität!' },
  { name: 'Frank Carlet',    ago: { n: 2, unit: 'year'  }, stars: 5, text: 'Ich habe heute mein erstes Tattoo bekommen. Das Studio wurde mir von einer Freundin empfohlen und ich traf auf einen Künstler der seine Arbeit mit totaler Hingabe ausführt.' },
  { name: 'Maria Sillinger', ago: { n: 3, unit: 'year'  }, stars: 5, text: 'Ich hatte nur einen Termin zur Besprechung, aber da er Zeit hatte, hat er mir das Tattoo direkt ohne neuen Termin gestochen, war echt super.' },
  { name: 'Jürgen M.',       ago: { n: 3, unit: 'year'  }, stars: 5, text: 'Sehr tollen Eindruck von dort bekommen und es ist ganz einfach zu finden. Meine Erwartungen wurden übertroffen 👍 einfach genial.' },
  { name: 'Melany Deinzer',  ago: { n: 2, unit: 'year'  }, stars: 5, text: 'Absolut tolle und freundliche Beratung. Wurde so herzlich und lieb behandelt. Alles ist absolut professionell und auch das Stechen hat super wunderbar funktioniert.' },
  { name: 'Jannis Rabus',    ago: { n: 3, unit: 'year'  }, stars: 5, text: 'Durch Zufall auf diesen KÜNSTLER gestoßen. Seine Arbeit ist mehr als perfekt, nimmt sich Zeit für seinen Kunden und geht auf jeden Wunsch ein.' },
  { name: 'Thomas',          ago: { n: 3, unit: 'year'  }, stars: 5, text: 'Ich bin durch meinen besten Freund an dieses Studio geraten — und wahnsinnig glücklich darüber!' },
  { name: 'Vanessa Zapke',   ago: { n: 3, unit: 'year'  }, stars: 5, text: 'Bin sehr begeistert. Ganz liebe Besitzer und ein sauberes Studio. Man fühlt sich von Anfang an sehr wohl und gut aufgehoben. Eine super Beratung im Vorfeld.' },
  { name: 'Julia M.',        ago: { n: 2, unit: 'year'  }, stars: 5, text: 'Ich bin mehr als zufrieden. Mein Tattoo ist sehr sauber gestochen und war innerhalb kürzester Zeit ohne Komplikationen abgeheilt. Ich bin absolut glücklich damit und bereue es keine Sekunde. Gerne wieder ❤️' },
  { name: 'Celine Weissmann',ago: { n: 2, unit: 'year'  }, stars: 5, text: 'Ich bin mega zufrieden mit meinem Tattoo. Alle beide sind super sympathisch und wissen genau was sie machen. Es wurde super beraten und man bekommt schnell einen Termin.' },
  { name: 'Lisa',            ago: { n: 4, unit: 'year'  }, stars: 5, text: 'Super tolles Team! Mega saubere, akkurate Arbeit und immer freundlich. Sind aus Sachsen und zufällig auf dieses Tattoostudio gestoßen. Beide waren sehr herzlich und zuvorkommend.' },
  { name: 'Sabrina Fichtner',ago: { n: 3, unit: 'year'  }, stars: 5, text: 'TOP Tattoostudio! Kompetente und freundliche Beratung, ich bin was Tattoos angeht durch ganz Deutschland getingelt, meine Motive wurden aber nie so umgesetzt wie hier.' },
  { name: 'Evelyn Root',     ago: { n: 2, unit: 'year'  }, stars: 5, text: 'Ich war heute mittlerweile zum fünften Mal dort. Ich kann dieses Studio jedem wirklich nur ans Herz legen, mit Abstand das beste Studio in dem ich bisher war.' },
  { name: 'S. Winkler',      ago: { n: 3, unit: 'year'  }, stars: 5, text: 'Absolut empfehlenswert, die Besitzer sind sehr freundlich und kommen gerne den Wünschen nach. Mein Beratungstermin wurde anschließend direkt zum Tattoo-Termin.' },
  { name: 'Sigrid Grüner',   ago: { n: 1, unit: 'year'  }, stars: 5, text: 'Tolle Arbeit, super nett. Sehr talentiert. Mega Ergebnis. Seine Frau macht Termine und sie ist sehr freundlich und hat die angenehmste Stimme die ich je hörte am Telefon.' },
  { name: 'Kipfl',           ago: { n: 2, unit: 'year'  }, stars: 5, text: '100% Vertrauen in ein Cover-Up gelegt und nicht enttäuscht worden! Super Studio, modern und sauber — der Tätowierer ist unfassbar begabt.' },
];

function Testimonials({ onBack }) {
  const { t } = useI18n();
  const te = t.testimonials;
  return (
    <div className="page with-bg">
      <PageHead
        kicker={te.kicker}
        title={te.title} titleEm={te.titleEm}
        meta={<>
          <b>{te.rating}</b>
          <div>{te.count}</div>
          <div>{te.source}</div>
        </>}
        onBack={onBack}
      />
      <div className="testi-grid">
        {TESTIS.map((item, i) => (
          <div key={i} className="testi">
            <div className="testi-stars">{'★'.repeat(item.stars)}{'☆'.repeat(5 - item.stars)}</div>
            <div className="testi-quote">{item.text}</div>
            <div className="testi-meta">
              <div className="testi-name">{item.name}</div>
              <div className="testi-info">{te.ago(item.ago.n, item.ago.unit)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Socials ───────────────────────────────────────────────────────────────────

function Socials({ onBack }) {
  const { t } = useI18n();
  return (
    <div className="page with-bg">
      <PageHead
        kicker={t.socials.kicker}
        title={t.socials.title} titleEm={t.socials.titleEm}
        meta={<>
          <div>{t.socials.metaDaily}</div>
          <div>{t.socials.metaDm}</div>
        </>}
        onBack={onBack}
      />
      <InstagramFeed />
    </div>
  );
}

// ── Account ───────────────────────────────────────────────────────────────────

function Account({ onBack, onOpenWheel, wheelEligible = false, wheelConfigReady = false, wheelHistory = [] }) {
  const { t, lang } = useI18n();
  const a = t.account;
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
      setNotice({ type: 'success', text: a.notice.loggedIn });
    } catch (error) {
      setNotice({ type: 'error', text: getAuthErrorMessage(error, t) });
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
      setNotice({ type: 'success', text: a.notice.accountCreated });
      if (onOpenWheel) {
        setTimeout(() => onOpenWheel(), 700);
      }
    } catch (error) {
      const isLoggedInAfterRegister = auth.currentUser?.email?.toLowerCase() === email;
      setNotice({
        type: isLoggedInAfterRegister ? 'warning' : 'error',
        text: isLoggedInAfterRegister
          ? a.notice.registerNoProfile
          : getAuthErrorMessage(error, t),
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
      setNotice({ type: 'success', text: a.notice.profileSaved });
    } catch (error) {
      console.error('[Account] User profile save failed:', error);
      setNotice({ type: 'error', text: a.notice.profileSaveFailed });
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
      setNotice({ type: 'success', text: a.notice.loggedOut });
    } catch (error) {
      setNotice({ type: 'error', text: a.notice.logoutFailed });
    } finally {
      setSubmitting(false);
    }
  };

  const firstName = getFirstName(profile) || user?.displayName || '';
  const lastName = profile?.lastName || '';
  const phone = profile?.phone || '';
  const email = profile?.email || user?.email || '';
  const displayName = firstName || a.defaultName;

  return (
    <div className="page with-bg">
      <PageHead
        kicker={a.kicker}
        title={a.title} titleEm={a.titleEm}
        meta={<>
          <b>{user ? a.metaLoggedIn : a.metaLogin}</b>
          <div>{a.metaAuth}</div>
          <div>{a.metaProfile}</div>
        </>}
        onBack={onBack}
      />

      {!firebaseConfigured ? (
        <p className="gal-empty">{a.notConfigured}</p>
      ) : authLoading ? (
        <div className="fb-loading"><div className="ig-spinner" /></div>
      ) : user ? (
        <div className="account-layout">
          <section className="account-panel">
            <div className="account-kicker">{a.loggedInAs}</div>
            <h2 className="account-title">{profileLoading && !firstName ? a.profileLoading : displayName}</h2>
            <p className="account-copy">{a.profileIntro}</p>
            {notice && <div className={`account-notice ${notice.type}`}>{notice.text}</div>}
            <form className="account-form account-profile-form" onSubmit={handleProfileSave}>
              <div className="account-form-grid">
                <div className="field">
                  <label>{a.firstName}</label>
                  <input
                    type="text"
                    autoComplete="given-name"
                    required
                    value={profileForm.firstName}
                    onChange={(event) => updateProfileForm('firstName', event.target.value)}
                    placeholder={a.firstName}
                  />
                </div>
                <div className="field">
                  <label>{a.lastName}</label>
                  <input
                    type="text"
                    autoComplete="family-name"
                    required
                    value={profileForm.lastName}
                    onChange={(event) => updateProfileForm('lastName', event.target.value)}
                    placeholder={a.lastName}
                  />
                </div>
              </div>
              <div className="field">
                <label>{a.phone}</label>
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
                <label>{a.emailInProfile}</label>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={profileForm.email}
                  onChange={(event) => updateProfileForm('email', event.target.value)}
                  placeholder={t.booking.phEmail}
                />
              </div>
              <div className="account-actions">
                <button className="btn-primary" disabled={submitting}>
                  {submitting ? t.common.pleaseWait : a.saveProfile}
                </button>
                <button className="account-secondary-btn" type="button" onClick={handleLogout} disabled={submitting}>
                  {a.logout}
                </button>
              </div>
            </form>

            {wheelEligible && (
              <button
                type="button"
                className={`account-gluecksrad-cta${wheelConfigReady ? '' : ' is-pending'}`}
                onClick={() => { if (wheelConfigReady && onOpenWheel) onOpenWheel(); }}
                disabled={!wheelConfigReady}
              >
                <span className="account-gluecksrad-cta-kicker">
                  {wheelConfigReady ? a.wheelExclusive : a.wheelSoon}
                </span>
                <span className="account-gluecksrad-cta-title">
                  {wheelConfigReady ? a.wheelOpen : a.wheelPreparing}
                </span>
                <span className="account-gluecksrad-cta-sub">
                  {wheelConfigReady ? a.wheelOpenSub : a.wheelPendingSub}
                </span>
              </button>
            )}

            {wheelHistory.length > 0 && (
              <div className="account-vouchers">
                <div className="account-vouchers-head">
                  <span className="account-vouchers-kicker">{a.yourWins}</span>
                  <span className="account-vouchers-count">{wheelHistory.length} {wheelHistory.length === 1 ? a.entry : a.entries}</span>
                </div>
                <ul className="account-vouchers-list">
                  {[...wheelHistory].reverse().map((entry) => (
                    <li key={entry.id} className={`account-voucher ${entry.redeemed ? 'is-redeemed' : 'is-open'}`}>
                      <div className="account-voucher-main">
                        <div className="account-voucher-value">{formatSegment(entry)}</div>
                        {entry.label && entry.type !== 'text' && (
                          <div className="account-voucher-label">{entry.label}</div>
                        )}
                        <div className="account-voucher-date">
                          {a.spunOn(formatSpinDate(entry.spunAt, lang))}
                        </div>
                      </div>
                      <div className="account-voucher-state">
                        {entry.redeemed ? (
                          <>
                            <span className="account-voucher-state-dot" aria-hidden="true" />
                            <span>{a.redeemed(entry.redeemedAt ? formatSpinDate(entry.redeemedAt, lang) : '')}</span>
                          </>
                        ) : (
                          <>
                            <span className="account-voucher-state-dot open" aria-hidden="true" />
                            <span>{a.stillOpen}</span>
                          </>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="account-vouchers-hint">{a.winsHint}</p>
              </div>
            )}
          </section>

          <aside className="summary">
            <h4>{a.summaryProfile}</h4>
            <div className="sum-row"><span className="sum-k">{a.email}</span><span className="sum-v account-email-value">{email}</span></div>
            <div className="sum-row"><span className="sum-k">{a.summaryFirstName}</span><span className={`sum-v ${firstName ? '' : 'empty'}`}>{firstName || a.notSet}</span></div>
            <div className="sum-row"><span className="sum-k">{a.summaryLastName}</span><span className={`sum-v ${lastName ? '' : 'empty'}`}>{lastName || a.notSet}</span></div>
            <div className="sum-row"><span className="sum-k">{a.summaryPhone}</span><span className={`sum-v ${phone ? '' : 'empty'}`}>{phone || a.notSet}</span></div>
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
                {a.tabLogin}
              </button>
              <button
                className={`gal-chip ${mode === 'register' ? 'active' : ''}`}
                type="button"
                onClick={() => { setMode('register'); setNotice(null); }}
              >
                {a.tabRegister}
              </button>
            </div>

            {mode === 'login' ? (
              <form className="account-form" onSubmit={handleLogin}>
                <div className="field">
                  <label>{a.email}</label>
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    value={loginForm.email}
                    onChange={(event) => updateLoginForm('email', event.target.value)}
                    placeholder={t.booking.phEmail}
                  />
                </div>
                <div className="field">
                  <label>{a.password}</label>
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
                  {submitting ? t.common.pleaseWait : a.login}
                </button>
              </form>
            ) : (
              <form className="account-form" onSubmit={handleRegister}>
                <div className="account-form-grid">
                  <div className="field">
                    <label>{a.firstName}</label>
                    <input
                      type="text"
                      autoComplete="given-name"
                      required
                      value={registerForm.firstName}
                      onChange={(event) => updateRegisterForm('firstName', event.target.value)}
                      placeholder={a.phFirstName}
                    />
                  </div>
                  <div className="field">
                    <label>{a.lastName}</label>
                    <input
                      type="text"
                      autoComplete="family-name"
                      required
                      value={registerForm.lastName}
                      onChange={(event) => updateRegisterForm('lastName', event.target.value)}
                      placeholder={a.phLastName}
                    />
                  </div>
                </div>
                <div className="field">
                  <label>{a.phone}</label>
                  <input
                    type="tel"
                    autoComplete="tel"
                    required
                    value={registerForm.phone}
                    onChange={(event) => updateRegisterForm('phone', event.target.value)}
                    placeholder={a.phPhoneReg}
                  />
                </div>
                <div className="field">
                  <label>{a.email}</label>
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    value={registerForm.email}
                    onChange={(event) => updateRegisterForm('email', event.target.value)}
                    placeholder={t.booking.phEmail}
                  />
                </div>
                <div className="field">
                  <label>{a.password}</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={registerForm.password}
                    onChange={(event) => updateRegisterForm('password', event.target.value)}
                    placeholder={a.phPassword}
                  />
                </div>
                {notice && <div className={`account-notice ${notice.type}`}>{notice.text}</div>}
                <button className="btn-primary" disabled={submitting}>
                  {submitting ? t.common.pleaseWait : a.createAccount}
                </button>
              </form>
            )}
          </section>

          <aside className="summary">
            <h4>{a.hint}</h4>
            <div className="sum-row"><span className="sum-k">Auth</span><span className="sum-v">Firebase</span></div>
            <div className="sum-row"><span className="sum-k">{a.summaryProfile}</span><span className="sum-v">users/uid</span></div>
            <div className="sum-row"><span className="sum-k">{a.password}</span><span className="sum-v">Firestore ✗</span></div>
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

function getInviteStorageKey(uid, opportunityIndex) {
  return `kleopatra:wheelInvite:${uid}:${opportunityIndex}`;
}

export default function App() {
  const { t } = useI18n();
  const [page, setPage] = useState('home');
  const [selectedWannado, setSelectedWannado] = useState(null);
  const [selectedPiercing, setSelectedPiercing] = useState(null);
  const [tw, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const mainRef = useRef(null);

  const { user } = useAuth();
  const [wheelConfig, setWheelConfig] = useState(null);
  const [wheelConfigLoaded, setWheelConfigLoaded] = useState(!db);
  const [wheelUserData, setWheelUserData] = useState(null);
  const [wheelUserLoaded, setWheelUserLoaded] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [wheelOpen, setWheelOpen] = useState(false);
  const [wheelSaving, setWheelSaving] = useState(false);
  const [wheelSaveError, setWheelSaveError] = useState(null);
  const [wheelJustWon, setWheelJustWon] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  useEffect(() => {
    document.title = t.pageTitles[page] || t.pageTitles.home;
  }, [page, t]);

  useEffect(() => {
    if (!db) {
      setWheelConfigLoaded(true);
      return undefined;
    }
    return onSnapshot(
      doc(db, 'wheelConfig', 'main'),
      (snap) => {
        setWheelConfig(snap.exists() ? snap.data() : null);
        setWheelConfigLoaded(true);
      },
      (err) => {
        console.warn('[App] wheelConfig snapshot failed:', err);
        setWheelConfigLoaded(true);
      },
    );
  }, []);

  useEffect(() => {
    if (!user || !db) {
      setWheelUserData(null);
      setWheelUserLoaded(!user);
      return undefined;
    }
    setWheelUserLoaded(false);
    return onSnapshot(
      doc(db, 'users', user.uid),
      (snap) => {
        setWheelUserData(snap.exists() ? snap.data() : null);
        setWheelUserLoaded(true);
      },
      (err) => {
        console.warn('[App] user snapshot failed:', err);
        setWheelUserLoaded(true);
      },
    );
  }, [user]);

  const wheelHistory = Array.isArray(wheelUserData?.wheelSpinHistory)
    ? wheelUserData.wheelSpinHistory
    : [];
  const wheelEligible =
    !!user && wheelUserLoaded && wheelUserData?.wheelSpinAvailable !== false;
  const wheelConfigReady =
    wheelConfigLoaded
    && !!wheelConfig
    && wheelConfig.active !== false
    && Array.isArray(wheelConfig.segments)
    && wheelConfig.segments.length > 0;
  const canSpin = wheelEligible && wheelConfigReady;

  useEffect(() => {
    if (!user) {
      setInviteOpen(false);
      setWheelOpen(false);
      setWheelJustWon(null);
      setWheelSaveError(null);
      return;
    }
    if (!canSpin) return;
    if (wheelOpen || inviteOpen) return;

    const storageKey = getInviteStorageKey(user.uid, wheelHistory.length);
    let alreadyShown = false;
    try {
      alreadyShown = sessionStorage.getItem(storageKey) === '1';
    } catch {
      alreadyShown = false;
    }
    if (alreadyShown) return;

    setInviteOpen(true);
    try {
      sessionStorage.setItem(storageKey, '1');
    } catch {
      // ignore — sessionStorage might be blocked
    }
  }, [user, canSpin, wheelOpen, inviteOpen, wheelHistory.length]);

  const openWheelModal = () => {
    setInviteOpen(false);
    setWheelSaveError(null);
    setWheelJustWon(null);
    setWheelOpen(true);
  };

  const closeWheelModal = () => {
    setWheelOpen(false);
    setWheelJustWon(null);
    setWheelSaveError(null);
  };

  const handleSpinResult = async (segment) => {
    if (wheelSaving || !user || !db) return;
    if (wheelUserData?.wheelSpinAvailable === false) return;

    setWheelSaving(true);
    setWheelSaveError(null);

    const rand = Math.random().toString(36).slice(2, 8);
    const entry = {
      id: `spin_${Date.now()}_${rand}`,
      spunAt: new Date().toISOString(),
      segmentId: segment.id,
      label: segment.label || '',
      type: segment.type || 'text',
      ...(segment.value !== undefined && segment.value !== null
        ? { value: Number(segment.value) }
        : {}),
      redeemed: false,
      redeemedAt: null,
    };

    try {
      await setDoc(
        doc(db, 'users', user.uid),
        {
          wheelSpinHistory: arrayUnion(entry),
          wheelSpinAvailable: false,
          wheelUpdatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      setWheelJustWon(entry);
    } catch (err) {
      console.error('[App] Spin write failed:', err);
      setWheelSaveError(t.wheel.spin.saveError);
    } finally {
      setWheelSaving(false);
    }
  };

  const inviteFirstName = getFirstName(wheelUserData) || user?.displayName || '';

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

  const goTo = (target) => {
    setPage(target);
    if (target !== 'booking') {
      setSelectedWannado(null);
      setSelectedPiercing(null);
    }
  };

  return (
    <>
      <a href="#main-content" className="skip-link">{t.common.skipLink}</a>

      <LanguageToggle />

      <main id="main-content" ref={mainRef} tabIndex={-1}>
        {page === 'home'         && <Landing onNav={goTo} tweaks={tw} />}
        {page === 'gallery'      && <Gallery onBack={onBack} />}
        {page === 'about'        && <About onBack={onBack} />}
        {page === 'booking'      && <Booking onBack={onBack} wannado={selectedWannado} piercing={selectedPiercing} />}
        {page === 'piercing'     && <PiercingPrices onBack={onBack} onBook={onBookPiercing} />}
        {page === 'testimonials' && <Testimonials onBack={onBack} />}
        {page === 'socials'      && <Socials onBack={onBack} />}
        {page === 'account'      && (
          <Account
            onBack={onBack}
            onOpenWheel={wheelEligible ? openWheelModal : null}
            wheelEligible={wheelEligible}
            wheelConfigReady={wheelConfigReady}
            wheelHistory={wheelHistory}
          />
        )}
        {page === 'wannados'     && <WannaDos onBack={onBack} onBook={onBookWannado} />}
        {page === 'imprint'      && <Imprint onBack={onBack} />}
        {page === 'privacy'      && <Privacy onBack={onBack} />}
      </main>

      <SiteFooter onNav={goTo} />

      <WheelInviteModal
        open={inviteOpen}
        firstName={inviteFirstName}
        onAccept={openWheelModal}
        onDismiss={() => setInviteOpen(false)}
      />

      <WheelModal
        open={wheelOpen}
        segments={wheelConfig?.segments || []}
        saving={wheelSaving}
        saveError={wheelSaveError}
        justWon={wheelJustWon}
        onSpinResult={handleSpinResult}
        onClose={closeWheelModal}
      />

      <CookieBanner onOpenPrivacy={() => goTo('privacy')} />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Vibe" />
        <TweakSlider
          label="Gold-Intensität" unit="%"
          value={tw.gold} min={20} max={100} step={5}
          onChange={(v) => setTweak('gold', v)}
        />
        <TweakRadio
          label="Hintergrund"
          value={tw.bgMode}
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
          value={tw.headStyle}
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
