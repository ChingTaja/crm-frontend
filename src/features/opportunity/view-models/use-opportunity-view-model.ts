import { useCustomersQuery } from '@/features/customer/view-models/use-customers-query';
import { useLeadsQuery } from '@/features/lead/view-models/use-leads-query';
import { useEntityFields } from '@/hooks/use-entity-fields';
import { metadataRows } from '@/lib/entity-fields';
import { useEntityList } from '@/hooks/use-entity-list';
import { opportunityRepository } from '../models/opportunity-model';
import { useApi } from '@/hooks/use-api';
import { opportunityApi } from '../models/opportunity-service';
import { usePaginatedQuery } from '@/hooks/use-paginated-query';

export function useOpportunityViewModel() {
  const customers = useCustomersQuery();
  const leads = useLeadsQuery();
  const metadata = useEntityFields('opportunities');
  const query = usePaginatedQuery(opportunityApi.list);
  const opportunities = query.records;
  const deletion = useApi(opportunityApi.removeMany);
  async function removeMany(ids: string[]) {
    const result = await deletion.execute(ids);
    opportunityRepository.removeMany(result.deleted);
    await query.reload();
    if (result.failed.length) {
      throw new Error(
        `已刪除 ${result.deleted.length} 筆，${result.failed.length} 筆失敗：${result.failed[0].message}`
      );
    }
  }
  const fields = metadata.fields.map((field) => {
    const records =
      field.apiFieldName === 'customerId' ? customers.records : field.apiFieldName === 'leadId' ? leads.records : null;
    return records
      ? { ...field, options: records.map((record) => ({ value: record.id ?? '', label: record.name ?? '' })) }
      : field;
  });
  const rows = metadataRows(opportunities, fields);
  const list = useEntityList('opportunities', '商機', fields, rows, removeMany, true, query.pagination);
  return {
    ...list,
    records: opportunities,
    request: {
      ...query,
      data: metadata.data ? query.data : undefined,
      error: metadata.error ?? query.error ?? customers.error ?? leads.error,
      isLoading: metadata.isLoading || query.isLoading,
      reload: () => {
        customers.reload();
        leads.reload();
        void Promise.all([metadata.reload(), query.reload()]).catch(() => {});
      },
    },
  };
}
