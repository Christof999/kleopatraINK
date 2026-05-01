import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

// Firestore collection: "gallery"
// Expected fields per document:
//   src       string   — Firebase Storage download URL
//   style     string   — "Fineline" | "Dotwork" | "Realism" | "Black & White" | "Neotraditional" | "Oldschool"
//   piece     string   — optional display name
//   createdAt timestamp (set by admin app)

export function useGallery() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(!!db);

  useEffect(() => {
    if (!db) return;
    getDocs(collection(db, 'gallery'))
      .then((snap) => {
        const docs = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (a.style ?? '').localeCompare(b.style ?? ''));
        setItems(docs);
        setLoading(false);
      })
      .catch((err) => {
        console.error('[Gallery] Firestore fetch failed:', err);
        setLoading(false);
      });
  }, []);

  return { items, loading };
}
