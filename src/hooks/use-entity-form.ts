import { useState, type FormEvent } from 'react'

export function useEntityForm<T extends { id: string; name: string }>(entity: string, initialRecord: T, saveRecord: (draft: T) => void) {
  const [initial] = useState(() => structuredClone(initialRecord))
  const [draft, setDraft] = useState(() => structuredClone(initial))
  const [error, setError] = useState('')
  const back = () => { window.location.hash = `/${entity}` }
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      if (!draft.name.trim()) throw new Error('請輸入名稱。')
      saveRecord({ ...draft, name: draft.name.trim() })
      back()
    } catch (error) { setError(error instanceof Error ? error.message : '儲存失敗。') }
  }
  return {
    draft, error, back, save, isDirty: JSON.stringify(draft) !== JSON.stringify(initial),
    reset: () => { setDraft(structuredClone(initial)); setError('') },
    update: <K extends keyof T>(field: K, value: T[K]) => { setDraft(current => ({ ...current, [field]: value })); setError('') },
  }
}
