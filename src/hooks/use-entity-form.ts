import { useEffect, useRef, useState, type FormEvent } from 'react';

export function useEntityForm<T extends { id: string; name: string }>(
  entity: string,
  initialRecord: T,
  saveRecord: (draft: T) => void | Promise<unknown>
) {
  const [initial] = useState(() => structuredClone(initialRecord));
  const [draft, setDraft] = useState(() => structuredClone(initial));
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const busy = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const back = () => {
    if (!busy.current) window.location.hash = `/${entity}`;
  };
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    busy.current = true;
    setIsSaving(true);
    setError('');
    try {
      if (!draft.name.trim()) throw new Error('請輸入名稱。');
      await saveRecord({ ...draft, name: draft.name.trim() });
      if (mounted.current) window.location.hash = `/${entity}`;
    } catch (error) {
      if (mounted.current) setError(error instanceof Error ? error.message : '儲存失敗。');
    } finally {
      busy.current = false;
      if (mounted.current) setIsSaving(false);
    }
  }
  return {
    draft,
    error,
    back,
    save,
    isSaving,
    isDirty: JSON.stringify(draft) !== JSON.stringify(initial),
    reset: () => {
      setDraft(structuredClone(initial));
      setError('');
    },
    update: <K extends keyof T>(field: K, value: T[K]) => {
      setDraft((current) => ({ ...current, [field]: value }));
      setError('');
    },
  };
}
