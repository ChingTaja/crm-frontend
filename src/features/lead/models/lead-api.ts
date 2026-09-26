import { unwrapResponse, deleteRecords } from '../../../lib/api-operations';
import { collectPages } from '../../../lib/api-pagination';
import type { Api, Lead, CreateLeadResponse } from '../../../api/Api';
import { leadStatuses } from './lead-model';

const statusKeys = ['pending', 'contacting', 'qualified', 'unqualified'] as const;

function toLead(record: Lead | CreateLeadResponse): Lead {
  const rawStatus = record.status;
  const status =
    typeof rawStatus === 'object' && rawStatus
      ? leadStatuses[statusKeys.findIndex((key) => key === rawStatus.key)]
      : rawStatus;
  if (!record.id || !leadStatuses.some((value) => value === status)) {
    throw new Error('Lead API 回傳的 ID 或狀態不正確。');
  }
  return {
    ...record,
    status,
    name: record.name ?? '',
    company: record.company ?? '',
    email: record.email ?? '',
    phone: record.phone ?? '',
    source: record.source ?? '',
    owner: record.owner ?? '',
  };
}

export function createLeadApi(client: Api<unknown>['api']) {
  const remove = async (signal: AbortSignal, id: string) => {
    await client.deleteLeads(encodeURIComponent(id), { signal });
  };
  const list = async (signal: AbortSignal, query: Parameters<Api<unknown>['api']['findAllLeads']>[0] = { page: 0, size: 20 }) => {
    const data = await unwrapResponse(client.findAllLeads(query, { signal, format: 'json' }));
    if (!data || !Array.isArray(data.content) || !Number.isInteger(data.totalPages) || !Number.isInteger(data.totalElements)) {
      throw new Error('Lead 列表回傳格式不正確。');
    }
    return { ...data, content: data.content.map(toLead) };
  };
  return {
    list,
    listAll: (signal: AbortSignal) => collectPages(signal, list),
    async get(signal: AbortSignal, id: string) {
      return toLead(await unwrapResponse(client.findByIdLead(encodeURIComponent(id), { signal, format: 'json' })));
    },
    async save(signal: AbortSignal, lead: Lead) {
      const params = { signal, format: 'json' as const };
      if (lead.id) {
        return toLead(await unwrapResponse(client.updateLeads(encodeURIComponent(lead.id), lead, params)));
      }
      const { status, ...fields } = lead;
      delete fields.id;
      return toLead(
        await unwrapResponse(
          client.createLeads(
            {
              ...fields,
              status: { key: statusKeys[leadStatuses.findIndex((value) => value === status)], value: status },
            },
            params
          )
        )
      );
    },
    remove,
    removeMany: (signal: AbortSignal, ids: string[]) => deleteRecords(signal, ids, remove),
  };
}
