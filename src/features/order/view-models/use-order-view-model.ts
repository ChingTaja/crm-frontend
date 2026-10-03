import { useCallback, useState } from 'react';
import { useCustomersQuery } from '@/features/customer/view-models/use-customers-query';
import { useEntityFields } from '@/hooks/use-entity-fields';
import { usePaginatedQuery } from '@/hooks/use-paginated-query';
import { metadataRows } from '@/lib/entity-fields';
import type { OrderQuery } from '../models/order-api';
import { orderApi } from '../models/order-service';

export function useOrderViewModel() {
  const [filters, setFilters] = useState<OrderQuery>({ sort: 'createdAt', direction: 'desc' });
  const customers = useCustomersQuery();
  const metadata = useEntityFields('orders');
  const request = useCallback(
    (signal: AbortSignal, page: { page: number; size: number }) => orderApi.list(signal, { ...filters, ...page }),
    [filters]
  );
  const query = usePaginatedQuery(request);
  function search(next: OrderQuery) {
    query.pagination.setPage(1);
    setFilters({ ...next, keyword: next.keyword?.trim() || undefined });
  }
  return { query, metadata, customers, filters, search, rows: metadataRows(query.records, metadata.fields) };
}
