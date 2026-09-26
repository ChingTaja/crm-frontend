import { useEntityFields } from '@/hooks/use-entity-fields'
import { metadataRows } from '@/lib/entity-fields'
import { useEntityList } from '@/hooks/use-entity-list'
import { customerRepository } from '../models/customer-model'
import { useApi } from '@/hooks/use-api'
import { customerApi } from '../models/customer-service'
import { usePaginatedQuery } from '@/hooks/use-paginated-query'

export function useCustomerViewModel() {
  const metadata = useEntityFields('customers')
  const query = usePaginatedQuery(customerApi.list)
  const customers = query.records
  const deletion = useApi(customerApi.removeMany)
  async function removeMany(ids: string[]) {
    const result = await deletion.execute(ids)
    customerRepository.removeMany(result.deleted)
    await query.reload()
    if (result.failed.length) {
      throw new Error(`已刪除 ${result.deleted.length} 筆，${result.failed.length} 筆失敗：${result.failed[0].message}`)
    }
  }
  const fields = metadata.fields
  const rows = metadataRows(customers, fields)
  const list = useEntityList('customers', '客戶', fields, rows, removeMany, true, query.pagination)
  return { ...list, records: customers, request: {
    ...query,
    data: metadata.data ? query.data : undefined,
    error: metadata.error ?? query.error,
    isLoading: metadata.isLoading || query.isLoading,
    reload: () => { void Promise.all([metadata.reload(), query.reload()]).catch(() => {}) },
  } }
}
