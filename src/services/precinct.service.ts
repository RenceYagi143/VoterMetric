import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Precinct } from '../types';

export const PrecinctService = {
  getPrecincts: async (): Promise<Precinct[]> => {
    const q = query(collection(db, 'precincts'), orderBy('name', 'asc'), limit(250));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Precinct));
  }
};
