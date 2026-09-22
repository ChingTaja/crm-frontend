import { useSyncExternalStore } from 'react'
import { useEntityList } from '@/hooks/use-entity-list'
import type { FilterField } from '@/lib/filter-fields'
import { uniqueOptions } from '@/lib/filter-fields'
import { orderRepository, orderStatuses } from '../models/order-model'
import { customerRepository } from '@/features/customer/models/customer-model'

export function useOrderViewModel() {
  const orders = useSyncExternalStore(orderRepository.subscribe, orderRepository.getSnapshot)
  const customers = useSyncExternalStore(customerRepository.subscribe, customerRepository.getSnapshot)
  const customerName = (id: string) => customers.find(item => item.id === id)?.name ?? '—'
  const customerOptions = customers.map(item => ({ value: item.id, label: item.name }))
  const money = (n: number) => `NT$ ${n.toLocaleString('zh-TW')}`
  const fields: FilterField[] = [{ label: '名稱', type: 'text', hideable: false },
      { label: '所屬客戶', type: 'lookup', options: customerOptions }, { label: '品項數', type: 'number' },
      { label: '總金額', type: 'number' }, { label: '狀態', type: 'option', options: uniqueOptions([...orderStatuses]) },
  ]
  const rows = orders.map(item => ({ id: item.id, name: item.name, status: item.status, filterValues: [item.name, item.customerId, String(item.items.length), String((item.quoteSource ? item.quoteSource.totals.totalCents / 100 : item.items.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0))), item.status], cells: [customerName(item.customerId), String(item.items.length), money((item.quoteSource ? item.quoteSource.totals.totalCents / 100 : item.items.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0))), item.status] }))
  const list = useEntityList('orders', '訂單', fields, rows, orderRepository.removeMany, true)
  return { ...list, records: orders }
}
