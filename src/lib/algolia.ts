import { liteClient as algoliasearch } from 'algoliasearch/lite';

const appId = import.meta.env.VITE_ALGOLIA_APP_ID || 'latency';
const searchKey = import.meta.env.VITE_ALGOLIA_SEARCH_KEY || '6be0576ff61c053d5f9a3225e2a90f76';

export const searchClient = algoliasearch(appId, searchKey);
