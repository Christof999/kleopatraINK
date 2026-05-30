import PageHead from '../components/PageHead';
import { useI18n } from '../i18n';

function AboutSectionTitle({ children, style, id }) {
  return (
    <h3 className="about-section-title serif" style={style} id={id}>{children}</h3>
  );
}

const ABOUT_PHOTOS = {
  portrait: { src: '/Kleopatra.JPG' },
  studio1:  { src: '/Studio_1.JPG'  },
  studio2:  { src: '/Studio_2.JPG'  },
  pigments: { src: '/Farben.JPG'    },
};

function AboutPhoto({ src, alt, className }) {
  return (
    <figure className={className}>
      <img className="about-photo" src={src} alt={alt} loading="lazy" decoding="async" />
    </figure>
  );
}

export default function About({ onBack }) {
  const { t } = useI18n();
  const alts = t.about.photoAlts;
  return (
    <div className="page with-bg">
      <PageHead
        kicker={t.about.kicker}
        title={t.about.title} titleEm={t.about.titleEm}
        meta={<>
          <b>{t.about.metaLine1}</b>
          <div>{t.about.metaLine2}</div>
          <div>{t.about.metaLine3}</div>
        </>}
        onBack={onBack}
      />

      <AboutSectionTitle>{t.about.sectionAbout}</AboutSectionTitle>
      <div className="about-hero">
        <div className="about-copy">
          <p>{t.about.p1}</p>
          <p>{t.about.p2}</p>
          <p>{t.about.p3}</p>
        </div>
        <AboutPhoto
          className="about-hero-img"
          src={ABOUT_PHOTOS.portrait.src}
          alt={alts.portrait}
        />
      </div>

      <AboutSectionTitle>{t.about.sectionStudio}</AboutSectionTitle>
      <div className="about-studio-grid">
        <AboutPhoto
          className="about-studio-img"
          src={ABOUT_PHOTOS.studio1.src}
          alt={alts.studio1}
        />
        <AboutPhoto
          className="about-studio-img"
          src={ABOUT_PHOTOS.studio2.src}
          alt={alts.studio2}
        />
      </div>

      <div className="about-material">
        <AboutPhoto
          className="about-material-img"
          src={ABOUT_PHOTOS.pigments.src}
          alt={alts.pigments}
        />
        <div className="about-material-copy">
          <AboutSectionTitle style={{ marginBottom: 16 }}>{t.about.sectionMaterial}</AboutSectionTitle>
          <p>{t.about.material}</p>
        </div>
      </div>

      <div className="about-mv-grid">
        <section className="about-mv-block" aria-labelledby="about-mission-heading">
          <AboutSectionTitle style={{ marginBottom: 20 }} id="about-mission-heading">
            {t.about.sectionMission}
          </AboutSectionTitle>
          <p>{t.about.mission}</p>
        </section>
        <section className="about-mv-block" aria-labelledby="about-vision-heading">
          <AboutSectionTitle style={{ marginBottom: 20 }} id="about-vision-heading">
            {t.about.sectionVision}
          </AboutSectionTitle>
          <p>{t.about.vision}</p>
        </section>
      </div>
    </div>
  );
}
