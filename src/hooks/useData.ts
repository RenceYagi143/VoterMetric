import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Voter, OperationType } from '../types';
import { handleFirestoreError } from '../lib/error-handler';

export function useVoters(filters: { precinctId?: string, limit?: number }) {
  const [voters, setVoters] = useState<Voter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = query(collection(db, 'voters'), orderBy('fullName', 'asc'), limit(filters.limit || 250));

    if (filters.precinctId && filters.precinctId !== 'all') {
      q = query(collection(db, 'voters'), where('precinctId', '==', filters.precinctId), orderBy('fullName', 'asc'), limit(filters.limit || 250));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Voter));
      setVoters(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'voters');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [filters.precinctId]);

  return { voters, loading };
}

export function usePrecincts() {
  const [precincts, setPrecincts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'precincts'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPrecincts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'precincts');
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { precincts, loading };
}
