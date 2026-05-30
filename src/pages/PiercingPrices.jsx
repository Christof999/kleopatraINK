import PageHead from '../components/PageHead';
import { formatEuro } from '../lib/format';
import { usePiercingPrices } from '../hooks/usePiercingPrices';
import {
  GENERAL_PIERCING_REQUEST,
  PIERCING_CATEGORIES,
  PIERCING_GUIDES,
  PIERCING_QUALITY,
} from '../data/piercing';

function PiercingHero({ onBook }) {
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
        <div className="piercing-hero-kicker">Kleopatra INK · Piercing Studio</div>
        <h1 className="piercing-hero-title">Jedes Piercing<br/><em>unterstreicht dich.</em></h1>
        <p className="piercing-hero-lead">
          Vom feinen Lobe bis zum kuratierten Ohrlauf — unser Piercing-Studio in Gunzenhausen
          arbeitet ausschließlich mit hochwertigem Implant-Grade-Schmuck, sauberer
          Nadel-Technik und ausführlicher Beratung.
        </p>
        <div className="piercing-hero-actions">
          <button type="button" className="pink-cta" onClick={() => onBook(GENERAL_PIERCING_REQUEST)}>
            Termin anfragen →
          </button>
          <a className="piercing-hero-tel" href="tel:+4917660957400">
            <span className="piercing-hero-tel-kicker">Direkt anrufen</span>
            <span className="piercing-hero-tel-num">0176 60957400</span>
          </a>
        </div>
      </div>
    </section>
  );
}

function PiercingCategories() {
  return (
    <section className="piercing-section piercing-cat-section">
      <div className="piercing-section-head">
        <span className="piercing-section-kicker">Unser Angebot</span>
        <h2 className="piercing-section-title">Was wir stechen</h2>
      </div>
      <dl className="piercing-cat-list">
        {PIERCING_CATEGORIES.map((cat, i) => (
          <div key={cat.id} className="piercing-cat-row">
            <dt className="piercing-cat-row-label">
              <span className="piercing-cat-row-num">{String(i + 1).padStart(2, '0')}</span>
              {cat.label}
            </dt>
            <dd className="piercing-cat-row-examples">{cat.examples}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function PiercingGuide({ guide, index }) {
  const flipped = index % 2 === 1;
  return (
    <section className={`piercing-guide ${flipped ? 'is-flipped' : ''}`}>
      <figure className="piercing-guide-figure" style={{ aspectRatio: guide.aspect || '1 / 1' }}>
        <img
          src={guide.src}
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
  return (
    <section className="piercing-section piercing-quality">
      <div className="piercing-section-head">
        <span className="piercing-section-kicker">Sicherheit &amp; Qualität</span>
        <h2 className="piercing-section-title">Worauf wir bestehen</h2>
      </div>
      <div className="piercing-quality-grid">
        {PIERCING_QUALITY.map((q) => (
          <article key={q.num} className="piercing-quality-item">
            <div className="piercing-quality-num">{q.num}</div>
            <h3 className="piercing-quality-title">{q.title}</h3>
            <p className="piercing-quality-text">{q.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function PiercingPricesList({ items, loading, error, onBook }) {
  return (
    <section className="piercing-section piercing-pricelist">
      <div className="piercing-section-head">
        <span className="piercing-section-kicker">Preise · Inkl. Erstschmuck</span>
        <h2 className="piercing-section-title">Preisliste</h2>
        <p className="piercing-section-lead">
          Erstschmuck (Implant-Grade-Titan) ist im Preis enthalten.
          Premium-Schmuck (14k Gold, Edelsteine) gegen Aufpreis.
        </p>
      </div>

      {loading ? (
        <div className="fb-loading"><div className="ig-spinner" /></div>
      ) : error ? (
        <p className="gal-empty">Preisliste konnte nicht geladen werden.</p>
      ) : items.length === 0 ? (
        <p className="gal-empty">Piercing-Preise folgen bald.</p>
      ) : (
        <ul className="piercing-menu">
          {items.map((item) => (
            <li key={item.id} className="piercing-menu-item">
              <div className="piercing-menu-row">
                <h3 className="piercing-menu-title">{item.title}</h3>
                <span className="piercing-menu-dots" aria-hidden="true" />
                <span className="piercing-menu-price">{formatEuro(item.price)}</span>
              </div>
              {item.desc && <p className="piercing-menu-desc">{item.desc}</p>}
              <button
                type="button"
                className="piercing-menu-link"
                onClick={() => onBook(item)}
              >
                Termin anfragen →
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function PiercingPrices({ onBack, onBook }) {
  const { items, loading, error } = usePiercingPrices();

  return (
    <div className="page with-bg theme-piercing">
      <PageHead
        kicker="Piercing Studio · Kleopatra INK"
        title="Piercing" titleEm="Welt"
        onBack={onBack}
      />

      <PiercingHero onBook={onBook} />
      <PiercingCategories />

      {PIERCING_GUIDES.map((g, i) => (
        <PiercingGuide key={g.id} guide={g} index={i} />
      ))}

      <PiercingHygiene />
      <PiercingPricesList items={items} loading={loading} error={error} onBook={onBook} />

      <section className="piercing-final-cta">
        <h2 className="piercing-section-title">Bereit für deinen Termin?</h2>
        <p className="piercing-section-lead">
          Schreib uns dein Wunsch-Piercing — wir melden uns binnen 48 Stunden mit einem Vorschlag.
        </p>
        <button type="button" className="pink-cta" onClick={() => onBook(GENERAL_PIERCING_REQUEST)}>
          Termin anfragen →
        </button>
      </section>
    </div>
  );
}
