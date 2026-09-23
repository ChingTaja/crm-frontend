import type { ApiRequestOptions } from '../../../lib/api-client'
import { leadStatuses, type Lead } from './lead-model'

type Request = <T>(path: string, options?: ApiRequestOptions) => Promise<T>
const statusKeys = ['pending', 'contacting', 'qualified', 'unqualified'] as const

function toLead(value: unknown): Lead {
  if (!value || typeof value !== 'object') throw new Error('Lead API 回傳格式不正確。')
  const record = value as Record<string, unknown>
  const status = typeof record.status === 'object' && record.status
    ? leadStatuses[statusKeys.indexOf((record.status as { key: typeof statusKeys[number] }).key)]
    : record.status
  if (typeof record.id !== 'string' || !record.id || !leadStatuses.includes(status as Lead['status'])) {
    throw new Error('Lead API 回傳的 ID 或狀態不正確。')
  }
  const text = (key: string) => typeof record[key] === 'string' ? record[key] as string : ''
  return {
    id: record.id, name: text('name'), company: text('company'), email: text('email'),
    phone: text('phone'), source: text('source'), owner: text('owner'), status: status as Lead['status'],
    ...(record.qualification ? { qualification: record.qualification as Lead['qualification'] } : {}),
  }
}

function fields(lead: Lead) {
  return { name: lead.name, company: lead.company, email: lead.email, phone: lead.phone, source: lead.source, owner: lead.owner }
}

export function createLeadApi(request: Request) {
  const path = (id: string) => `leads/${encodeURIComponent(id)}`
  const remove = (signal: AbortSignal, id: string) => request<void>(path(id), { method: 'DELETE', signal })
  return {
    async list(signal: AbortSignal) {
      const data = await request<unknown>('leads', { signal })
      if (!Array.isArray(data)) throw new Error('Lead 列表回傳格式不正確。')
      return data.map(toLead)
    },
    async get(signal: AbortSignal, id: string) {
      return toLead(await request(path(id), { signal }))
    },
    async save(signal: AbortSignal, lead: Lead) {
      const body = lead.id
        ? { ...fields(lead), id: lead.id, status: lead.status, qualification: lead.qualification }
        : { ...fields(lead), status: { key: statusKeys[leadStatuses.indexOf(lead.status)], value: lead.status } }
      return toLead(await request(lead.id ? path(lead.id) : 'leads', {
        method: lead.id ? 'PUT' : 'POST', signal, body,
      }))
    },
    remove,
    async removeMany(signal: AbortSignal, ids: string[]) {
      const deleted: string[] = []
      const failed: { id: string; message: string }[] = []
      // Sequential deletion bounds load and reports partial success accurately.
      for (const id of new Set(ids)) {
        signal.throwIfAborted()
        try {
          await remove(signal, id)
          deleted.push(id)
        } catch (error) {
          signal.throwIfAborted()
          failed.push({ id, message: error instanceof Error ? error.message : '刪除失敗。' })
        }
      }
      return { deleted, failed }
    },
  }
}
