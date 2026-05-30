import { useState } from 'react';
import PageHead from '../components/PageHead';
import { GAL_FILTERS } from '../gallery-items';
import { useGallery } from '../hooks/useGallery';

export default function Gallery({ onBack }) {
  const [filter, setFilter] = useState('Alle');
  const { items: allItems, loading } = useGallery();
  const items = filter === 'Alle' ? allItems : allItems.filter((i) => i.style === filter);

  return (
    <div className="page with-bg">
      <PageHead
        kicker="Portfolio · Kleopatra INK"
        title="Werke &" titleEm="Wunden"
        meta={<>
          <b>{loading ? '…' : allItems.length > 0 ? `${allItems.length} Arbeiten` : 'Demnächst'}</b>
          <div>2018 — 2026</div>
        </>}
        onBack={onBack}
      />
      <div className="gal-filters" role="group" aria-label="Filter nach Tattoo-Stil">
        {GAL_FILTERS.map((f) => (
          <button key={f}
            type="button"
            className={`gal-chip ${filter === f ? 'active' : ''}`}
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>
      {loading ? (
        <div className="fb-loading" role="status" aria-live="polite">
          <div className="ig-spinner" aria-hidden="true" />
          <span className="visually-hidden">Galerie wird geladen …</span>
        </div>
      ) : items.length === 0 ? (
        <p className="gal-empty">
          {filter === 'Alle' ? 'Bilder folgen bald.' : `Noch keine ${filter}-Arbeiten vorhanden.`}
        </p>
      ) : (
        <ul className="gal-grid" aria-label={`${items.length} Tattoo-Werke`}>
          {items.map((it) => (
            <li key={it.id} className="gal-item">
              <img className="gal-img" src={it.src} alt={it.piece ? `${it.style}-Tattoo: ${it.piece}` : `${it.style}-Tattoo`} loading="lazy" />
              {(it.piece || it.style) && (
                <div className="gal-caption">
                  <div className="gal-caption-style">{it.style}</div>
                  {it.piece && <div className="gal-caption-piece">{it.piece}</div>}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
