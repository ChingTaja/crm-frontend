import { deletionSummary } from '@/lib/api-operations';
import { useEntityFields } from '@/hooks/use-entity-fields';
import { metadataRows } from '@/lib/entity-fields';
import { useEntityList } from '@/hooks/use-entity-list';
import { productRepository } from '../models/product-model';
import { useApi } from '@/hooks/use-api';
import { productApi } from '../models/product-service';
import { usePaginatedQuery } from '@/hooks/use-paginated-query';

export function useProductViewModel() {
  const metadata = useEntityFields('products');
  const query = usePaginatedQuery(productApi.list);
  const products = query.records;
  const deletion = useApi(productApi.removeMany);
  async function removeMany(ids: string[]) {
    const result = await deletion.execute(ids);
    productRepository.removeMany(result.deleted);
    const summary = deletionSummary(result, query.records);
    await query.reload().catch(() => {});
    if (result.failed.length) {
      throw new Error(summary);
    }
    return summary;
  }
  const fields = metadata.fields;
  const rows = metadataRows(products, fields);
  const list = useEntityList('products', '產品', fields, rows, removeMany, true, query.pagination);
  return {
    ...list,
    records: products,
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
