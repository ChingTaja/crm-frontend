import { useCustomersQuery } from '@/features/customer/view-models/use-customers-query';
import { useSyncExternalStore } from 'react'
import { useEntityForm } from '@/hooks/use-entity-form'
import { opportunityRepository } from '@/features/opportunity/models/opportunity-model'
import { productRepository } from '@/features/product/models/product-model'
import { orderRepository, type Order } from '../models/order-model'

export function useOrderEditViewModel(record?: Order) {
  const customers = useCustomersQuery().records
  const products = useSyncExternalStore(productRepository.subscribe, productRepository.getSnapshot)
  const opportunities = useSyncExternalStore(opportunityRepository.subscribe, opportunityRepository.getSnapshot)
  const initial: Order = { id: '', name: '', customerId: '', opportunityId: '', items: [], status: '草稿', ...record }
  const form = useEntityForm('orders', initial, draft => {
    if (!customers.some(item => item.id === draft.customerId)) throw new Error('請選擇所屬客戶。')
    if (!draft.items.length || draft.items.some(line => !products.some(p => p.id === line.productId) || !Number.isInteger(line.quantity) || line.quantity < 1 || !Number.isFinite(line.unitPrice) || line.unitPrice < 0)) throw new Error('請加入產品，數量須為正整數，單價須為非負數。')
    if (draft.opportunityId && !opportunities.some(item => item.id === draft.opportunityId && item.customerId === draft.customerId)) throw new Error('來源商機必須屬於所選客戶。')
    orderRepository.save({ ...draft, items: draft.items.map(line => ({ ...line })) })
  })
  return { ...form, customers, products, opportunities,
    update: <K extends keyof Order>(field: K, value: Order[K]) => {
      form.update(field, value)
      if (field === 'customerId') form.update('opportunityId', '')
    },
  }
}
