import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n';

const STORAGE_KEY = 'kink_consent_v1';

export function readConsent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeConsent(consent) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  } catch {
    /* localStorage may be blocked — fail silently */
  }
}

export default function CookieBanner({ onChange, onOpenPrivacy }) {
  const { t } = useI18n();
  const c = t.cookie;
  const [open, setOpen] = useState(false);
  const acceptRef = useRef(null);

  useEffect(() => {
    if (!readConsent()) setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    acceptRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus();
      }
    };
  }, [open]);

  const save = (level) => {
    const consent = {
      level,
      essential: true,
      functional: level === 'all',
      analytics: level === 'all',
      marketing: false,
      timestamp: new Date().toISOString(),
      version: 1,
    };
    writeConsent(consent);
    onChange?.(consent);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="cookie-overlay" role="presentation">
      <div
        className="cookie-banner"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="cookie-title"
        aria-describedby="cookie-desc"
      >
        <div className="cookie-banner-head">
          <span className="cookie-banner-kicker">{c.kicker}</span>
          <h2 id="cookie-title" className="cookie-banner-title">
            {c.titlePre} <em>{c.titleEm}</em>
          </h2>
        </div>

        <p id="cookie-desc" className="cookie-banner-text">
          {c.text.pre}
          <button
            type="button"
            className="cookie-banner-link"
            onClick={() => {
              onOpenPrivacy?.();
              setOpen(false);
            }}
          >
            {c.text.link}
          </button>
          {c.text.post}
        </p>

        <ul className="cookie-banner-list" aria-label={c.catAria}>
          <li>
            <span className="cookie-cat-name">{c.essential}</span>
            <span className="cookie-cat-state cookie-cat-on" aria-hidden="true">{c.essentialState}</span>
            <span className="cookie-cat-desc">{c.essentialDesc}</span>
          </li>
          <li>
            <span className="cookie-cat-name">{c.functional}</span>
            <span className="cookie-cat-state" aria-hidden="true">{c.functionalState}</span>
            <span className="cookie-cat-desc">{c.functionalDesc}</span>
          </li>
        </ul>

        <div className="cookie-banner-actions">
          <button
            ref={acceptRef}
            type="button"
            className="btn-primary cookie-btn-accept"
            onClick={() => save('all')}
          >
            {c.acceptAll}
          </button>
          <button
            type="button"
            className="cookie-btn-decline"
            onClick={() => save('essential')}
          >
            {c.essentialOnly}
          </button>
        </div>
      </div>
    </div>
  );
}
