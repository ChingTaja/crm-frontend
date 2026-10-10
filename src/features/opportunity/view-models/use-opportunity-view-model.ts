import { deletionSummary } from '@/lib/api-operations';
import { useCustomersQuery } from '@/features/customer/view-models/use-customers-query';
import { useLeadsQuery } from '@/features/lead/view-models/use-leads-query';
import { useEntityFields } from '@/hooks/use-entity-fields';
import { metadataRows } from '@/lib/entity-fields';
import { useEntityList } from '@/hooks/use-entity-list';
import { opportunityOutcome, opportunityStageLabel, opportunityRepository } from '../models/opportunity-model';
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
    const summary = deletionSummary(result, query.records);
    await query.reload().catch(() => {});
    if (result.failed.length) {
      throw new Error(summary);
    }
    return summary;
  }
  const fields = metadata.fields.map((field) => {
    const records =
      field.apiFieldName === 'customerId' ? customers.records : field.apiFieldName === 'leadId' ? leads.records : null;
    if (field.apiFieldName === 'stage') return { ...field, options: field.options?.map(option => ({ ...option, label: opportunityStageLabel(option.value) })) };
    return records
      ? { ...field, options: records.map((record) => ({ value: record.id ?? '', label: record.name ?? '' })) }
      : field;
  });
  const rows = metadataRows(opportunities, fields).map((row, index) => ({
    ...row,
    displayValues: row.displayValues.map((value, fieldIndex) => fields[fieldIndex].apiFieldName === 'stage'
      ? `${opportunityStageLabel(opportunities[index].stage)}${opportunityOutcome(opportunities[index].stage) === 'lost' ? ` · ${opportunities[index].closeDescription || '未填寫理由'}` : ''}`
      : value),
  }));
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
