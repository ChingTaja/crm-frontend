import type { OpportunityResponse } from '../../../api/Api';
import { createRepository } from '../../../lib/in-memory-repository';

export function opportunityStageLabel(stage?: string) {
  if (!stage) return '狀態不明';
  if (['需求確認', '提案報價', '協商中'].includes(stage)) return '需求討論中';
  if (stage === '已成交') return '需求成交';
  if (stage === '已失單') return '失單';
  return stage;
}
export function opportunityOutcome(stage?: string): 'won' | 'lost' | undefined {
  if (stage === '需求成交' || stage === '已成交') return 'won';
  if (stage === '失單' || stage === '已失單') return 'lost';
}

export function canCreateOpportunityQuote(record?: OpportunityResponse) {
  return !!record?.id && !record.closedAt && ['需求討論中', '需求確認', '提案報價', '協商中'].includes(record.stage ?? '');
}

export const opportunityRepository = createRepository<OpportunityResponse>([]);
export function cacheOpportunity(record: OpportunityResponse) {
  const records = opportunityRepository.getSnapshot();
  opportunityRepository.replaceAll(
    records.some((item) => item.id === record.id)
      ? records.map((item) => (item.id === record.id ? record : item))
      : [record, ...records]
  );
}
