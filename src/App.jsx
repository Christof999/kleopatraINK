import { useState, useEffect, useRef } from 'react';
import KleopatraHead from './components/KleopatraHead';
import Background from './components/Background';
import { useTweaks, TweaksPanel, TweakSection, TweakSlider, TweakRadio } from './components/TweaksPanel';
import './styles.css';

const NAV = [
  { id: 'gallery',      label: 'Galerie',        sub: 'Werke',       angle: -90  },
  { id: 'about',        label: 'Das sind wir',   sub: 'Studio',      angle: -18  },
  { id: 'booking',      label: 'Termin buchen',  sub: 'Appointment', angle:  54  },
  { id: 'testimonials', label: 'Unsere Kunden',  sub: 'Stimmen',     angle: 126  },
  { id: 'socials',      label: 'Unsere Sozials', sub: 'Follow',      angle: 198  },
];

// ── Landing ───────────────────────────────────────────────────────────────────

function Landing({ onNav, tweaks }) {
  const dialRef = useRef(null);
  const [dialSize, setDialSize] = useState(600);

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
          <div className="brand-mark">K</div>
          <div>KLEOPATRA <span style={{ color: 'var(--ivory-dim)' }}>INK</span></div>
        </div>
        <div className="chrome-meta">
          <span>EST 2018</span>
          <span>GUNZENHAUSEN</span>
          <span>DI — SA</span>
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

          <div className="head-halo" />
          <div className="head-slot">
            <KleopatraHead style={tweaks.headStyle} goldIntensity={tweaks.gold} />
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
                onMouseEnter={(e) => e.currentTarget.classList.add('is-hover')}
                onMouseLeave={(e) => e.currentTarget.classList.remove('is-hover')}
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

      <div className="corner bl">
        <div>Marktplatz 7</div>
        <div>91710 Gunzenhausen</div>
        <div><span className="gold">+49 9831 6 84 21</span></div>
      </div>
      <div className="corner br">
        <div>Beratung · Termin</div>
        <div>Blackwork · Fineline</div>
        <div>Ornamental · Script</div>
      </div>

      <div className="tagline">
        <div className="tagline-kicker">BEWAHRE DEINE GESCHICHTE</div>
        <div className="tagline-main">Tinte, die nicht vergisst.</div>
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

const GAL_ITEMS = [
  { style: 'Blackwork', piece: 'Sleeve, Unterarm' },
  { style: 'Fineline',  piece: 'Skorpion, Klavikel' },
  { style: 'Neo-Trad',  piece: 'Panther, Oberschenkel' },
  { style: 'Script',    piece: 'Schriftzug, Rippe' },
  { style: 'Dotwork',   piece: 'Mandala, Rücken' },
  { style: 'Blackwork', piece: 'Full Sleeve, ornamental' },
  { style: 'Fineline',  piece: 'Blume, Handgelenk' },
  { style: 'Neo-Trad',  piece: 'Schlange, Wade' },
  { style: 'Dotwork',   piece: 'Portrait, Brust' },
];
const GAL_FILTERS = ['Alle', 'Blackwork', 'Fineline', 'Neo-Trad', 'Script', 'Dotwork'];

function Gallery({ onBack }) {
  const [filter, setFilter] = useState('Alle');
  const items = filter === 'Alle' ? GAL_ITEMS : GAL_ITEMS.filter((i) => i.style === filter);
  return (
    <div className="page with-bg">
      <PageHead
        kicker="Portfolio · Kleopatra INK"
        title="Werke &" titleEm="Wunden"
        meta={<>
          <b>{GAL_ITEMS.length} Arbeiten</b>
          <div>Nadia Reyhani</div>
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
      <div className="gal-grid">
        {items.map((it, i) => (
          <div key={i} className="gal-item">
            <div className="placeholder">
              <div className="ph-label">PHOTO · {it.style.toUpperCase()}</div>
              <div className="ph-sub">{it.piece}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── About ─────────────────────────────────────────────────────────────────────

function About({ onBack }) {
  return (
    <div className="page with-bg">
      <PageHead
        kicker="Über uns · Est. 2018"
        title="Das bin" titleEm="Ich"
        meta={<>
          <b>Seit 2018</b>
          <div>Gunzenhausen</div>
          <div>Nadia Reyhani</div>
        </>}
        onBack={onBack}
      />
      <div className="about-hero">
        <div className="about-copy">
          <p>Kleopatra INK ist ein kleines Studio in Gunzenhausen, gegründet 2018 von Nadia Reyhani. Ein Studio, eine Künstlerin, eine Handschrift — und der Glaube, dass ein Tattoo mehr ist als Farbe unter der Haut.</p>
          <p>Jede Arbeit beginnt mit einem persönlichen Gespräch. Ich höre zu, zeichne, verwerfe und zeichne wieder — bis das Motiv so scharf ist wie die Nadel, die es setzt.</p>
          <p>Hygiene nach DIN EN 17141. Pigmente nach EU-REACH. Kein Small-Talk, keine Kompromisse.</p>
        </div>
        <div className="placeholder about-img">
          <div className="ph-label">STUDIO SHOT</div>
          <div className="ph-sub">Innenraum, warmes Licht, Arbeitsplatz</div>
        </div>
      </div>

      <h3 className="serif" style={{ fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold)', margin: '0 0 24px' }}>Die Künstlerin</h3>
      <div className="team-grid solo">
        <div className="team-card">
          <div className="placeholder">
            <div className="ph-label">PORTRAIT</div>
            <div className="ph-sub">Nadia, im Studio</div>
          </div>
          <div className="team-info">
            <h4 className="team-name">Nadia Reyhani</h4>
            <div className="team-role">Founder · Tätowiererin</div>
            <div className="team-bio">Seit 2014 Nadel in der Hand, seit 2018 mit eigenem Studio in Gunzenhausen. Spezialisiert auf großflächiges Blackwork, Fineline und ornamentale Cover-Ups. Jede Arbeit ein Einzelstück — nichts wird doppelt getätowiert.</div>
            <div className="team-specs">
              <span className="spec">Blackwork</span>
              <span className="spec">Fineline</span>
              <span className="spec">Ornamental</span>
              <span className="spec">Cover-Up</span>
              <span className="spec">Script</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Booking — Beratungstermin ─────────────────────────────────────────────────

const SLOTS = ['10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '19:00'];
const DISABLED = new Set(['13:00', '17:30']);

const INTERESTS = [
  { id: 'blackwork',  name: 'Blackwork'     },
  { id: 'fineline',   name: 'Fineline'      },
  { id: 'script',     name: 'Script'        },
  { id: 'ornamental', name: 'Ornamental'    },
  { id: 'cover',      name: 'Cover-Up'      },
  { id: 'unsure',     name: 'Noch unsicher' },
];

function Booking({ onBack }) {
  const [interest, setInterest] = useState('unsure');
  const [slot, setSlot] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [desc, setDesc] = useState('');
  const [submitted, setSubmitted] = useState(false);

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
        kicker="Beratungstermin · kostenlos"
        title="Termin" titleEm="buchen"
        meta={<>
          <b>~45 min</b>
          <div>Kostenfrei</div>
          <div>Unverbindlich</div>
        </>}
        onBack={onBack}
      />
      <div className="book-intro">
        <p className="cormorant">
          <b className="gold">Jedes Tattoo beginnt mit einem Gespräch.</b> Bevor die Nadel ansetzt, treffen wir uns für eine unverbindliche Beratung — im Studio oder per Video. Wir besprechen dein Motiv, schauen Referenzen an, ich skizziere, wir klären Platzierung, Aufwand und einen realistischen Preis. Erst danach vereinbaren wir den eigentlichen Tattoo-Termin.
        </p>
      </div>
      <div className="booking-wrap">
        <div className="book-col">
          <h3>01 · Worum geht&apos;s ungefähr?</h3>
          <div className="style-grid">
            {INTERESTS.map((s) => (
              <div key={s.id}
                className={`style-card ${interest === s.id ? 'selected' : ''}`}
                onClick={() => setInterest(s.id)}>
                <div className="style-name">{s.name}</div>
              </div>
            ))}
          </div>

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
          <div className="sum-row"><span className="sum-k">Art</span><span className="sum-v">Erstberatung</span></div>
          <div className="sum-row"><span className="sum-k">Thema</span><span className="sum-v">{INTERESTS.find((s) => s.id === interest)?.name}</span></div>
          <div className="sum-row"><span className="sum-k">Termin</span><span className={`sum-v ${slot ? '' : 'empty'}`}>{slot ? `Di 12. Mai · ${slot}` : 'noch nicht gewählt'}</span></div>
          <div className="sum-row"><span className="sum-k">Dauer</span><span className="sum-v">~45 Min</span></div>
          <div className="sum-row"><span className="sum-k">Kosten</span><span className="sum-v gold">Kostenfrei</span></div>
          <button
            className="btn-primary"
            style={{ marginTop: 24, opacity: (slot && name && email) ? 1 : 0.4, cursor: (slot && name && email) ? 'pointer' : 'not-allowed' }}
            disabled={!(slot && name && email)}
            onClick={() => setSubmitted(true)}>
            Beratung anfragen →
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
  { name: 'Selin K.',    info: '2024 · Sleeve',    stars: 5, text: 'Nadia hat aus meiner vagen Idee einen kompletten Unterarm gezaubert. Sechs Sitzungen, kein langweiliger Moment.' },
  { name: 'Tobias R.',   info: '2025 · Script',    stars: 5, text: 'Die Beratung war entspannt und unaufdringlich. Mein Schriftzug sitzt millimetergenau, die Linien sind so dünn, dass ich sie bei bestimmtem Licht zweimal ansehen muss.' },
  { name: 'Julia M.',    info: '2024 · Cover-Up',  stars: 5, text: 'Hatte ein altes, wirklich schlechtes Tattoo. Nadia hat es in ein ornamentales Stück verwandelt, das jetzt mein Lieblings-Körperstück ist.' },
  { name: 'Marc H.',     info: '2023 · Ornamental',stars: 5, text: 'Großes Stück auf dem Oberschenkel. Saubere Linien, kräftige Schattierung — mittlerweile ein Gesprächsthema, jedes Mal am Pool.' },
  { name: 'Anja P.',     info: '2025 · Fineline',  stars: 5, text: 'Ich war super nervös vor meinem ersten Tattoo. Nadia hat mich durchgehend betreut, das Studio ist clean und ruhig.' },
  { name: 'Ivan D.',     info: '2024 · Blackwork', stars: 5, text: 'Großflächiges Blackwork, ornamental, auf der Brust. Drei Sitzungen, jede genau getimed, Heilung problemlos. Top.' },
  { name: 'Rebecca S.',  info: '2025 · Dotwork',   stars: 5, text: 'Das Mandala auf meinem Rücken — Geduld, Symmetrie, Meditation in Nadel-Form.' },
  { name: 'Philipp T.',  info: '2024 · Script',    stars: 4, text: 'Eine kleine Terminverschiebung, aber die Arbeit selbst war makellos. Nadia wusste genau, welche Schriftart ich eigentlich wollte.' },
  { name: 'Leyla A.',    info: '2023 · Fineline',  stars: 5, text: 'Kleines Motiv am Schlüsselbein. Unaufgeregt, professionell, perfekt umgesetzt.' },
];

function Testimonials({ onBack }) {
  return (
    <div className="page with-bg">
      <PageHead
        kicker="Stimmen · Google & direkt"
        title="Was unsere" titleEm="Kunden sagen"
        meta={<>
          <b>4,9 ★</b>
          <div>312 Bewertungen</div>
          <div>Google · Instagram</div>
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
  const socs = [
    { platform: 'Instagram', handle: '@kleopatra.ink', desc: 'Tägliche Werke, Behind-the-Scenes, Studio-Einblicke. Hier verbringen wir die meiste Zeit.',           a: '18.4k', b: 'Follower',        c: '412',  d: 'Posts'           },
    { platform: 'TikTok',    handle: '@kleopatraink',  desc: 'Timelapses, Nadelwechsel in 15 Sekunden, und ein Blick auf die Hand hinter der Arbeit.',               a: '42.1k', b: 'Follower',        c: '1.2M', d: 'Likes'            },
    { platform: 'Pinterest', handle: '@KleopatraINK',  desc: 'Mood-Boards nach Stilen sortiert. Perfekt wenn du noch auf der Suche nach deinem Motiv bist.',        a: '6.8k',  b: 'Monthly Views',   c: '24',   d: 'Boards'           },
    { platform: 'YouTube',   handle: '@KleopatraINK',  desc: 'Langformat: Studio-Touren, Cover-Up-Prozesse und ausführliche Heilungsverläufe.',                      a: '3.2k',  b: 'Abonnent*innen',  c: '38',   d: 'Videos'           },
  ];
  return (
    <div className="page with-bg">
      <PageHead
        kicker="Social · Follow us"
        title="Unsere" titleEm="Sozials"
        meta={<>
          <b>4 Plattformen</b>
          <div>Tägliche Posts</div>
          <div>DM offen</div>
        </>}
        onBack={onBack}
      />
      <div className="soc-grid">
        {socs.map((s, i) => (
          <div key={i} className="soc-card">
            <div className="soc-head">
              <div className="soc-platform">{s.platform}</div>
              <div className="soc-platform" style={{ color: 'var(--gold)' }}>↗</div>
            </div>
            <div>
              <div className="soc-handle">{s.handle}</div>
              <div className="soc-desc">{s.desc}</div>
            </div>
            <div className="soc-stats">
              <div className="soc-stat"><b>{s.a}</b><span>{s.b}</span></div>
              <div className="soc-stat"><b>{s.c}</b><span>{s.d}</span></div>
            </div>
          </div>
        ))}
      </div>
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
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  const onBack = () => setPage('home');

  return (
    <>
      {page === 'home'         && <Landing onNav={setPage} tweaks={t} />}
      {page === 'gallery'      && <Gallery onBack={onBack} />}
      {page === 'about'        && <About onBack={onBack} />}
      {page === 'booking'      && <Booking onBack={onBack} />}
      {page === 'testimonials' && <Testimonials onBack={onBack} />}
      {page === 'socials'      && <Socials onBack={onBack} />}

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
