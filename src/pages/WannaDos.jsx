import { lazy, Suspense, useState } from 'react';
import PageHead from '../components/PageHead';
import { useI18n } from '../i18n';
import { useWannados } from '../hooks/useWannados';

const Body3DViewer = lazy(() => import('../components/Body3DViewer'));

const HAS_3D_BODY = true;

export default function WannaDos({ onBack, onBook }) {
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
