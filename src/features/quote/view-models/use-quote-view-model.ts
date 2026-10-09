import { useAccess } from '@/features/access/view-models/use-access';
import { useProductsQuery } from '@/features/product/view-models/use-products-query';
import { useCustomersQuery } from '@/features/customer/view-models/use-customers-query';
import { useOpportunitiesQuery } from '@/features/opportunity/view-models/use-opportunities-query';
import type { QuoteActor } from '../models/quote-types';
export function useQuoteViewModel() {
  const { me } = useAccess();
  const customerQuery = useCustomersQuery();
  const productQuery = useProductsQuery();
  const opportunityQuery = useOpportunitiesQuery();
  const actor: QuoteActor | null = me ? { id: me.id, name: me.username, permissionCodes: me.permissionCodes } : null;
  return { actor, customers: customerQuery.records, products: productQuery.records, opportunities: opportunityQuery.records, productQuery, customerQuery, opportunityQuery };
}
export type QuoteViewModel = ReturnType<typeof useQuoteViewModel>;
