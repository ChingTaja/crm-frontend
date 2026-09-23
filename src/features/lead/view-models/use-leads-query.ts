import { useCallback, useEffect, useSyncExternalStore } from 'react'
import { useApi } from '@/hooks/use-api'
import { leadApi } from '../models/lead-service'
import { leadRepository } from '../models/lead-model'

export function useLeadsQuery() {
  const records = useSyncExternalStore(leadRepository.subscribe, leadRepository.getSnapshot)
  const { execute, cancel, ...state } = useApi(leadApi.list)
  const reload = useCallback(() => {
    // Errors are exposed through useApi; never substitute demo records.
    void execute().then(leadRepository.replaceAll).catch(() => {})
  }, [execute])
  useEffect(() => { reload(); return cancel }, [reload, cancel])
  return { ...state, records, reload }
}
