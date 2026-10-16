import { refreshAfterForbidden } from './quote-permission-recovery';
import { createGeneratedApi } from '../../../api/client';
import { createRepository } from '../../../lib/in-memory-repository';
import type { Quote } from './quote-types';
import { createQuoteApi } from './quote-api';
export const quoteApi = createQuoteApi(createGeneratedApi(import.meta.env.VITE_API_BASE_URL || '/api').api);
export const quoteCache = createRepository<Quote>([]);
export function cacheQuote(quote: Quote) {
  quoteCache.replaceAll([...quoteCache.getSnapshot().filter((q) => q.id !== quote.id), quote]);
  return quote;
}

export function revokeQuoteActions(id: string) {
  const record = quoteCache.getSnapshot().find((quote) => quote.id === id);
  if (record)
    cacheQuote({ ...record, versions: record.versions.map((version) => ({ ...version, allowedActions: [] })) });
}
export async function refreshQuoteAfterForbidden(error: unknown, id: string, read = quoteApi.get, fallback?: Quote) {
  return refreshAfterForbidden(
    error,
    async () => {
      cacheQuote(await read(new AbortController().signal, id));
    },
    () => {
      if (fallback && !quoteCache.getSnapshot().some((record) => record.id === id)) cacheQuote(fallback);
      revokeQuoteActions(id);
    }
  );
}
