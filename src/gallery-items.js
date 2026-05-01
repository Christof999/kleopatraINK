// Gallery images kommen jetzt aus Firebase Firestore/Storage.
// Upload über die Admin-App — siehe src/hooks/useGallery.js
//
// Firestore-Collection: "gallery"
// Felder pro Dokument:
//   src       — Firebase Storage Download-URL
//   style     — "Fineline" | "Dotwork" | "Realism" | "Black & White" | "Neotraditional" | "Oldschool"
//   piece     — optionaler Anzeigename
//   createdAt — Firestore Server-Timestamp (wird von der Admin-App gesetzt)

export const GAL_FILTERS = [
  'Alle',
  'Fineline',
  'Dotwork',
  'Realism',
  'Black & White',
  'Neotraditional',
  'Oldschool',
];
