import { FieldValidationError, requestFieldErrors, type FieldErrors } from '@/lib/form-validation';
import { navigate } from '@/lib/router';
import { useEffect, useRef, useState, type FormEvent } from 'react';

export function useEntityForm<T extends { id?: string; name?: string }>(
  entity: string,
  initialRecord: T,
  saveRecord: (draft: T) => void | Promise<unknown>
) {
  const [initial] = useState(() => structuredClone(initialRecord));
  const [draft, setDraft] = useState(() => structuredClone(initial));
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
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
    if (!busy.current) navigate(`/${entity}`);
  };
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    busy.current = true;
    setIsSaving(true);
    setError('');
    setFieldErrors({});
    try {
      if (!draft.name?.trim()) throw new FieldValidationError({ name: '請輸入名稱。' });
      await saveRecord({ ...draft, name: draft.name.trim() });
      if (mounted.current) navigate(`/${entity}`);
    } catch (error) {
      if (mounted.current) {
        setError(error instanceof Error ? error.message : '儲存失敗。');
        setFieldErrors(requestFieldErrors(error));
      }
    } finally {
      busy.current = false;
      if (mounted.current) setIsSaving(false);
    }
  }
  return {
    draft,
    error,
    fieldErrors,
    back,
    save,
    isSaving,
    isDirty: JSON.stringify(draft) !== JSON.stringify(initial),
    reset: () => {
      setDraft(structuredClone(initial));
      setError('');
      setFieldErrors({});
    },
    update: <K extends keyof T>(field: K, value: T[K]) => {
      setDraft((current) => ({ ...current, [field]: value }));
      setError('');
      setFieldErrors(current => { const next = { ...current }; delete next[String(field)]; return next; });
    },
  };
}
