import { useState, useEffect } from 'react';
import { useI18n } from '../i18n';

function PostGrid({ posts }) {
  const { t } = useI18n();
  return (
    <div className="ig-grid">
      {posts.map((post) => (
        <a
          key={post.id}
          href={post.permalink}
          target="_blank"
          rel="noopener noreferrer"
          className="ig-post"
          aria-label={post.caption ? post.caption.slice(0, 80) : 'Instagram-Post'}
        >
          <img src={post.src} alt="" loading="lazy" className="ig-img" />
          <div className="ig-overlay">
            {post.caption && (
              <p className="ig-caption">
                {post.caption.length > 120
                  ? post.caption.slice(0, 120) + '…'
                  : post.caption}
              </p>
            )}
            <span className="ig-open">{t.instagram.open}</span>
          </div>
        </a>
      ))}
    </div>
  );
}

function NotConfigured() {
  const { t } = useI18n();
  return (
    <div className="ig-static-card">
      <a
        href="https://www.instagram.com/kleopatra.ink/"
        target="_blank"
        rel="noopener noreferrer"
        className="ig-profile-header"
      >
        <div className="ig-profile-info">
          <span className="ig-username">@kleopatra.ink</span>
          <span className="ig-meta">Instagram</span>
        </div>
        <span className="ig-follow-btn">{t.instagram.follow}</span>
      </a>

      <div className="ig-static-stats">
        <div className="ig-stat">
          <b>309</b>
          <span>{t.instagram.posts}</span>
        </div>
        <div className="ig-stat-divider" />
        <div className="ig-stat">
          <b>4.520</b>
          <span>{t.instagram.followers}</span>
        </div>
      </div>

      <a
        href="https://www.instagram.com/kleopatra.ink/"
        target="_blank"
        rel="noopener noreferrer"
        className="ig-visit-link"
      >
        {t.instagram.visit}
      </a>
    </div>
  );
}

export default function InstagramFeed() {
  const { t } = useI18n();
  const [state, setState] = useState({ status: 'loading', posts: [], profile: null });

  useEffect(() => {
    let cancelled = false;
    fetch('/api/instagram')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (!data.configured) {
          setState({ status: 'not_configured', posts: [], profile: null });
        } else if (data.error) {
          setState({ status: 'error', error: data.error, posts: [], profile: null });
        } else {
          setState({ status: 'ok', posts: data.posts, profile: data.profile });
        }
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error', posts: [], profile: null });
      });
    return () => { cancelled = true; };
  }, []);

  if (state.status === 'loading') {
    return (
      <div className="ig-notice">
        <div className="ig-spinner" />
      </div>
    );
  }

  if (state.status === 'not_configured' || state.status === 'error') {
    return <NotConfigured />;
  }

  return (
    <div className="ig-feed">
      {/* Profil-Header */}
      <a
        href="https://www.instagram.com/kleopatra.ink/"
        target="_blank"
        rel="noopener noreferrer"
        className="ig-profile-header"
      >
        <div className="ig-profile-info">
          <span className="ig-username">@{state.profile?.username ?? 'kleopatra.ink'}</span>
          {state.profile?.mediaCount != null && (
            <span className="ig-meta">{state.profile.mediaCount} {t.instagram.posts}</span>
          )}
        </div>
        <span className="ig-follow-btn">{t.instagram.follow}</span>
      </a>

      {state.posts.length > 0 ? (
        <PostGrid posts={state.posts} />
      ) : (
        <NotConfigured />
      )}
    </div>
  );
}
