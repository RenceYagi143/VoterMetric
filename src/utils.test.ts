import { describe, it, expect } from 'vitest';
import { getAffiliationStyles } from './lib/utils';
import type { Affiliation } from './types';

describe('Logic Efficiency & Utils Test', () => {
  it('should correctly map political affiliations to tailwind classes', () => {
    expect(getAffiliationStyles('Red')).toContain('bg-red-600');
    expect(getAffiliationStyles('Blue')).toContain('bg-blue-600');
    expect(getAffiliationStyles('Neutral')).toContain('bg-gray-400');
    expect(getAffiliationStyles('Other')).toContain('bg-purple-600');
    // Cast to test the default/fallback branch for unexpected values
    expect(getAffiliationStyles('Unknown' as Affiliation)).toContain('bg-gov-gold');
  });
});
