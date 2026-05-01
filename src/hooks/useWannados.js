import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

// Firestore collection: "wannados"
// Fields per document:
//   src         string   — Firebase Storage download URL
//   title       string   — motif name
//   style       string   — tattoo style
//   placement   string   — body placement, e.g. "Unterarm"
//   target      string   — "Alle" | "Frau" | "Mann"
//   desc        string   — optional description
//   available   boolean  — false when the motif is already taken
//   order       number   — optional, for manual sort order
//   placement3d object   — optional 3D preview { decals, gender, decalSize, bodyModelUrl }

export function useWannados() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(!!db);

  useEffect(() => {
    if (!db) return;
    // Fetch all docs, sort client-side — orderBy('order') in Firestore would
    // silently exclude documents that don't have the field set.
    getDocs(collection(db, 'wannados'))
      .then((snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        docs.sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));
        setItems(docs);
        setLoading(false);
      })
      .catch((err) => {
        console.error('[Wannados] Firestore fetch failed:', err);
        setLoading(false);
      });
  }, []);

  return { items, loading };
}
