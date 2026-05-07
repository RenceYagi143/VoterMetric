import { collection, query, orderBy, where, getDocs, limit, QueryConstraint, QueryDocumentSnapshot, startAfter, documentId } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Voter } from '../types';
import { searchClient } from '../lib/algolia';

export interface GetVotersResponse {
  voters: Voter[];
  lastVisible: QueryDocumentSnapshot | null;
}

export const VoterService = {
  getVoters: async (filters: { precinctId?: string, limit?: number }, pageParam?: QueryDocumentSnapshot | null): Promise<GetVotersResponse> => {
    const constraints: QueryConstraint[] = [
      orderBy('fullName', 'asc'),
      limit(filters.limit || 50)
    ];

    if (filters.precinctId && filters.precinctId !== 'all') {
      constraints.unshift(where('precinctId', '==', filters.precinctId));
    }

    if (pageParam) {
      constraints.push(startAfter(pageParam));
    }

    const q = query(collection(db, 'voters'), ...constraints);
    const snapshot = await getDocs(q);
    
    const voters = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Voter));
    const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;

    return { voters, lastVisible };
  },

  searchVoters: async (searchQuery: string, category: string): Promise<Voter[]> => {
    if (!searchQuery) return [];
    
    const searchParams: any = {
      hitsPerPage: 30
    };
    
    if (category !== 'All') {
      let attribute = '';
      if (category === 'Name') attribute = 'fullName';
      if (category === 'Address') attribute = 'address';
      if (category === 'Precinct') attribute = 'precinctName';
      if (category === 'Political Affiliation') attribute = 'affiliationColor';
      
      if (attribute) {
        searchParams.restrictSearchableAttributes = [attribute];
      }
    }
    
    const { results } = await searchClient.search([
      {
        indexName: 'voters',
        query: searchQuery,
        params: searchParams
      }
    ]);
    
    // Algolia v5 structure
    const hits = (results[0] as any).hits || [];
    if (hits.length === 0) return [];

    const objectIDs = hits.map((hit: any) => hit.objectID);
    
    // Firestore restricts 'in' queries to 30 items
    const q = query(
      collection(db, 'voters'),
      where(documentId(), 'in', objectIDs.slice(0, 30))
    );
    
    const snapshot = await getDocs(q);
    const firestoreVoters = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Voter));
    
    // Sort firestore results by the order returned by Algolia
    const sortedVoters = objectIDs
      .map((id: string) => firestoreVoters.find(v => v.id === id))
      .filter((v: Voter | undefined): v is Voter => v !== undefined);
      
    return sortedVoters;
  }
};
