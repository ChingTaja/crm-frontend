import { createGeneratedApi } from '../../../api/client';
import { unwrapResponse, deleteRecords } from '../../../lib/api-operations';
import { currencyRecords } from './currency-model';
import { ContentType } from '../../../api/Api';
import type { Currency } from './currency-model';

export function createCurrencyApi(client: ReturnType<typeof createGeneratedApi>) {
  const remove = async (signal: AbortSignal, code: string) => {
    await client.request({ path: `/api/currencies/${encodeURIComponent(code)}`, method: 'DELETE', signal });
  };
  return {
    async list(signal: AbortSignal) {
      const data = await unwrapResponse(client.request<unknown, unknown>({
        path: '/api/currencies', method: 'GET', signal, format: 'json',
      }));
      return currencyRecords(data);
    },
    async get(signal: AbortSignal, code: string) {
      const data = await unwrapResponse(client.request<unknown, unknown>({
        path: `/api/currencies/${encodeURIComponent(code)}`, method: 'GET', signal, format: 'json',
      }));
      const record = currencyRecords([data])[0];
      if (record.code !== code) throw new Error('回傳幣別代碼不一致');
      return record;
    },
    async save(signal: AbortSignal, fields: Currency, code?: string) {
      const payload = currencyRecords([fields])[0];
      if (code && payload.code !== code) throw new Error('幣別代碼不可修改');
      const data = await unwrapResponse(client.request<unknown, unknown>({
        path: code ? `/api/currencies/${encodeURIComponent(code)}` : '/api/currencies',
        method: code ? 'PUT' : 'POST', body: payload, type: ContentType.Json, signal, format: 'json',
      }));
      const record = currencyRecords([data])[0];
      if (record.code !== payload.code) throw new Error('回傳幣別代碼不一致');
      return record;
    },
    remove,
    removeMany: (signal: AbortSignal, codes: string[]) => deleteRecords(signal, codes, remove),
  };
}
