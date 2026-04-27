// ── Galerie — Auto-Discovery ──────────────────────────────────────────────────
//
// Bilder kommen nach:  src/assets/gallery/<stil>/dateiname.jpg
//
// Das war's. Kein weiterer Schritt nötig — Vite erkennt neue Bilder
// beim nächsten Build automatisch.
//
// Unterordner / Stile:
//   src/assets/gallery/blackwork/
//   src/assets/gallery/fineline/
//   src/assets/gallery/neo-trad/
//   src/assets/gallery/script/
//   src/assets/gallery/dotwork/
//
// Dateinamen-Tipp: sprechende Namen werden als Beschreibung angezeigt,
// z. B.  blume-handgelenk.jpg  →  "Blume Handgelenk"
//        skorpion_klavikel.jpg →  "Skorpion Klavikel"
//        IMG_0208.jpeg         →  kein Label (wird ignoriert)

const rawImages = import.meta.glob(
  './assets/gallery/**/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}',
  { eager: true }
);

const STYLE_LABELS = {
  blackwork:  'Blackwork',
  fineline:   'Fineline',
  'neo-trad': 'Neo-Trad',
  script:     'Script',
  dotwork:    'Dotwork',
};

const CAMERA_PATTERN = /^(img|dsc|dscn|p\d|mgim|mvim)[-_]?\d/i;

function pieceFromFilename(filename) {
  const base = filename.replace(/\.[^.]+$/, '');
  if (CAMERA_PATTERN.test(base)) return '';
  return base
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim();
}

export const GAL_FILTERS = ['Alle', 'Blackwork', 'Fineline', 'Neo-Trad', 'Script', 'Dotwork'];

export const GAL_ITEMS = Object.entries(rawImages)
  .map(([path, mod]) => {
    const segments = path.split('/');
    const folder   = segments[segments.length - 2];
    const filename = segments[segments.length - 1];
    return {
      style: STYLE_LABELS[folder] ?? folder,
      piece: pieceFromFilename(filename),
      src:   mod.default,
    };
  })
  .sort((a, b) => a.style.localeCompare(b.style));
