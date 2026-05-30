import { useEffect, useId, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import PageHead from '../components/PageHead';
import { formatEuro } from '../lib/format';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { SLOTS, DISABLED_SLOTS, INTERESTS } from '../data/booking';

export default function Booking({ onBack, wannado, piercing }) {
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
      <div className={`page with-bg${isPiercingBooking ? ' theme-piercing' : ''}`} style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
        <div style={{ maxWidth: 540, textAlign: 'center', padding: '20px' }}>
          <div className="page-kicker">{isPiercingBooking ? 'Piercing-Anfrage gesendet' : 'Beratungstermin angefragt'}</div>
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
    <div className={`page with-bg${isPiercingBooking ? ' theme-piercing' : ''}`}>
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
            <div className="style-grid" role="radiogroup" aria-label="Interesse / Tattoo-Stil">
              {INTERESTS.map((s) => (
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

          <h3 style={{ marginTop: 36 }}>02 · Dein Wunsch-Slot — Di 12. Mai</h3>
          <div className="slot-grid" role="radiogroup" aria-label="Verfügbare Uhrzeiten">
            {SLOTS.map((s) => (
              <button key={s}
                type="button"
                role="radio"
                aria-checked={slot === s}
                className={`slot ${slot === s ? 'selected' : ''} ${DISABLED_SLOTS.has(s) ? 'disabled' : ''}`}
                disabled={DISABLED_SLOTS.has(s)}
                aria-disabled={DISABLED_SLOTS.has(s)}
                onClick={() => setSlot(s)}>{s}</button>
            ))}
          </div>
          <div style={{ fontSize: 10, color: 'var(--ivory-dim)', letterSpacing: '0.08em', marginBottom: 24, marginTop: -8 }}>
            Dauer ca. 45 Minuten. Andere Tage? Schreib&apos;s unten ins Freitextfeld.
          </div>

          <h3 style={{ marginTop: 12 }}>03 · Deine Details</h3>
          <div className="field">
            <label htmlFor={ids.name}>Name</label>
            <input id={ids.name} type="text" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Vor- und Nachname" />
          </div>
          <div className="field">
            <label htmlFor={ids.email}>E-Mail</label>
            <input id={ids.email} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="deine@email.de" />
          </div>
          <div className="field">
            <label htmlFor={ids.phone}>Telefon <span style={{ opacity: 0.5, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
            <input id={ids.phone} type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+49 …" />
          </div>
          <div className="field">
            <label htmlFor={ids.desc}>Kurz zu deiner Idee</label>
            <textarea id={ids.desc} rows={4} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Motiv, Körperstelle, ungefähre Größe, Referenzen — alles was dir einfällt. Keine Angst, noch muss nichts feststehen." />
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
            type="button"
            className="btn-primary"
            style={{ marginTop: 24, opacity: (slot && name && email) ? 1 : 0.4, cursor: (slot && name && email) ? 'pointer' : 'not-allowed' }}
            disabled={!(slot && name && email)}
            aria-disabled={!(slot && name && email)}
            onClick={() => setSubmitted(true)}>
            {isPiercingBooking ? 'Piercing anfragen →' : 'Beratung anfragen →'}
          </button>
          <p style={{ marginTop: 14, fontSize: 10, color: 'var(--ivory-dim)', letterSpacing: '0.06em', lineHeight: 1.5 }}>
            Unverbindlich. Bestätigung per Mail binnen 48 Stunden. Mit dem Absenden stimmst du der
            Verarbeitung deiner Angaben gemäß unserer Datenschutz­erklärung zu.
          </p>
        </div>
      </div>
    </div>
  );
}
