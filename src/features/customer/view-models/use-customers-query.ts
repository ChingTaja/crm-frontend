import { useCallback, useEffect, useSyncExternalStore } from 'react'
import { useApi } from '@/hooks/use-api'
import { customerApi } from '../models/customer-service'
import { customerRepository } from '../models/customer-model'

export function useCustomersQuery() {
  const records = useSyncExternalStore(customerRepository.subscribe, customerRepository.getSnapshot)
  const { execute, cancel, ...state } = useApi(customerApi.listAll)
  const reload = useCallback(() => {
    // Errors are exposed through useApi; never substitute demo records.
    void execute().then(customerRepository.replaceAll).catch(() => {})
  }, [execute])
  useEffect(() => { reload(); return cancel }, [reload, cancel])
  return { ...state, records, reload }
}
