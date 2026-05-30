import PageHead from '../components/PageHead';
import InstagramFeed from '../components/InstagramFeed';

export default function Socials({ onBack }) {
  return (
    <div className="page with-bg">
      <PageHead
        kicker="Instagram · @kleopatra.ink"
        title="Unsere" titleEm="Arbeiten"
        meta={<>
          <div>Tägliche Posts</div>
          <div>DM offen</div>
        </>}
        onBack={onBack}
      />
      <InstagramFeed />
    </div>
  );
}
