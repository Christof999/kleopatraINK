// ── Galerie-Bilder ────────────────────────────────────────────────────────────
//
// Bilder gehören nach:  public/gallery/<style>/dateiname.jpg
// Sie sind dann unter:  /gallery/<style>/dateiname.jpg  erreichbar
//
// Neues Bild hinzufügen:
//   1. Bild in den passenden Unterordner unter public/gallery/ legen
//   2. Hier einen neuen Eintrag anlegen:
//      { style: 'Blackwork', piece: 'Sleeve, Unterarm', src: '/gallery/blackwork/dateiname.jpg' }
//   3. Commit & Push → Vercel deployt automatisch
//
// Ohne `src` wird ein Platzhalter angezeigt.
//
// Verfügbare Stile (Filter-Chips):
//   'Blackwork' | 'Fineline' | 'Neo-Trad' | 'Script' | 'Dotwork'

export const GAL_FILTERS = ['Alle', 'Blackwork', 'Fineline', 'Neo-Trad', 'Script', 'Dotwork'];

export const GAL_ITEMS = [
  // ── Blackwork ──────────────────────────────────────────────────────────────
  { style: 'Blackwork', piece: 'Sleeve, Unterarm' },
  { style: 'Blackwork', piece: 'Full Sleeve, ornamental' },

  // ── Fineline ───────────────────────────────────────────────────────────────
  { style: 'Fineline',  piece: 'Skorpion, Klavikel' },
  { style: 'Fineline',  piece: 'Blume, Handgelenk' },

  // ── Neo-Trad ───────────────────────────────────────────────────────────────
  { style: 'Neo-Trad',  piece: 'Panther, Oberschenkel' },
  { style: 'Neo-Trad',  piece: 'Schlange, Wade' },

  // ── Script ─────────────────────────────────────────────────────────────────
  { style: 'Script',    piece: 'Schriftzug, Rippe' },

  // ── Dotwork ────────────────────────────────────────────────────────────────
  { style: 'Dotwork',   piece: 'Mandala, Rücken' },
  { style: 'Dotwork',   piece: 'Portrait, Brust' },
];
