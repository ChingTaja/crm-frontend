import { unwrapResponse, deleteRecords } from '../../../lib/api-operations';
import { collectPages } from '../../../lib/api-pagination';
import type { Api, CustomerResponse } from '../../../api/Api';

function customer(record: CustomerResponse) {
  if (!record?.id) throw new Error('Customer API 回傳的 ID 不正確。');
  return record;
}
export function createCustomerApi(client: Api<unknown>['api']) {
  const remove = async (signal: AbortSignal, id: string) => {
    await client.deleteCustomers(encodeURIComponent(id), { signal });
  };
  const list = async (signal: AbortSignal, query: Parameters<Api<unknown>['api']['findAllCustomers']>[0] = { page: 0, size: 20 }) => {
    const data = await unwrapResponse(client.findAllCustomers(query, { signal, format: 'json' }));
    if (!data || !Array.isArray(data.content) || !Number.isInteger(data.totalPages) || !Number.isInteger(data.totalElements)) {
      throw new Error('Customer 列表回傳格式不正確。');
    }
    return { ...data, content: data.content.map(customer) };
  };
  return {
    list,
    listAll: (signal: AbortSignal) => collectPages(signal, list),
    async get(signal: AbortSignal, id: string) {
      return customer(await unwrapResponse(client.findByIdCustomer(encodeURIComponent(id), { signal, format: 'json' })));
    },
    async save(signal: AbortSignal, record: CustomerResponse) {
      const { id, ...fields } = record;
      const params = { signal, format: 'json' as const };
      return customer(await unwrapResponse(id
        ? client.updateCustomers(encodeURIComponent(id), fields, params)
        : client.createCustomers(fields, params)));
    },
    remove,
    removeMany: (signal: AbortSignal, ids: string[]) => deleteRecords(signal, ids, remove),
  };
}
