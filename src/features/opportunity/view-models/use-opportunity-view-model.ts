import { useCustomersQuery } from '@/features/customer/view-models/use-customers-query';
import { useSyncExternalStore } from 'react'
import { useEntityList } from '@/hooks/use-entity-list'
import type { FilterField } from '@/lib/filter-fields'
import { uniqueOptions } from '@/lib/filter-fields'
import { opportunityRepository, opportunityStages } from '../models/opportunity-model'
import { leadRepository } from '@/features/lead/models/lead-model'

export function useOpportunityViewModel() {
  const opportunities = useSyncExternalStore(opportunityRepository.subscribe, opportunityRepository.getSnapshot)
  const customers = useCustomersQuery().records
  const leads = useSyncExternalStore(leadRepository.subscribe, leadRepository.getSnapshot)
  const customerName = (id: string) => customers.find(item => item.id === id)?.name ?? '—'
  const customerOptions = customers.map(item => ({ value: item.id ?? '', label: item.name ?? '' }))
  const ownerOptions = uniqueOptions([...leads, ...opportunities].map(item => item.owner ?? ''))
  const money = (n: number) => `NT$ ${n.toLocaleString('zh-TW')}`
  const fields: FilterField[] = [{ label: '名稱', type: 'text', hideable: false },
      { label: '所屬客戶', type: 'lookup', options: customerOptions }, { label: '預估金額', type: 'number' },
      { label: '預計成交日', type: 'date' }, { label: '負責人', type: 'lookup', options: ownerOptions },
      { label: '階段', type: 'option', options: uniqueOptions([...opportunityStages]) },
  ]
  const rows = opportunities.map(item => ({ id: item.id, name: item.name, status: item.stage, filterValues: [item.name, item.customerId, String(item.amount), item.expectedCloseDate, item.owner, item.stage], cells: [customerName(item.customerId), money(item.amount), item.expectedCloseDate || '—', item.owner, item.stage] }))
  const list = useEntityList('opportunities', '商機', fields, rows, opportunityRepository.removeMany, true)
  return { ...list, records: opportunities }
}
