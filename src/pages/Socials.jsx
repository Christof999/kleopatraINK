import PageHead from '../components/PageHead';
import InstagramFeed from '../components/InstagramFeed';
import { useI18n } from '../i18n';

export default function Socials({ onBack }) {
  const { t } = useI18n();
  return (
    <div className="page with-bg">
      <PageHead
        kicker={t.socials.kicker}
        title={t.socials.title} titleEm={t.socials.titleEm}
        meta={<>
          <div>{t.socials.metaDaily}</div>
          <div>{t.socials.metaDm}</div>
        </>}
        onBack={onBack}
      />
      <InstagramFeed />
    </div>
  );
}
