import { createRepository } from '../../../lib/in-memory-repository'
export const leadStatuses = ['待聯繫', '聯繫中', '已合格', '不合格'] as const
export interface Lead {
  id: string
  name: string
  company: string
  email: string
  phone: string
  source: string
  owner: string
  status: typeof leadStatuses[number]
  qualification?: {
    decision: 'approved' | 'rejected'
    reviewedAt: string
    reason?: string
    note?: string
    customerId?: string
    contactId?: string
    opportunityId?: string
  }
}
export const leadRepository = createRepository<Lead>(Array.from({ length: 15 }, (_, index) => ({
  id: `lead-${index + 1}`, name: `潛在客戶 ${index + 1}`, company: `示範企業 ${index + 1}`,
  email: `lead${index + 1}@example.com`, phone: '', source: ['網站詢問', '展覽活動', '客戶推薦'][index % 3],
  owner: ['林雅婷', '陳柏宇', '王怡安'][index % 3], status: leadStatuses[index % leadStatuses.length],
})))
