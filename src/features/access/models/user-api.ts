import type { Api, RegisterRequest, UpdateUserRequest, UserResponse } from '../../../api/Api';
import { unwrapResponse, deleteRecords } from '../../../lib/api-operations';

function userRecord(record: UserResponse) {
  if (!record?.id) throw new Error('帳號 API 回傳的 ID 不正確。');
  return record;
}

export function createUserApi(client: Api<unknown>['api']) {
  const remove = async (signal: AbortSignal, id: string) => {
    await client.deleteUsers(encodeURIComponent(id), { signal });
  };
  return {
    async list(signal: AbortSignal, query: Parameters<Api<unknown>['api']['findAllUsers']>[0]) {
      const data = await unwrapResponse(client.findAllUsers(query, { signal, format: 'json' }));
      if (
        !Array.isArray(data?.content) ||
        !Number.isInteger(data.totalPages) ||
        !Number.isInteger(data.totalElements)
      ) {
        throw new Error('帳號列表回傳格式不正確。');
      }
      return { ...data, content: data.content.map(userRecord) };
    },
    get: async (signal: AbortSignal, id: string) =>
      userRecord(await unwrapResponse(client.findByIdUser(encodeURIComponent(id), { signal, format: 'json' }))),
    create: (signal: AbortSignal, data: RegisterRequest) =>
      unwrapResponse(client.createUsers(data, { signal, format: 'json' })),
    update: (signal: AbortSignal, id: string, data: UpdateUserRequest) =>
      unwrapResponse(client.updateUsers(encodeURIComponent(id), data, { signal, format: 'json' })),
    remove,
    removeMany: (signal: AbortSignal, ids: string[]) => deleteRecords(signal, ids, remove),
  };
}
