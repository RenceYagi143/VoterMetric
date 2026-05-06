import { Affiliation } from '../types';

export const getAffiliationStyles = (affiliation: string) => {
  switch (affiliation) {
    case 'Red': return 'bg-red-600 text-white border-red-700';
    case 'Blue': return 'bg-blue-600 text-white border-blue-700';
    case 'Neutral': return 'bg-gray-400 text-white border-gray-500';
    case 'Other': return 'bg-purple-600 text-white border-purple-700';
    default: return 'bg-gov-gold text-gov-navy border-yellow-600';
  }
};
