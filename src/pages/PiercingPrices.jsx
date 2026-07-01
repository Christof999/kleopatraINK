import { STUDIO_MOBILE } from '../data/contact';
import PageHead from '../components/PageHead';
import { useI18n } from '../i18n';
import { formatEuro } from '../lib/format';
import { usePiercingPrices } from '../hooks/usePiercingPrices';
import {
  buildGeneralPiercingRequest,
  PIERCING_CATEGORY_IDS,
  PIERCING_GUIDE_LAYOUT,
} from '../data/piercing';

function PiercingHero({ onBook }) {
  const { t } = useI18n();
  const h = t.piercing.hero;
  return (
    <section className="piercing-hero">
      <div className="piercing-hero-logo-wrap">
        <img
          className="piercing-hero-logo"
          src="/LOGO_piercing.jpg"
          alt="Kleopatra INK · Piercing Studio Gunzenhausen"
        />
      </div>
      <div className="piercing-hero-copy">
        <div className="piercing-hero-kicker">{h.kicker}</div>
        <h1 className="piercing-hero-title">{h.title[0]}<br/><em>{h.title[1]}</em></h1>
        <p className="piercing-hero-lead">{h.lead}</p>
        <div className="piercing-hero-actions">
          <button type="button" className="pink-cta" onClick={() => onBook(buildGeneralPiercingRequest(t))}>
            {h.cta}
          </button>
          <a className="piercing-hero-tel" href={`tel:${STUDIO_MOBILE.tel}`}>
            <span className="piercing-hero-tel-kicker">{h.callKicker}</span>
            <span className="piercing-hero-tel-num">{STUDIO_MOBILE.displayCompact}</span>
          </a>
        </div>
      </div>
    </section>
  );
}

function PiercingCategories() {
  const { t } = useI18n();
  const c = t.piercing.categories;
  return (
    <section className="piercing-section piercing-cat-section">
      <div className="piercing-section-head">
        <span className="piercing-section-kicker">{c.kicker}</span>
        <h2 className="piercing-section-title">{c.title}</h2>
      </div>
      <dl className="piercing-cat-list">
        {PIERCING_CATEGORY_IDS.map((id, i) => {
          const cat = c.items[id];
          return (
            <div key={id} className="piercing-cat-row">
              <dt className="piercing-cat-row-label">
                <span className="piercing-cat-row-num">{String(i + 1).padStart(2, '0')}</span>
                {cat.label}
              </dt>
              <dd className="piercing-cat-row-examples">{cat.examples}</dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}

function PiercingGuide({ layout, index }) {
  const { t } = useI18n();
  const guide = t.piercing.guides[layout.id];
  const flipped = index % 2 === 1;
  return (
    <section className={`piercing-guide ${flipped ? 'is-flipped' : ''}`}>
      <figure className="piercing-guide-figure" style={{ aspectRatio: layout.aspect || '1 / 1' }}>
        <img
          src={layout.src}
          alt={guide.alt}
          loading="lazy"
          decoding="async"
        />
      </figure>
      <div className="piercing-guide-copy">
        <span className="piercing-section-kicker">{guide.kicker}</span>
        <h2 className="piercing-section-title">{guide.title}</h2>
        <p className="piercing-section-lead">{guide.copy}</p>
        <ul className="piercing-guide-spots">
          {guide.spots.map((s, i) => (
            <li key={i}>
              <span className="piercing-guide-dot" aria-hidden="true" />
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function PiercingHygiene() {
  const { t } = useI18n();
  const q = t.piercing.quality;
  return (
    <section className="piercing-section piercing-quality">
      <div className="piercing-section-head">
        <span className="piercing-section-kicker">{q.kicker}</span>
        <h2 className="piercing-section-title">{q.title}</h2>
      </div>
      <div className="piercing-quality-grid">
        {q.items.map((item, i) => {
          const num = String(i + 1).padStart(2, '0');
          return (
            <article key={num} className="piercing-quality-item">
              <div className="piercing-quality-num">{num}</div>
              <h3 className="piercing-quality-title">{item.title}</h3>
              <p className="piercing-quality-text">{item.text}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function PiercingPricesList({ items, loading, error, onBook }) {
  const { t, lang } = useI18n();
  const p = t.piercing.pricelist;
  return (
    <section className="piercing-section piercing-pricelist">
      <div className="piercing-section-head">
        <span className="piercing-section-kicker">{p.kicker}</span>
        <h2 className="piercing-section-title">{p.title}</h2>
        <p className="piercing-section-lead">{p.lead}</p>
      </div>

      {loading ? (
        <div className="fb-loading"><div className="ig-spinner" /></div>
      ) : error ? (
        <p className="gal-empty">{p.loadError}</p>
      ) : items.length === 0 ? (
        <p className="gal-empty">{p.empty}</p>
      ) : (
        <ul className="piercing-menu">
          {items.map((item) => (
            <li key={item.id} className="piercing-menu-item">
              <div className="piercing-menu-row">
                <h3 className="piercing-menu-title">{item.title}</h3>
                <span className="piercing-menu-dots" aria-hidden="true" />
                <span className="piercing-menu-price">{formatEuro(item.price, lang, t.piercing.priceOnRequest)}</span>
              </div>
              {item.desc && <p className="piercing-menu-desc">{item.desc}</p>}
              <button
                type="button"
                className="piercing-menu-link"
                onClick={() => onBook(item)}
              >
                {p.request}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function PiercingPrices({ onBack, onBook }) {
  const { t } = useI18n();
  const { items, loading, error } = usePiercingPrices();
  const f = t.piercing.finalCta;

  return (
    <div className="page with-bg theme-piercing">
      <PageHead
        kicker={t.piercing.pageKicker}
        title={t.piercing.pageTitle} titleEm={t.piercing.pageTitleEm}
        onBack={onBack}
      />

      <PiercingHero onBook={onBook} />
      <PiercingCategories />

      {PIERCING_GUIDE_LAYOUT.map((g, i) => (
        <PiercingGuide key={g.id} layout={g} index={i} />
      ))}

      <PiercingHygiene />
      <PiercingPricesList items={items} loading={loading} error={error} onBook={onBook} />

      <section className="piercing-final-cta">
        <h2 className="piercing-section-title">{f.title}</h2>
        <p className="piercing-section-lead">{f.lead}</p>
        <button type="button" className="pink-cta" onClick={() => onBook(buildGeneralPiercingRequest(t))}>
          {f.cta}
        </button>
      </section>
    </div>
  );
}
