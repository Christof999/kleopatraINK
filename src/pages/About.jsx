import PageHead from '../components/PageHead';

function AboutSectionTitle({ children, style, id }) {
  return (
    <h3 className="about-section-title serif" style={style} id={id}>{children}</h3>
  );
}

const ABOUT_PHOTOS = {
  portrait: { src: '/Kleopatra.JPG', alt: 'Kleopatra INK im Tattoostudio Gunzenhausen' },
  studio1:  { src: '/Studio_1.JPG',  alt: 'Arbeitsplatz im Studio Kleopatra INK' },
  studio2:  { src: '/Studio_2.JPG',  alt: 'Studio-Innenraum Kleopatra INK Gunzenhausen' },
  pigments: { src: '/Farben.JPG',    alt: 'Professionelle Tattoo-Farben im Studio' },
};

function AboutPhoto({ src, alt, className }) {
  return (
    <figure className={className}>
      <img className="about-photo" src={src} alt={alt} loading="lazy" decoding="async" />
    </figure>
  );
}

export default function About({ onBack }) {
  return (
    <div className="page with-bg">
      <PageHead
        kicker="Über uns · Est. 2018"
        title="Das sind" titleEm="wir"
        meta={<>
          <b>Istanbul · Alanya</b>
          <div>Deutschland seit 8 Jahren</div>
          <div>Gunzenhausen</div>
        </>}
        onBack={onBack}
      />

      <AboutSectionTitle>Über uns</AboutSectionTitle>
      <div className="about-hero">
        <div className="about-copy">
          <p>
            Unsere Leidenschaft für die Tattoo-Kunst begann vor vielen Jahren als reine Faszination
            in den lebendigen Straßen von Istanbul. Um diese Begeisterung in ein professionelles
            Handwerk zu verwandeln, zog es uns nach Alanya, wo wir in einem renommierten Studio eine
            fundierte, fast 6-jährige Ausbildung absolvierten. Diese intensive Zeit legte nicht nur
            den Grundstein für unser heutiges Können, sondern brachte auch eine ganz besondere
            persönliche Wendung mit sich: Hier lernte ich meine heutige Ehefrau kennen, mit der ich
            diese Berufung seitdem teile.
          </p>
          <p>
            Vor 8 Jahren haben wir diesen Weg gemeinsam nach Deutschland verlagert. Seitdem
            konzentrieren wir uns voll und ganz auf diese eine Kunstform. In all den Jahren in
            Deutschland stand die stetige Weiterentwicklung für uns im Vordergrund: Wir arbeiten
            ausschließlich mit hochprofessionellem Equipment und setzen höchste Maßstäbe im Bereich
            der Hygiene, die für uns an oberster Stelle steht.
          </p>
          <p>
            Ein Tattoo ist für uns kein bloßes Motiv auf der Haut, sondern ein Kunstwerk für die
            Ewigkeit.
          </p>
        </div>
        <AboutPhoto
          className="about-hero-img"
          src={ABOUT_PHOTOS.portrait.src}
          alt={ABOUT_PHOTOS.portrait.alt}
        />
      </div>

      <AboutSectionTitle>Unser Studio</AboutSectionTitle>
      <div className="about-studio-grid">
        <AboutPhoto
          className="about-studio-img"
          src={ABOUT_PHOTOS.studio1.src}
          alt={ABOUT_PHOTOS.studio1.alt}
        />
        <AboutPhoto
          className="about-studio-img"
          src={ABOUT_PHOTOS.studio2.src}
          alt={ABOUT_PHOTOS.studio2.alt}
        />
      </div>

      <div className="about-material">
        <AboutPhoto
          className="about-material-img"
          src={ABOUT_PHOTOS.pigments.src}
          alt={ABOUT_PHOTOS.pigments.alt}
        />
        <div className="about-material-copy">
          <AboutSectionTitle style={{ marginBottom: 16 }}>Material &amp; Hygiene</AboutSectionTitle>
          <p>
            Wir arbeiten ausschließlich mit hochprofessionellem Equipment — dazu gehören auch
            sorgfältig ausgewählte Tattoo-Farben. Hygiene steht für uns an oberster Stelle.
          </p>
        </div>
      </div>

      <div className="about-mv-grid">
        <section className="about-mv-block" aria-labelledby="about-mission-heading">
          <AboutSectionTitle style={{ marginBottom: 20 }} id="about-mission-heading">
            Unsere Mission
          </AboutSectionTitle>
          <p>
            Für uns steht die Perfektion des Handwerks und die Zufriedenheit unserer Kunden immer an
            erster Stelle – weit vor dem finanziellen Aspekt. Unsere Mission ist es, jedem Kunden
            unter strengsten Hygienestandards und mit handwerklicher Exzellenz ein einzigartiges
            Tattoo zu erschaffen, das er ein Leben lang mit Stolz auf der Haut trägt.
          </p>
        </section>
        <section className="about-mv-block" aria-labelledby="about-vision-heading">
          <AboutSectionTitle style={{ marginBottom: 20 }} id="about-vision-heading">
            Unsere Vision
          </AboutSectionTitle>
          <p>
            Unsere Vision ist es, die in Deutschland etablierte Professionalität und unsere
            langjährige Erfahrung an die nächste Generation weiterzugeben. Durch zukünftige Schulungen
            und Ausbildungskurse für angehende Tattoo-Künstler möchten wir der Branche neue Impulse
            geben und uns als ein Studio etablieren, das als Referenz für Qualität, Hygiene und
            erstklassige Ausbildung steht.
          </p>
        </section>
      </div>
    </div>
  );
}
