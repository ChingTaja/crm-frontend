import { createRepository } from '../../../lib/in-memory-repository';
import type { QuoteLine, QuoteTotals } from '../../quote/models/quote-types';
export const orderStatuses = ['已確認', '處理中', '已完成', '已取消'] as const;
export interface Order {
  id: string;
  name: string;
  customerId: string;
  opportunityId: string;
  items: { productId: string; quantity: number; unitPrice: number }[];
  status: (typeof orderStatuses)[number];
  quoteSource?: {
    quoteId: string;
    number: string;
    version: number;
    lines: QuoteLine[];
    totals: QuoteTotals;
    paymentTerms: string;
    deliveryTerms: string;
    warranty: string;
    notes: string;
  };
}
export const orderTransitions: Record<Order['status'], readonly Order['status'][]> = {
  已確認: ['處理中', '已取消'],
  處理中: ['已完成', '已取消'],
  已完成: [],
  已取消: [],
};
export const orderRepository = createRepository<Order>(
  Array.from({ length: 15 }, (_, i) => ({
    id: `order-${i + 1}`,
    name: `訂單 ${String(i + 1).padStart(3, '0')}`,
    customerId: `c${i + 1}`,
    opportunityId: `opportunity-${i + 1}`,
    items: [{ productId: `product-${i + 1}`, quantity: 1, unitPrice: (i + 1) * 1000 }],
    status: '已確認',
  })),
  (record, existing) => {
    if (!existing) {
      if (!record.quoteSource || record.status !== '已確認') throw new Error('訂單必須由報價單轉入，初始狀態為已確認。');
      return;
    }
    const { status: previousStatus, ...previous } = existing;
    const { status, ...next } = record;
    if (JSON.stringify(previous) !== JSON.stringify(next)) throw new Error('訂單快照不可修改，僅可更新狀態。');
    if (status !== previousStatus && !orderTransitions[previousStatus].includes(status)) {
      throw new Error('不允許此訂單狀態變更，請重新確認目前狀態。');
    }
  }
);
