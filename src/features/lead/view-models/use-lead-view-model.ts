import { useEntityFields } from '@/hooks/use-entity-fields'
import { metadataRows } from '@/lib/entity-fields'
import { useEntityList } from '@/hooks/use-entity-list'
import { leadRepository } from '../models/lead-model'
import { useApi } from '@/hooks/use-api'
import { leadApi } from '../models/lead-service'
import { usePaginatedQuery } from '@/hooks/use-paginated-query'

export function useLeadViewModel() {
  const metadata = useEntityFields('leads')
  const query = usePaginatedQuery(leadApi.list)
  const leads = query.records
  const deletion = useApi(leadApi.removeMany)
  async function removeMany(ids: string[]) {
    const result = await deletion.execute(ids)
    leadRepository.removeMany(result.deleted)
    await query.reload()
    if (result.failed.length) {
      throw new Error(`已刪除 ${result.deleted.length} 筆，${result.failed.length} 筆失敗：${result.failed[0].message}`)
    }
  }
  const fields = metadata.fields
  const rows = metadataRows(leads, fields)
  const list = useEntityList('leads', '潛在客戶', fields, rows, removeMany, true, query.pagination)
  return { ...list, records: leads, request: {
    ...query,
    data: metadata.data ? query.data : undefined,
    error: metadata.error ?? query.error,
    isLoading: metadata.isLoading || query.isLoading,
    reload: () => { void Promise.all([metadata.reload(), query.reload()]).catch(() => {}) },
  } }
}
