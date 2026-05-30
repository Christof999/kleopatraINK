import PageHead from '../components/PageHead';
import { useI18n } from '../i18n';
import { TESTIMONIALS } from '../data/testimonials';

export default function Testimonials({ onBack }) {
  const { t } = useI18n();
  const te = t.testimonials;
  return (
    <div className="page with-bg">
      <PageHead
        kicker={te.kicker}
        title={te.title} titleEm={te.titleEm}
        meta={<>
          <b>{te.rating}</b>
          <div>{te.count}</div>
          <div>{te.source}</div>
        </>}
        onBack={onBack}
      />
      <div className="testi-grid">
        {TESTIMONIALS.map((item, i) => (
          <div key={i} className="testi">
            <div className="testi-stars">{'★'.repeat(item.stars)}{'☆'.repeat(5 - item.stars)}</div>
            <div className="testi-quote">{item.text}</div>
            <div className="testi-meta">
              <div className="testi-name">{item.name}</div>
              <div className="testi-info">{te.ago(item.ago.n, item.ago.unit)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
