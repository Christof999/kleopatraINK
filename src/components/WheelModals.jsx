import { useEffect } from 'react';
import LuckyWheel, { formatSegment } from './LuckyWheel';
import { useI18n } from '../i18n';

function useBodyScrollLock(active) {
  useEffect(() => {
    if (!active) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [active]);
}

function useEscapeToClose(active, onClose) {
  useEffect(() => {
    if (!active) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, onClose]);
}

export function WheelInviteModal({ open, firstName, onAccept, onDismiss }) {
  const { t } = useI18n();
  const w = t.wheel.invite;
  useBodyScrollLock(open);
  useEscapeToClose(open, onDismiss);

  if (!open) return null;

  return (
    <div className="wheel-modal-backdrop" onClick={onDismiss} role="presentation">
      <div
        className="wheel-modal-card wheel-invite-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wheel-invite-title"
      >
        <button
          type="button"
          className="wheel-modal-close"
          onClick={onDismiss}
          aria-label={w.close}
        >×</button>

        <div className="wheel-invite-icon" aria-hidden="true">
          <svg viewBox="0 0 64 64" width="64" height="64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.5" />
            <circle cx="32" cy="32" r="20" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.35" />
            <line x1="32" y1="4" x2="32" y2="60" stroke="currentColor" strokeWidth="1" opacity="0.35" />
            <line x1="4" y1="32" x2="60" y2="32" stroke="currentColor" strokeWidth="1" opacity="0.35" />
            <polygon points="32,2 28,12 36,12" fill="currentColor" />
            <circle cx="32" cy="32" r="4" fill="currentColor" />
          </svg>
        </div>

        <div className="wheel-invite-kicker">{w.kicker}</div>
        <h2 id="wheel-invite-title" className="wheel-invite-title">
          {firstName ? w.titleNamed(firstName) : w.title}
        </h2>
        <p className="wheel-invite-copy">{w.copy}</p>

        <div className="wheel-invite-actions">
          <button type="button" className="wheel-invite-cta" onClick={onAccept}>
            {w.cta}
          </button>
          <button type="button" className="wheel-invite-skip" onClick={onDismiss}>
            {w.later}
          </button>
        </div>
      </div>
    </div>
  );
}

export function WheelModal({
  open,
  segments,
  saving,
  saveError,
  justWon,
  onSpinResult,
  onClose,
}) {
  const { t } = useI18n();
  const w = t.wheel.spin;
  useBodyScrollLock(open);
  useEscapeToClose(open, saving ? () => {} : onClose);

  if (!open) return null;

  return (
    <div
      className="wheel-modal-backdrop"
      onClick={saving ? undefined : onClose}
      role="presentation"
    >
      <div
        className="wheel-modal-card wheel-spin-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wheel-spin-title"
      >
        <button
          type="button"
          className="wheel-modal-close"
          onClick={onClose}
          disabled={saving}
          aria-label={w.close}
        >×</button>

        <div className="wheel-spin-kicker">{w.kicker}</div>
        <h2 id="wheel-spin-title" className="wheel-spin-title">
          {justWon ? w.won : w.spinTitle}
        </h2>
        <p className="wheel-spin-sub">
          {justWon ? w.wonSub : w.spinSub}
        </p>

        <div className="wheel-spin-stage">
          <LuckyWheel
            segments={segments}
            onResult={onSpinResult}
            size={380}
            buttonLabel={w.spinNow}
            disabled={saving || !!justWon}
          />
        </div>

        {saveError && (
          <div className="account-notice error wheel-spin-error" role="alert">{saveError}</div>
        )}

        {justWon && !saveError && (
          <div className="wheel-spin-redeem">
            <div className="wheel-spin-redeem-kicker">{w.saved}</div>
            <div className="wheel-spin-redeem-value">{formatSegment(justWon)}</div>
            <button type="button" className="wheel-invite-cta" onClick={onClose}>
              {w.close}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
