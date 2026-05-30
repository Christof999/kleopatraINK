import PageHead from '../components/PageHead';
import { TESTIMONIALS } from '../data/testimonials';

export default function Testimonials({ onBack }) {
  return (
    <div className="page with-bg">
      <PageHead
        kicker="Stimmen · Google"
        title="Was unsere" titleEm="Kunden sagen"
        meta={<>
          <b>5,0 ★</b>
          <div>23 Bewertungen</div>
          <div>Google</div>
        </>}
        onBack={onBack}
      />
      <div className="testi-grid">
        {TESTIMONIALS.map((t, i) => (
          <div key={i} className="testi">
            <div className="testi-stars">{'★'.repeat(t.stars)}{'☆'.repeat(5 - t.stars)}</div>
            <div className="testi-quote">{t.text}</div>
            <div className="testi-meta">
              <div className="testi-name">{t.name}</div>
              <div className="testi-info">{t.info}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
