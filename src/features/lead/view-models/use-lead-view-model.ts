import { useSyncExternalStore } from 'react'
import { useEntityList } from '@/hooks/use-entity-list'
import type { FilterField } from '@/lib/filter-fields'
import { uniqueOptions } from '@/lib/filter-fields'
import { leadRepository, leadStatuses } from '../models/lead-model'
import { opportunityRepository } from '@/features/opportunity/models/opportunity-model'

export function useLeadViewModel() {
  const leads = useSyncExternalStore(leadRepository.subscribe, leadRepository.getSnapshot)
  const opportunities = useSyncExternalStore(opportunityRepository.subscribe, opportunityRepository.getSnapshot)
  const ownerOptions = uniqueOptions([...leads, ...opportunities].map(item => item.owner))
  const fields: FilterField[] = [{ label: '名稱', type: 'text', hideable: false },
      { label: '公司', type: 'text' }, { label: '電子郵件', type: 'email' },
      { label: '來源', type: 'option', options: uniqueOptions(leads.map(item => item.source)) },
      { label: '負責人', type: 'lookup', options: ownerOptions },
      { label: '狀態', type: 'option', options: uniqueOptions([...leadStatuses]) },
  ]
  const rows = leads.map(item => ({ id: item.id, name: item.name, status: item.status, filterValues: [item.name, item.company, item.email, item.source, item.owner, item.status], cells: [item.company, item.email, item.source, item.owner, item.status] }))
  const list = useEntityList('leads', '潛在客戶', fields, rows, leadRepository.removeMany, true)
  return { ...list, records: leads }
}
