import { createGeneratedApi } from '../../../api/client';
import { createRepository } from '../../../lib/in-memory-repository';
import type { Quote } from './quote-types';
import { createQuoteApi } from './quote-api';
export const quoteApi = createQuoteApi(createGeneratedApi(import.meta.env.VITE_API_BASE_URL || '/api').api);
export const quoteCache = createRepository<Quote>([]);
export function cacheQuote(quote: Quote) { quoteCache.replaceAll([...quoteCache.getSnapshot().filter(q => q.id !== quote.id), quote]); return quote; }
