import { useCustomersQuery } from '@/features/customer/view-models/use-customers-query'
import { useEntityFields } from '@/hooks/use-entity-fields'
import { metadataRows } from '@/lib/entity-fields'
import { useEntityList } from '@/hooks/use-entity-list'
import { contactRepository } from '../models/contact-model'
import { useApi } from '@/hooks/use-api'
import { contactApi } from '../models/contact-service'
import { usePaginatedQuery } from '@/hooks/use-paginated-query'

export function useContactViewModel() {
  const customerQuery = useCustomersQuery()
  const metadata = useEntityFields('contacts')
  const query = usePaginatedQuery(contactApi.list)
  const contacts = query.records
  const deletion = useApi(contactApi.removeMany)
  async function removeMany(ids: string[]) {
    const result = await deletion.execute(ids)
    contactRepository.removeMany(result.deleted)
    await query.reload()
    if (result.failed.length) {
      throw new Error(`已刪除 ${result.deleted.length} 筆，${result.failed.length} 筆失敗：${result.failed[0].message}`)
    }
  }
  const fields = metadata.fields.map(field => field.apiFieldName === 'customerId'
    ? { ...field, type: 'lookup' as const, options: customerQuery.records.map(customer => ({ value: customer.id ?? '', label: customer.name ?? '' })) }
    : field)
  const rows = metadataRows(contacts, fields)
  const list = useEntityList('contacts', '聯絡人', fields, rows, removeMany, true, query.pagination)
  return { ...list, records: contacts, request: {
    ...query,
    data: metadata.data && customerQuery.data ? query.data : undefined,
    error: metadata.error ?? query.error ?? customerQuery.error,
    isLoading: metadata.isLoading || query.isLoading || customerQuery.isLoading,
    reload: () => { customerQuery.reload(); void Promise.all([metadata.reload(), query.reload()]).catch(() => {}) },
  } }
}
