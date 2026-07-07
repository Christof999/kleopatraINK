import { useState } from 'react';
import PageHead from '../components/PageHead';
import { useI18n } from '../i18n';
import { formatEuro } from '../lib/format';
import { PLANITY_BOOKING_URL } from '../data/contact';

export default function Booking({ onBack, wannado, piercing }) {
  const { t, lang } = useI18n();
  const b = t.booking;
  const [interest, setInterest] = useState('unsure');
  const isPiercingBooking = !!piercing;

  const topicLabel = isPiercingBooking
    ? piercing.title
    : wannado
      ? wannado.title
      : b.interests.find((s) => s.id === interest)?.name;

  const redirectHint = isPiercingBooking
    ? b.redirectHintPiercing(piercing.title)
    : wannado
      ? b.redirectHintWannado(wannado.title)
      : b.redirectHintConsult;

  const styleHint = !isPiercingBooking && !wannado && interest !== 'unsure'
    ? b.redirectHintStyle(b.interests.find((s) => s.id === interest)?.name)
    : null;

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

          <div className="planity-redirect">
            <h3>{b.redirectTitle}</h3>
            <p className="planity-redirect-lead cormorant">{b.redirectLead}</p>
            <ol className="planity-redirect-steps">
              {b.redirectSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <p className="planity-redirect-hint">{redirectHint}</p>
            {styleHint && <p className="planity-redirect-hint">{styleHint}</p>}
          </div>
        </div>

        <div className="summary">
          <h4>{b.summaryTitle}</h4>
          <div className="sum-row"><span className="sum-k">{b.sumKind}</span><span className="sum-v">{isPiercingBooking ? b.sumKindPiercing : b.sumKindConsult}</span></div>
          <div className="sum-row"><span className="sum-k">{b.sumTopic}</span><span className="sum-v">{topicLabel}</span></div>
          <div className="sum-row"><span className="sum-k">{b.sumPlatform}</span><span className="sum-v">Planity</span></div>
          <div className="sum-row"><span className="sum-k">{b.sumDuration}</span><span className="sum-v">{isPiercingBooking ? b.sumDurationPiercing : b.sumDurationConsult}</span></div>
          <div className="sum-row"><span className="sum-k">{b.sumCost}</span><span className="sum-v gold">{isPiercingBooking ? formatEuro(piercing.price, lang, t.piercing.priceOnRequest) : b.metaFree}</span></div>
          <a
            href={PLANITY_BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary planity-cta"
          >
            {isPiercingBooking ? b.ctaPlanityPiercing : b.ctaPlanityConsult}
          </a>
          <p className="planity-redirect-note">{b.redirectNote}</p>
        </div>
      </div>
    </div>
  );
}
