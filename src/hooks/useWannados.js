import { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';

// Firestore collection: "wannados"
// Expected fields per document:
//   src        string   — Firebase Storage download URL
//   title      string   — motif name
//   style      string   — tattoo style
//   placement  string   — body placement, e.g. "Unterarm"
//   target     string   — "Alle" | "Frau" | "Mann"
//   desc       string   — optional description
//   available  boolean  — false when the motif is already taken
//   order      number   — optional, for manual sort order (set by admin app)

export function useWannados() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(!!db);

  useEffect(() => {
    if (!db) return;
    getDocs(query(collection(db, 'wannados'), orderBy('order', 'asc')))
      .then((snap) => {
        setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      })
      .catch(() => {
        // orderBy('order') fails if no index or no 'order' field — fall back without sort
        getDocs(collection(db, 'wannados'))
          .then((snap) => {
            setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
            setLoading(false);
          })
          .catch((err) => {
            console.error('[Wannados] Firestore fetch failed:', err);
            setLoading(false);
          });
      });
  }, []);

  return { items, loading };
}
