import { deletionSummary } from '@/lib/api-operations';
import { useEntityFields } from '@/hooks/use-entity-fields';
import { metadataRows } from '@/lib/entity-fields';
import { useEntityList } from '@/hooks/use-entity-list';
import { leadRepository } from '../models/lead-model';
import { useApi } from '@/hooks/use-api';
import { leadApi } from '../models/lead-service';
import { usePaginatedQuery } from '@/hooks/use-paginated-query';

export function useLeadViewModel() {
  const metadata = useEntityFields('leads');
  const query = usePaginatedQuery(leadApi.list);
  const leads = query.records;
  const deletion = useApi(leadApi.removeMany);
  async function removeMany(ids: string[]) {
    const result = await deletion.execute(ids);
    leadRepository.removeMany(result.deleted);
    const summary = deletionSummary(result, query.records);
    await query.reload().catch(() => {});
    if (result.failed.length) {
      throw new Error(summary);
    }
    return summary;
  }
  const fields = metadata.fields;
  const rows = metadataRows(leads, fields);
  const list = useEntityList('leads', '潛在客戶', fields, rows, removeMany, true, query.pagination);
  return {
    ...list,
    records: leads,
    request: {
      ...query,
      data: metadata.data ? query.data : undefined,
      error: metadata.error ?? query.error,
      isLoading: metadata.isLoading || query.isLoading,
      reload: () => {
        void Promise.all([metadata.reload(), query.reload()]).catch(() => {});
      },
    },
  };
}
