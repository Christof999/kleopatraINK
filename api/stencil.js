// Wandelt ein hochgeladenes Bild über Replicate in eine motivtreue
// Linien-Vorlage um (Lineart). Das Auskeyen von Weiß → transparent und
// das finale Schwarz/Weiß passiert clientseitig auf einem Canvas, damit
// diese Funktion ohne schwere Bildbibliotheken auskommt.
//
// Benötigte Env-Variablen (in Vercel hinterlegen):
//   REPLICATE_API_TOKEN  – Token aus dem Replicate-Konto
//   STENCIL_PASSCODE     – internes Passwort fürs Studio
//   REPLICATE_MODEL      – optional, Standard siehe DEFAULT_MODEL
//                          (Format "owner/name"); ggf. an verfügbares
//                          Lineart-Modell anpassen.

const DEFAULT_MODEL = 'fofr/image-to-line-drawing';

export const config = {
  api: {
    bodyParser: { sizeLimit: '8mb' },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const token = process.env.REPLICATE_API_TOKEN;
  const passcode = process.env.STENCIL_PASSCODE;
  const model = process.env.REPLICATE_MODEL || DEFAULT_MODEL;

  if (!token || !passcode) {
    return res.status(503).json({ error: 'not_configured' });
  }

  const { image, passcode: given } = req.body || {};

  // Interner Zugangsschutz (Studio-Passcode)
  if (!given || given !== passcode) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  if (!image || typeof image !== 'string' || !image.startsWith('data:image/')) {
    return res.status(400).json({ error: 'invalid_image' });
  }

  try {
    // Replicate: neueste Version des Modells synchron ausführen.
    // "Prefer: wait" lässt Replicate bis zu 60s auf das Ergebnis warten.
    const createRes = await fetch(
      `https://api.replicate.com/v1/models/${model}/predictions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Prefer: 'wait',
        },
        body: JSON.stringify({ input: { image } }),
      }
    );

    const prediction = await createRes.json();

    if (!createRes.ok) {
      console.error('[api/stencil] Replicate create error:', prediction);
      return res.status(502).json({ error: 'replicate_failed', detail: prediction?.detail });
    }

    // Falls noch nicht fertig: kurz pollen.
    let result = prediction;
    const getUrl = prediction?.urls?.get;
    let tries = 0;
    while (result?.status && result.status !== 'succeeded' && result.status !== 'failed' && result.status !== 'canceled' && getUrl && tries < 40) {
      await new Promise((r) => setTimeout(r, 1500));
      const pollRes = await fetch(getUrl, { headers: { Authorization: `Bearer ${token}` } });
      result = await pollRes.json();
      tries += 1;
    }

    if (result?.status !== 'succeeded') {
      console.error('[api/stencil] Prediction not succeeded:', result?.status, result?.error);
      return res.status(502).json({ error: 'generation_failed', status: result?.status });
    }

    // Output ist je nach Modell ein String (URL) oder ein Array von URLs.
    const output = Array.isArray(result.output) ? result.output[0] : result.output;
    if (!output) {
      return res.status(502).json({ error: 'empty_output' });
    }

    return res.status(200).json({ output });
  } catch (err) {
    console.error('[api/stencil] Fetch failed:', err);
    return res.status(500).json({ error: 'server_error' });
  }
}
