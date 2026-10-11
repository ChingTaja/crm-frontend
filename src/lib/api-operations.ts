import type { HttpResponse } from '../api/Api';

export async function unwrapResponse<T>(pending: Promise<HttpResponse<T>>) {
  const response = await pending;
  if (response.error) throw new Error('無法讀取資料，請重新載入。');
  return response.data;
}

export async function deleteRecords(
  signal: AbortSignal,
  ids: string[],
  remove: (signal: AbortSignal, id: string) => Promise<void>
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

export function deletionSummary(
  result: { deleted: string[]; failed: { id: string; message: string }[] },
  records: { id?: string; name?: string }[]
) {
  const label = (id: string) => records.find(record => record.id === id)?.name || id;
  return [
    `已刪除 ${result.deleted.length} 筆，${result.failed.length} 筆失敗。`,
    ...result.deleted.map(id => `${label(id)}：已刪除`),
    ...result.failed.map(item => `${label(item.id)}：${item.message}`),
  ].join('\n');
}
