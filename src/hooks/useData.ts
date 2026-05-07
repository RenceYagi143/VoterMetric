import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { VoterService } from '../services/voter.service';
import { PrecinctService } from '../services/precinct.service';
import { handleFirestoreError } from '../lib/error-handler';
import { OperationType } from '../types';
import { QueryDocumentSnapshot } from 'firebase/firestore';

export function useVoters(filters: { precinctId?: string, limit?: number }) {
  const { 
    data, 
    isLoading: loading, 
    error, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useInfiniteQuery({
    queryKey: ['voters', filters],
    queryFn: ({ pageParam }) => VoterService.getVoters(filters, pageParam as QueryDocumentSnapshot | null),
    initialPageParam: null as QueryDocumentSnapshot | null,
    getNextPageParam: (lastPage) => lastPage.lastVisible || undefined,
  });

  if (error) {
    handleFirestoreError(error as any, OperationType.LIST, 'voters', false);
  }

  const voters = data?.pages.flatMap(page => page.voters) || [];

  return { voters, loading, fetchNextPage, hasNextPage, isFetchingNextPage };
}

export function useVoterSearch(searchQuery: string, category: string) {
  const { data: searchResults = [], isLoading: searchLoading, error } = useQuery({
    queryKey: ['voters', 'search', searchQuery, category],
    queryFn: () => VoterService.searchVoters(searchQuery, category),
    enabled: !!searchQuery,
  });

  if (error) {
    handleFirestoreError(error as any, OperationType.LIST, 'voters', false);
  }

  return { searchResults, searchLoading };
}

export function usePrecincts() {
  const { data: precincts = [], isLoading: loading, error } = useQuery({
    queryKey: ['precincts'],
    queryFn: () => PrecinctService.getPrecincts(),
  });

  if (error) {
    handleFirestoreError(error, OperationType.LIST, 'precincts', false);
  }

  return { precincts, loading };
}
