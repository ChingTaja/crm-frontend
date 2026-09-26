export function createRepository<T extends { id?: string }>(
  initial: T[],
  validateSave?: (record: T, existing: T | undefined) => void
) {
  let records = initial;
  const listeners = new Set<() => void>();
  return {
    getSnapshot: () => records,
    replaceAll(next: T[]) {
      records = next;
      listeners.forEach((listener) => listener());
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    removeMany(ids: string[]) {
      const selected = new Set(ids);
      const next = records.filter((record) => (!record.id || !selected.has(record.id)));
      if (next.length === records.length) return;
      records = next;
      listeners.forEach((listener) => listener());
    },
    save(record: T) {
      const existing = records.find((item) => item.id === record.id);
      validateSave?.(record, existing);
      const saved = { ...record, id: record.id || crypto.randomUUID() };
      records = record.id ? records.map((item) => (item.id === record.id ? saved : item)) : [saved, ...records];
      listeners.forEach((listener) => listener());
      return saved;
    },
  };
}
