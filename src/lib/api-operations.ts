import type { HttpResponse } from '../api/Api';

export async function unwrapResponse<T>(pending: Promise<HttpResponse<T>>) {
  const response = await pending;
  if (response.error) throw new Error('API 回傳格式不是 JSON。');
  return response.data;
}

export async function deleteRecords(
  signal: AbortSignal,
  ids: string[],
  remove: (signal: AbortSignal, id: string) => Promise<void>,
) {
  const deleted: string[] = [];
  const failed: { id: string; message: string }[] = [];
  for (const id of new Set(ids)) {
    signal.throwIfAborted();
    try {
      await remove(signal, id);
      deleted.push(id);
    } catch (error) {
      signal.throwIfAborted();
      failed.push({ id, message: error instanceof Error ? error.message : '刪除失敗。' });
    }
  }
  return { deleted, failed };
}
