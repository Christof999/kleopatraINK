import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n';

const PASS_KEY = 'kink_stencil_pass';
const MAX_UPLOAD_DIM = 1600; // herunterskalieren vor Upload (Kosten + Limits)
const MAX_BYTES = 8 * 1024 * 1024;

// Bild laden, auf MAX_UPLOAD_DIM begrenzen, als JPEG-DataURL zurückgeben.
function fileToScaledDataURL(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, MAX_UPLOAD_DIM / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('decode_failed')); };
    img.src = url;
  });
}

// Lineart-Ergebnis (schwarze Linien auf Weiß) → reines Schwarz + Weiß
// transparent. threshold 0–255: Pixel heller als der Wert werden transparent.
function renderTransparent(srcUrl, threshold, canvas) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const px = data.data;
      for (let i = 0; i < px.length; i += 4) {
        const lum = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
        if (lum >= threshold) {
          px[i + 3] = 0; // hell → transparent
        } else {
          px[i] = 0; px[i + 1] = 0; px[i + 2] = 0; px[i + 3] = 255; // dunkel → reines Schwarz
        }
      }
      ctx.putImageData(data, 0, 0);
      resolve();
    };
    img.onerror = () => reject(new Error('result_load_failed'));
    img.src = srcUrl;
  });
}

export default function StencilStudio({ onBack }) {
  const { t } = useI18n();
  const s = t.stencil;

  const [passcode, setPasscode] = useState(() => {
    try { return localStorage.getItem(PASS_KEY) || ''; } catch { return ''; }
  });
  const [unlocked, setUnlocked] = useState(() => {
    try { return !!localStorage.getItem(PASS_KEY); } catch { return false; }
  });
  const [passInput, setPassInput] = useState('');

  const [original, setOriginal] = useState(null);   // DataURL des Uploads
  const [resultUrl, setResultUrl] = useState(null); // Lineart-URL von der API
  const [threshold, setThreshold] = useState(180);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Bei neuem Ergebnis oder geänderter Schwelle neu rendern.
  useEffect(() => {
    if (resultUrl && canvasRef.current) {
      renderTransparent(resultUrl, threshold, canvasRef.current).catch(() => {
        setError(s.errors.failed);
      });
    }
  }, [resultUrl, threshold]);

  const unlock = (event) => {
    event.preventDefault();
    const value = passInput.trim();
    if (!value) return;
    try { localStorage.setItem(PASS_KEY, value); } catch { /* ignore */ }
    setPasscode(value);
    setUnlocked(true);
    setPassInput('');
  };

  const handleFile = async (file) => {
    setError(null);
    setResultUrl(null);
    if (!file || !file.type.startsWith('image/')) {
      setError(s.errors.invalidImage);
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(s.errors.tooLarge);
      return;
    }
    try {
      const dataUrl = await fileToScaledDataURL(file);
      setOriginal(dataUrl);
    } catch {
      setError(s.errors.invalidImage);
    }
  };

  const generate = async () => {
    if (!original || loading) return;
    setLoading(true);
    setError(null);
    setResultUrl(null);
    try {
      const res = await fetch('/api/stencil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: original, passcode }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) {
          setUnlocked(false);
          try { localStorage.removeItem(PASS_KEY); } catch { /* ignore */ }
          setError(s.errors.unauthorized);
        } else if (data?.error === 'not_configured') {
          setError(s.errors.notConfigured);
        } else {
          setError(s.errors.failed);
        }
        return;
      }
      if (!data.output) {
        setError(s.errors.failed);
        return;
      }
      setResultUrl(data.output);
    } catch {
      setError(s.errors.failed);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setOriginal(null);
    setResultUrl(null);
    setError(null);
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'kleopatra-stencil.png';
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  return (
    <div className="page with-bg">
      <button className="page-back" onClick={onBack}>{t.common.back}</button>
      <div className="page-head">
        <div>
          <div className="page-kicker">{s.kicker}</div>
          <h1 className="page-title">{s.title} <em>{s.titleEm}</em></h1>
        </div>
        <div className="page-meta">
          <b>{s.metaInternal}</b>
          <div>{s.metaAi}</div>
          <div>{s.metaBrand}</div>
        </div>
      </div>

      {!unlocked ? (
        <div className="account-layout">
          <section className="account-panel" style={{ maxWidth: 460 }}>
            <div className="account-kicker">{s.passTitle}</div>
            <form className="account-form" onSubmit={unlock}>
              <div className="field">
                <label>{s.passLabel}</label>
                <input
                  type="password"
                  autoComplete="off"
                  value={passInput}
                  onChange={(e) => setPassInput(e.target.value)}
                  placeholder={s.passPlaceholder}
                  autoFocus
                />
              </div>
              {error && <div className="account-notice error">{error}</div>}
              <button className="btn-primary" type="submit">{s.passSubmit}</button>
            </form>
          </section>
        </div>
      ) : (
        <div className="stencil-wrap">
          <p className="stencil-intro cormorant">{s.intro}</p>

          {!original ? (
            <label
              className={`stencil-drop${dragOver ? ' is-drag' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              <div className="stencil-drop-title">{s.dropTitle}</div>
              <div className="stencil-drop-or">{s.dropOr}</div>
              <span className="btn-primary stencil-choose">{s.choose}</span>
              <div className="stencil-drop-formats">{s.formats}</div>
            </label>
          ) : (
            <div className="stencil-studio">
              <div className="stencil-panes">
                <figure className="stencil-pane">
                  <figcaption>{s.original}</figcaption>
                  <div className="stencil-pane-img">
                    <img src={original} alt={s.original} />
                  </div>
                </figure>
                <figure className="stencil-pane">
                  <figcaption>{s.result}</figcaption>
                  <div className="stencil-pane-img stencil-checker">
                    {loading ? (
                      <div className="fb-loading"><div className="ig-spinner" /></div>
                    ) : (
                      <canvas ref={canvasRef} className={resultUrl ? '' : 'is-empty'} />
                    )}
                  </div>
                </figure>
              </div>

              {error && <div className="account-notice error">{error}</div>}

              {!resultUrl ? (
                <div className="stencil-actions">
                  <button className="btn-primary" onClick={generate} disabled={loading}>
                    {loading ? s.generating : s.generate}
                  </button>
                  <button className="account-secondary-btn" onClick={reset} disabled={loading}>
                    {s.reset}
                  </button>
                </div>
              ) : (
                <>
                  <div className="stencil-control">
                    <label>{s.threshold}: {threshold}</label>
                    <input
                      type="range"
                      min={60}
                      max={245}
                      value={threshold}
                      onChange={(e) => setThreshold(Number(e.target.value))}
                    />
                  </div>
                  <div className="stencil-actions">
                    <button className="btn-primary" onClick={download}>{s.download}</button>
                    <button className="account-secondary-btn" onClick={reset}>{s.reset}</button>
                  </div>
                </>
              )}

              <p className="stencil-disclaimer">{s.disclaimer}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
