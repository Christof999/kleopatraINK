import { useState } from 'react';
import PageHead from '../components/PageHead';
import { useI18n } from '../i18n';
import { GAL_FILTERS } from '../gallery-items';
import { useGallery } from '../hooks/useGallery';

export default function Gallery({ onBack }) {
  const { t } = useI18n();
  const [filter, setFilter] = useState('Alle');
  const { items: allItems, loading } = useGallery();
  const items = filter === 'Alle' ? allItems : allItems.filter((i) => i.style === filter);

  const filterLabel = (f) => (f === 'Alle' ? t.common.all : f);

  return (
    <div className="page with-bg">
      <PageHead
        kicker={t.gallery.kicker}
        title={t.gallery.title} titleEm={t.gallery.titleEm}
        meta={<>
          <b>{loading ? '…' : allItems.length > 0 ? t.gallery.works(allItems.length) : t.common.soon}</b>
          <div>{t.gallery.years}</div>
        </>}
        onBack={onBack}
      />
      <div className="gal-filters" role="group" aria-label={t.gallery.filterAria}>
        {GAL_FILTERS.map((f) => (
          <button key={f}
            type="button"
            className={`gal-chip ${filter === f ? 'active' : ''}`}
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}>{filterLabel(f)}</button>
        ))}
      </div>
      {loading ? (
        <div className="fb-loading" role="status" aria-live="polite">
          <div className="ig-spinner" aria-hidden="true" />
          <span className="visually-hidden">{t.gallery.loadingAria}</span>
        </div>
      ) : items.length === 0 ? (
        <p className="gal-empty">
          {filter === 'Alle' ? t.gallery.emptyAll : t.gallery.emptyFilter(filter)}
        </p>
      ) : (
        <ul className="gal-grid" aria-label={t.gallery.worksAria(items.length)}>
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
