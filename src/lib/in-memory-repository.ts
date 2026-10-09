export function createRepository<T extends { id?: string }>(
  initial: T[]
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
      const next = records.filter((record) => !record.id || !selected.has(record.id));
      if (next.length === records.length) return;
      records = next;
      listeners.forEach((listener) => listener());
    },

  };
}
