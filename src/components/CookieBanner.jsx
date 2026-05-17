import { useEffect, useRef, useState } from 'react';

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
          <span className="cookie-banner-kicker">Cookies &amp; Datenschutz</span>
          <h2 id="cookie-title" className="cookie-banner-title">
            Deine <em>Privatsphäre</em>
          </h2>
        </div>

        <p id="cookie-desc" className="cookie-banner-text">
          Diese Website verwendet technisch notwendige Cookies, damit Login, Termin­buchung und
          Account funktionieren. Optional helfen uns funktionale Cookies (z.&nbsp;B. Google Fonts,
          Instagram-Einbettung), das Erlebnis zu verbessern. Du entscheidest. Details findest du in
          unserer{' '}
          <button
            type="button"
            className="cookie-banner-link"
            onClick={() => {
              onOpenPrivacy?.();
              setOpen(false);
            }}
          >
            Datenschutzerklärung
          </button>
          .
        </p>

        <ul className="cookie-banner-list" aria-label="Cookie-Kategorien">
          <li>
            <span className="cookie-cat-name">Essenziell</span>
            <span className="cookie-cat-state cookie-cat-on" aria-hidden="true">Immer aktiv</span>
            <span className="cookie-cat-desc">
              Auth-Session, Cookie-Einstellung selbst, Sicherheit.
            </span>
          </li>
          <li>
            <span className="cookie-cat-name">Funktional</span>
            <span className="cookie-cat-state" aria-hidden="true">Optional</span>
            <span className="cookie-cat-desc">
              Google Fonts, Instagram-Vorschau, eingebettete Inhalte.
            </span>
          </li>
        </ul>

        <div className="cookie-banner-actions">
          <button
            ref={acceptRef}
            type="button"
            className="btn-primary cookie-btn-accept"
            onClick={() => save('all')}
          >
            Alle akzeptieren
          </button>
          <button
            type="button"
            className="cookie-btn-decline"
            onClick={() => save('essential')}
          >
            Nur essenzielle
          </button>
        </div>
      </div>
    </div>
  );
}
