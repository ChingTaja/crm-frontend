import { createRepository } from '../../../lib/in-memory-repository'
import type { QuoteLine, QuoteTotals } from '../../quote/models/quote-types'
export const orderStatuses = ['草稿', '已確認', '已完成', '已取消'] as const
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
export const orderRepository = createRepository<Order>(Array.from({ length: 15 }, (_, i) => ({ id: `order-${i + 1}`, name: `訂單 ${String(i + 1).padStart(3, '0')}`, customerId: `c${i + 1}`, opportunityId: `opportunity-${i + 1}`, items: [{ productId: `product-${i + 1}`, quantity: 1, unitPrice: (i + 1) * 1000 }], status: '草稿' })), (_record, existing) => {
  if (existing?.quoteSource) throw new Error('報價轉入的訂單保留原始價格快照，不可直接覆寫。')
})
