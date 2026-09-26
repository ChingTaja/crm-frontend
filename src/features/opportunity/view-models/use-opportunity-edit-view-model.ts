import { useCustomersQuery } from '@/features/customer/view-models/use-customers-query';
import { useEntityForm } from '@/hooks/use-entity-form';
import { useLeadsQuery } from '@/features/lead/view-models/use-leads-query';
import { opportunityRepository, type Opportunity } from '../models/opportunity-model';

export function useOpportunityEditViewModel(record?: Opportunity) {
  const customers = useCustomersQuery().records;
  const leadQuery = useLeadsQuery();
  const initial: Opportunity = {
    id: '',
    name: '',
    customerId: '',
    leadId: '',
    amount: 0,
    expectedCloseDate: '',
    owner: '',
    stage: '需求確認',
    ...record,
  };
  const form = useEntityForm('opportunities', initial, (draft) => {
    if (!customers.some((item) => item.id === draft.customerId)) throw new Error('請選擇所屬客戶。');
    if (!Number.isFinite(draft.amount) || draft.amount < 0) throw new Error('金額必須為非負數。');
    opportunityRepository.save(draft);
  });
  return { ...form, customers, leads: leadQuery.records, leadQuery };
}
