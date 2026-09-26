import { unwrapResponse, deleteRecords } from '../../../lib/api-operations';
import { collectPages } from '../../../lib/api-pagination';
import type { Api, ContactResponse } from '../../../api/Api';

function contact(record: ContactResponse) {
  if (!record?.id) throw new Error('Contact API 回傳的 ID 不正確。');
  return record;
}
export function createContactApi(client: Api<unknown>['api']) {
  const remove = async (signal: AbortSignal, id: string) => {
    await client.deleteContacts(encodeURIComponent(id), { signal });
  };
  const list = async (signal: AbortSignal, query: Parameters<Api<unknown>['api']['findAllContacts']>[0] = { page: 0, size: 20 }) => {
    const data = await unwrapResponse(client.findAllContacts(query, { signal, format: 'json' }));
    if (!data || !Array.isArray(data.content) || !Number.isInteger(data.totalPages) || !Number.isInteger(data.totalElements)) {
      throw new Error('Contact 列表回傳格式不正確。');
    }
    return { ...data, content: data.content.map(contact) };
  };
  return {
    list,
    listAll: (signal: AbortSignal) => collectPages(signal, list),
    async get(signal: AbortSignal, id: string) {
      return contact(await unwrapResponse(client.findByIdContact(encodeURIComponent(id), { signal, format: 'json' })));
    },
    async save(signal: AbortSignal, record: ContactResponse) {
      const { id, ...fields } = record;
      const params = { signal, format: 'json' as const };
      return contact(await unwrapResponse(id
        ? client.updateContacts(encodeURIComponent(id), fields, params)
        : client.createContacts(fields, params)));
    },
    remove,
    removeMany: (signal: AbortSignal, ids: string[]) => deleteRecords(signal, ids, remove),
  };
}
