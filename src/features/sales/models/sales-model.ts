import type { QuoteLine, QuoteTotals } from '../../quotes/models/quote-types'
export const leadStatuses = ['待聯繫', '聯繫中', '已合格', '不合格'] as const
export const opportunityStages = ['需求確認', '提案報價', '協商中', '已成交', '已失單'] as const
export type SalesEntity = 'leads' | 'opportunities' | 'orders' | 'products'
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
export interface Opportunity {
  id: string
  name: string
  customerId: string
  leadId: string
  amount: number
  expectedCloseDate: string
  owner: string
  stage: typeof opportunityStages[number]
}

function createRepository<T extends { id: string }>(initial: T[]) {
  let records = initial
  const listeners = new Set<() => void>()
  return {
    getSnapshot: () => records,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener) } },
    save(record: T) {
      const existing = records.find(item => item.id === record.id)
      if (existing && 'quoteSource' in existing && existing.quoteSource) throw new Error('報價轉入的訂單保留原始價格快照，不可直接覆寫。')
      const saved = { ...record, id: record.id || crypto.randomUUID() }
      records = record.id ? records.map(item => item.id === record.id ? saved : item) : [saved, ...records]
      listeners.forEach(listener => listener())
      return saved
    },
  }
}

export const leadRepository = createRepository<Lead>(Array.from({ length: 15 }, (_, index) => ({
  id: `lead-${index + 1}`, name: `潛在客戶 ${index + 1}`, company: `示範企業 ${index + 1}`,
  email: `lead${index + 1}@example.com`, phone: '', source: ['網站詢問', '展覽活動', '客戶推薦'][index % 3],
  owner: ['林雅婷', '陳柏宇', '王怡安'][index % 3], status: leadStatuses[index % leadStatuses.length],
})))
export const opportunityRepository = createRepository<Opportunity>(Array.from({ length: 15 }, (_, index) => ({
  id: `opportunity-${index + 1}`, name: `年度合作方案 ${index + 1}`, customerId: `c${index + 1}`, leadId: `lead-${index + 1}`,
  amount: (index + 1) * 10000, expectedCloseDate: '2026-12-31', owner: ['林雅婷', '陳柏宇', '王怡安'][index % 3],
  stage: opportunityStages[index % opportunityStages.length],
})))

export const orderStatuses = ['草稿', '已確認', '已完成', '已取消'] as const
export const productStatuses = ['啟用', '停用'] as const
export interface Product {
  id: string
  name: string
  sku: string
  price: number
  status: typeof productStatuses[number]
}
export interface Order {
  id: string
  name: string
  customerId: string
  opportunityId: string
  items: { productId: string; quantity: number; unitPrice: number }[]
  status: typeof orderStatuses[number]
  quoteSource?: {
    quoteId: string; number: string; version: number; lines: QuoteLine[]; totals: QuoteTotals
    paymentTerms: string; deliveryTerms: string; warranty: string; notes: string
  }
}
export const productRepository = createRepository<Product>(Array.from({ length: 15 }, (_, i) => ({ id: `product-${i + 1}`, name: `服務方案 ${i + 1}`, sku: `SKU-${String(i + 1).padStart(3, '0')}`, price: (i + 1) * 1000, status: '啟用' })))
export const orderRepository = createRepository<Order>(Array.from({ length: 15 }, (_, i) => ({ id: `order-${i + 1}`, name: `訂單 ${String(i + 1).padStart(3, '0')}`, customerId: `c${i + 1}`, opportunityId: `opportunity-${i + 1}`, items: [{ productId: `product-${i + 1}`, quantity: 1, unitPrice: (i + 1) * 1000 }], status: '草稿' })))
