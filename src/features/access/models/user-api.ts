import type { Api, RegisterRequest, UpdateUserRequest, UpdateUserStatusRequest, UserResponse } from '../../../api/Api';
import { unwrapResponse, deleteRecords } from '../../../lib/api-operations';

function userRecord(record: UserResponse) {
  if (!record?.id) throw new Error('帳號資料格式不正確，請重新載入。');
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
    async updateStatus(signal: AbortSignal, id: string, data: UpdateUserStatusRequest) {
      const record = userRecord(await unwrapResponse(client.updateUserStatus(encodeURIComponent(id), data, { signal, format: 'json' })));
      if (record.id !== id || record.enabled !== data.enabled)
        throw new Error('帳號狀態回傳格式不正確，請重新載入確認。');
      return record;
    },
    remove,
    removeMany: (signal: AbortSignal, ids: string[]) => deleteRecords(signal, ids, remove),
  };
}
