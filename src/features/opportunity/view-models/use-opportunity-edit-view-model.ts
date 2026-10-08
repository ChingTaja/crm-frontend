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
    if (!draft.customerId) throw new Error('請選擇所屬客戶。');
    if (!Number.isFinite(draft.amount) || draft.amount < 0) throw new Error('金額必須為非負數。');
    const saved = await request.execute(
      { ...draft, leadId: draft.leadId || undefined, expectedCloseDate: draft.expectedCloseDate || undefined },
      record?.id
    );
    cacheOpportunity(saved);
  });
  return { ...form, customers: customerQuery.records, customerQuery, leads: leadQuery.records, leadQuery };
}
