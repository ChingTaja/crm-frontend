import type { CreateOpportunityRequest, OpportunityResponse } from '../../../api/Api';
import { useCustomersQuery } from '@/features/customer/view-models/use-customers-query';
import { useLeadsQuery } from '@/features/lead/view-models/use-leads-query';
import { useEntityForm } from '@/hooks/use-entity-form';
import { useApi } from '@/hooks/use-api';
import { opportunityApi } from '../models/opportunity-service';
import { cacheOpportunity } from '../models/opportunity-model';

export function useOpportunityEditViewModel(record?: OpportunityResponse) {
  const customerQuery = useCustomersQuery();
  const leadQuery = useLeadsQuery();
  const request = useApi(opportunityApi.save);
  const initial: CreateOpportunityRequest = {
    name: record?.name ?? '',
    customerId: record?.customerId ?? '',
    leadId: record?.leadId ?? '',
    amount: record?.amount ?? 0,
    expectedCloseDate: record?.expectedCloseDate ?? '',
    owner: record?.owner ?? '',
  };
  const form = useEntityForm('opportunities', initial, async (draft) => {
    if (
      customerQuery.isLoading ||
      customerQuery.error ||
      !customerQuery.records.some((customer) => customer.id === draft.customerId)
    )
      throw new Error('請選擇有效的所屬客戶，或重新載入客戶資料。');
    if (
      draft.leadId &&
      (leadQuery.isLoading || leadQuery.error || !leadQuery.records.some((lead) => lead.id === draft.leadId))
    )
      throw new Error('請選擇有效的來源 Lead，或重新載入 Lead 資料。');
    if (!Number.isFinite(draft.amount) || draft.amount < 0) throw new Error('金額必須為非負數。');
    const saved = await request.execute(
      { ...draft, leadId: draft.leadId || undefined, expectedCloseDate: draft.expectedCloseDate || undefined },
      record?.id
    );
    cacheOpportunity(saved);
  });
  return { ...form, customers: customerQuery.records, customerQuery, leads: leadQuery.records, leadQuery };
}
