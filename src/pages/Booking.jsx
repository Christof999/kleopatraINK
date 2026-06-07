import { useEffect, useId, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import PageHead from '../components/PageHead';
import { useI18n } from '../i18n';
import { formatEuro } from '../lib/format';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { SLOTS, DISABLED_SLOTS } from '../data/booking';

export default function Booking({ onBack, wannado, piercing }) {
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
          <p className="cormorant" style={{ fontSize: 'calc(20px * var(--font-scale))', color: 'var(--ivory)', opacity: 0.9, lineHeight: 1.5 }}>
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
                className={`slot ${slot === s ? 'selected' : ''} ${DISABLED_SLOTS.has(s) ? 'disabled' : ''}`}
                disabled={DISABLED_SLOTS.has(s)}
                aria-disabled={DISABLED_SLOTS.has(s)}
                onClick={() => setSlot(s)}>{s}</button>
            ))}
          </div>
          <div style={{ fontSize: 'calc(10px * var(--font-scale))', color: 'var(--ivory-dim)', letterSpacing: '0.08em', marginBottom: 24, marginTop: -8 }}>
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
          <p style={{ marginTop: 14, fontSize: 'calc(10px * var(--font-scale))', color: 'var(--ivory-dim)', letterSpacing: '0.06em', lineHeight: 1.5 }}>
            {b.disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
}
