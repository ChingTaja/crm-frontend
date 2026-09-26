// Keep generated page and record types inferred from the supplied endpoint.
export async function collectPages<T>(
  signal: AbortSignal,
  load: (signal: AbortSignal, query: { page: number; size: number }) => Promise<{ content?: T[]; totalPages?: number }>,
) {
  const records: T[] = [];
  for (let page = 0; ; page++) {
    signal.throwIfAborted();
    const result = await load(signal, { page, size: 100 });
    records.push(...result.content ?? []);
    if (page + 1 >= (result.totalPages ?? 1)) return records;
  }
}
