import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export function usePiercingPrices() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(!!db);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    getDocs(collection(db, 'piercingPrices'))
      .then((snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        docs.sort((a, b) => {
          const orderA = Number.isFinite(a.order) ? a.order : null;
          const orderB = Number.isFinite(b.order) ? b.order : null;

          if (orderA !== null || orderB !== null) {
            return (orderA ?? Infinity) - (orderB ?? Infinity);
          }

          return (a.title ?? '').localeCompare(b.title ?? '', 'de', { sensitivity: 'base' });
        });
        setItems(docs);
        setLoading(false);
      })
      .catch((err) => {
        console.error('[PiercingPrices] Firestore fetch failed:', err);
        setError(true);
        setLoading(false);
      });
  }, []);

  return { items, loading, error };
}
