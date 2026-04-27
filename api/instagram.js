// Vercel Serverless Function — proxied damit der Token nie im Browser-Code landet
// Umgebungsvariable in Vercel setzen: IG_ACCESS_TOKEN = <dein long-lived token>
//
// Token holen:
//   1. developers.facebook.com → App → Instagram Graph API → Token-Generator
//   2. Short-lived token → "Generate Long-Lived Token" (gültig 60 Tage)
//   3. Token in Vercel Dashboard → Settings → Environment Variables eintragen
//
// Token verlängern (vor Ablauf aufrufen):
//   GET https://graph.instagram.com/refresh_access_token
//       ?grant_type=ig_refresh_token&access_token=<TOKEN>

const IG_API = 'https://graph.instagram.com';
const MEDIA_FIELDS = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp';
const PROFILE_FIELDS = 'id,username,media_count';

export default async function handler(req, res) {
  // CORS für den eigenen Frontend-Origin erlauben
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const token = process.env.IG_ACCESS_TOKEN;

  if (!token) {
    return res.status(200).json({ configured: false, profile: null, posts: [] });
  }

  try {
    const [mediaRes, profileRes] = await Promise.all([
      fetch(`${IG_API}/me/media?fields=${MEDIA_FIELDS}&limit=12&access_token=${token}`),
      fetch(`${IG_API}/me?fields=${PROFILE_FIELDS}&access_token=${token}`),
    ]);

    const [mediaData, profileData] = await Promise.all([
      mediaRes.json(),
      profileRes.json(),
    ]);

    if (mediaData.error) {
      console.error('Instagram API error:', mediaData.error);
      return res.status(200).json({ configured: true, error: mediaData.error.message, posts: [] });
    }

    const posts = (mediaData.data || [])
      .filter((p) => p.media_type === 'IMAGE' || p.media_type === 'CAROUSEL_ALBUM')
      .map((p) => ({
        id:        p.id,
        src:       p.media_url,
        caption:   p.caption || '',
        permalink: p.permalink,
        timestamp: p.timestamp,
      }));

    // 1 Stunde cachen — Vercel CDN + Browser
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json({
      configured: true,
      profile: {
        username:   profileData.username   || 'kleopatra.ink',
        mediaCount: profileData.media_count ?? null,
      },
      posts,
    });
  } catch (err) {
    console.error('Instagram fetch failed:', err);
    return res.status(200).json({ configured: true, error: err.message, posts: [] });
  }
}
