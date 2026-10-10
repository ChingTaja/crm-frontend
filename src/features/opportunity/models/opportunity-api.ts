import { unwrapResponse, deleteRecords } from '../../../lib/api-operations';
import { opportunityOutcome } from './opportunity-model';
import { collectPages } from '../../../lib/api-pagination';
import type { Api, OpportunityResponse, CreateOpportunityRequest, CloseOpportunityRequest } from '../../../api/Api';

function opportunity(record: OpportunityResponse) {
  if (!record?.id) throw new Error('Opportunity API 回傳的 ID 不正確。');
  return record;
}
export function createOpportunityApi(client: Api<unknown>['api']) {
  const remove = async (signal: AbortSignal, id: string) => {
    await client.deleteOpportunities(encodeURIComponent(id), { signal });
  };
  const list = async (
    signal: AbortSignal,
    query: Parameters<Api<unknown>['api']['findAllOpportunities']>[0] = { page: 0, size: 20 }
  ) => {
    const data = await unwrapResponse(client.findAllOpportunities(query, { signal, format: 'json' }));
    if (
      !data ||
      !Array.isArray(data.content) ||
      !Number.isInteger(data.totalPages) ||
      !Number.isInteger(data.totalElements)
    ) {
      throw new Error('Opportunity 列表回傳格式不正確。');
    }
    return { ...data, content: data.content.map(opportunity) };
  };
  return {
    list,
    listAll: (signal: AbortSignal) => collectPages(signal, list),
    async get(signal: AbortSignal, id: string) {
      return opportunity(
        await unwrapResponse(client.findByIdOpportunity(encodeURIComponent(id), { signal, format: 'json' }))
      );
    },
    async save(signal: AbortSignal, fields: CreateOpportunityRequest, id?: string) {
      const params = { signal, format: 'json' as const };
      // Only editable fields are sent; stage and closure data belong to the backend.
      const payload: CreateOpportunityRequest = {
        name: fields.name,
        customerId: fields.customerId,
        leadId: fields.leadId?.trim() || undefined,
        amount: fields.amount,
        expectedCloseDate: fields.expectedCloseDate,
        owner: fields.owner,
      };
      return opportunity(
        await unwrapResponse(
          id
            ? client.updateOpportunities(encodeURIComponent(id), payload, params)
            : client.createOpportunities(payload, params)
        )
      );
    },
    async close(signal: AbortSignal, id: string, body: CloseOpportunityRequest) {
      const result = opportunity(
        await unwrapResponse(client.closeOpportunity(encodeURIComponent(id), body, { signal, format: 'json' }))
      );
      if (result.id !== id || opportunityOutcome(result.stage) !== body.outcome)
        throw new Error('商機結案回傳格式不正確，請重新載入確認。');
      return result;
    },
    remove,
    removeMany: (signal: AbortSignal, ids: string[]) => deleteRecords(signal, ids, remove),
  };
}
