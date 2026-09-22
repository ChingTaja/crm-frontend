import { useSyncExternalStore } from 'react'
import { useEntityList } from '@/hooks/use-entity-list'
import type { FilterField } from '@/lib/filter-fields'
import { uniqueOptions } from '@/lib/filter-fields'
import { productRepository, productStatuses } from '../models/product-model'

export function useProductViewModel() {
  const products = useSyncExternalStore(productRepository.subscribe, productRepository.getSnapshot)
  const money = (n: number) => `NT$ ${n.toLocaleString('zh-TW')}`
  const fields: FilterField[] = [{ label: '名稱', type: 'text', hideable: false },
      { label: '產品編號', type: 'text' }, { label: '單價', type: 'number' },
      { label: '狀態', type: 'option', options: uniqueOptions([...productStatuses]) },
  ]
  const rows = products.map(item => ({ id: item.id, name: item.name, status: item.status, filterValues: [item.name, item.sku, String(item.price), item.status], cells: [item.sku, money(item.price), item.status] }))
  const list = useEntityList('products', '產品', fields, rows, productRepository.removeMany, true)
  return { ...list, records: products }
}
