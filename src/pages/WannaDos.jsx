import { lazy, Suspense, useState } from 'react';
import PageHead from '../components/PageHead';
import { useWannados } from '../hooks/useWannados';

const Body3DViewer = lazy(() => import('../components/Body3DViewer'));

const HAS_3D_BODY = true;

export default function WannaDos({ onBack, onBook }) {
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
