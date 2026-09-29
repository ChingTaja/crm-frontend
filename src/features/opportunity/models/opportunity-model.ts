import type { OpportunityResponse } from '../../../api/Api';
import { createRepository } from '../../../lib/in-memory-repository';

export const opportunityStages = ['需求確認', '提案報價', '協商中', '已成交', '已失單'] as const;
export const opportunityRepository = createRepository<OpportunityResponse>([]);
export function cacheOpportunity(record: OpportunityResponse) {
  const records = opportunityRepository.getSnapshot();
  opportunityRepository.replaceAll(
    records.some((item) => item.id === record.id)
      ? records.map((item) => (item.id === record.id ? record : item))
      : [record, ...records]
  );
}
