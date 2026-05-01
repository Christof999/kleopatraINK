// Wanna-dos kommen jetzt aus Firebase Firestore/Storage.
// Upload über die Admin-App — siehe src/hooks/useWannados.js
//
// Firestore-Collection: "wannados"
// Felder pro Dokument:
//   src        — Firebase Storage Download-URL
//   title      — Name des Motivs
//   style      — Tattoo-Stil
//   placement  — Körperstelle, z. B. "Unterarm"
//   target     — "Alle" | "Frau" | "Mann"
//   desc       — optionale Beschreibung
//   available  — false wenn das Motiv vergeben ist
//   order      — Zahl für manuelle Sortierung (optional)
