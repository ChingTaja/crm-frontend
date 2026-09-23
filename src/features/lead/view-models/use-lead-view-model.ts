import { useSyncExternalStore } from 'react'
import { useEntityList } from '@/hooks/use-entity-list'
import type { FilterField } from '@/lib/filter-fields'
import { uniqueOptions } from '@/lib/filter-fields'
import { leadRepository, leadStatuses } from '../models/lead-model'
import { opportunityRepository } from '@/features/opportunity/models/opportunity-model'
import { useApi } from '@/hooks/use-api'
import { leadApi } from '../models/lead-service'
import { useLeadsQuery } from './use-leads-query'

export function useLeadViewModel() {
  const query = useLeadsQuery()
  const leads = query.records
  const deletion = useApi(leadApi.removeMany)
  async function removeMany(ids: string[]) {
    const result = await deletion.execute(ids)
    leadRepository.removeMany(result.deleted)
    if (result.failed.length) {
      throw new Error(`已刪除 ${result.deleted.length} 筆，${result.failed.length} 筆失敗：${result.failed[0].message}`)
    }
  }
  const opportunities = useSyncExternalStore(opportunityRepository.subscribe, opportunityRepository.getSnapshot)
  const ownerOptions = uniqueOptions([...leads, ...opportunities].map(item => item.owner))
  const fields: FilterField[] = [{ label: '名稱', type: 'text', hideable: false },
      { label: '公司', type: 'text' }, { label: '電子郵件', type: 'email' },
      { label: '來源', type: 'option', options: uniqueOptions(leads.map(item => item.source)) },
      { label: '負責人', type: 'lookup', options: ownerOptions },
      { label: '狀態', type: 'option', options: uniqueOptions([...leadStatuses]) },
  ]
  const rows = leads.map(item => ({ id: item.id, name: item.name, status: item.status, filterValues: [item.name, item.company, item.email, item.source, item.owner, item.status], cells: [item.company, item.email, item.source, item.owner, item.status] }))
  const list = useEntityList('leads', '潛在客戶', fields, rows, removeMany, true)
  return { ...list, records: leads, request: query }
}
