import type { Lead } from '../../../api/Api';
import { createRepository } from '../../../lib/in-memory-repository';
export const leadStatuses = ['待聯繫', '聯繫中', '已合格', '不合格'] as const;
// Cache only records confirmed by the API; never fall back to demo leads.
export const leadRepository = createRepository<Lead>([]);

export function cacheLead(lead: Lead) {
  const records = leadRepository.getSnapshot();
  leadRepository.replaceAll(
    records.some((item) => item.id === lead.id)
      ? records.map((item) => (item.id === lead.id ? lead : item))
      : [lead, ...records]
  );
}
