export const GENERAL_PIERCING_REQUEST = {
  id: '__piercing_general__',
  title: 'Piercing-Anfrage',
  desc: 'Ich möchte ein Piercing — Wunschplatzierung bespreche ich gern mit euch.',
  price: null,
};

export const PIERCING_CATEGORIES = [
  { id: 'ohr',     label: 'Ohr',          examples: 'Lobe · Helix · Tragus · Daith · Conch · Industrial' },
  { id: 'nase',    label: 'Nase',         examples: 'Nostril · Septum · Bridge' },
  { id: 'mund',    label: 'Mund & Lippe', examples: 'Lippenband · Medusa · Madonna · Ashley · Vertikal Labret' },
  { id: 'gesicht', label: 'Gesicht',      examples: 'Augenbraue · Anti-Eyebrow' },
  { id: 'koerper', label: 'Körper',       examples: 'Bauchnabel · Nippel · Microdermal' },
];

export const PIERCING_GUIDES = [
  {
    id: 'face',
    src: '/piercing-guide-face.jpg',
    alt: 'Piercing-Guide: Gesicht, Nase, Lippe und Ohr — Übersicht aller Platzierungen bei Kleopatra INK',
    aspect: '1 / 1',
    kicker: 'Guide · Gesicht & Mund',
    title: 'Wo welches Piercing sitzt',
    copy: 'Augenbraue, Nostril, Septum, Medusa, Madonna, Ashley, Lippenband, Vertikal Labret — die Übersicht zeigt dir auf einen Blick, welche Platzierung sich wo befindet. Wir beraten dich gerne, was zu deiner Anatomie und deinem Look passt.',
    spots: [
      'Augenbraue · vertikal über dem Auge',
      'Nostril · seitlich durchs Nasenflügel',
      'Septum · durch die Nasenscheidewand',
      'Medusa · mittig unter der Oberlippe',
      'Madonna / Monroe · seitlich über der Lippe',
      'Ashley · mittig unter der Unterlippe',
      'Vertikal Labret · vertikal durch die Unterlippe',
      'Lippenband · hinter der Oberlippe',
    ],
  },
  {
    id: 'ear',
    src: '/piercing-guide-ear.jpg',
    alt: 'Piercing-Guide: Ohr — Helix, Tragus, Daith, Conch und alle gängigen Ohr-Platzierungen',
    aspect: '3 / 4',
    kicker: 'Guide · Ohr',
    title: 'Die Sprache des Ohrs',
    copy: 'Vom klassischen Lobe-Piercing über Helix und Tragus bis zum spektakulären Industrial — das Ohr bietet unzählige Möglichkeiten. Wir kombinieren mehrere Stiche zu einem stimmigen Curated Ear, das deine Persönlichkeit unterstreicht.',
    spots: [
      'Lobe · Ohrläppchen, der Klassiker',
      'Helix · äußerer Knorpelrand',
      'Forward Helix · vorderer Knorpel',
      'Tragus · kleiner Knorpel vor dem Gehörgang',
      'Daith · innerer Knorpelbogen',
      'Rook · obere Knorpelfalte',
      'Conch · Ohrmuschel',
      'Industrial · zwei Stiche verbunden durch einen Stab',
    ],
  },
];

export const PIERCING_QUALITY = [
  { num: '01', title: 'Implant-Grade-Schmuck', text: 'Titan G23 & Niob — biokompatibel, nickelfrei, ideal für die Erstheilung. Glas und 14k-Gold auf Wunsch.' },
  { num: '02', title: 'Nadel-Technik',          text: 'Wir stechen ausschließlich mit Einweg-Nadeln. Keine Pistole. Saubere Punktion, präzise Winkel, schnellere Heilung.' },
  { num: '03', title: 'Hygiene',                text: 'Sterilisation nach DIN-Standard, autoklavierte Werkzeuge, Einmal-Handschuhe, frisches Field-Setup für jeden Stich.' },
  { num: '04', title: 'Beratung & Nachsorge',   text: 'Ausführliches Vorgespräch zu Anatomie und Schmuck. Schriftliche Pflegeanleitung, kostenloser Kontroll-Termin.' },
];
