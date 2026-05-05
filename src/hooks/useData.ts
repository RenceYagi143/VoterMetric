import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Voter, OperationType } from '../types';
import { handleFirestoreError } from '../lib/error-handler';

export function useVoters(filters: { precinctId?: string, search?: string, category?: string }) {
  const [voters, setVoters] = useState<Voter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = query(collection(db, 'voters'), orderBy('fullName', 'asc'));

    if (filters.precinctId && filters.precinctId !== 'all') {
      q = query(collection(db, 'voters'), where('precinctId', '==', filters.precinctId), orderBy('fullName', 'asc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Voter));
      
      const searchLower = filters.search?.toLowerCase() || '';
      const category = filters.category || 'All';

      const filteredData = searchLower 
        ? data.filter(v => {
            const nameMatch = v.fullName.toLowerCase().includes(searchLower);
            const addressMatch = v.address.toLowerCase().includes(searchLower);
            const precinctMatch = v.precinctName.toLowerCase().includes(searchLower);
            const affiliationMatch = v.affiliationColor.toLowerCase().includes(searchLower);

            if (category === 'Name') return nameMatch;
            if (category === 'Address') return addressMatch;
            if (category === 'Precinct') return precinctMatch;
            if (category === 'Political Affiliation') return affiliationMatch;
            
            return nameMatch || addressMatch || precinctMatch || affiliationMatch;
          })
        : data;
        
      setVoters(filteredData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'voters');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [filters.precinctId, filters.search, filters.category]);

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
