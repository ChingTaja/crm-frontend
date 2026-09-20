import { uniqueOptions, type FilterField } from '@/lib/filter-fields'
import { useFieldOrder } from '@/hooks/use-field-order'
import type { FieldFilter } from '@/components/ui/filter-menu'
import { createFilterGroup, matchesAdvancedFilter, type FilterGroup } from '@/features/filters/models/advanced-filter'
import { useState, useSyncExternalStore } from 'react'
import { customerRepository } from '@/features/customers/models/customer-model'
import { leadRepository, opportunityRepository, productRepository, orderRepository, leadStatuses, opportunityStages, productStatuses, orderStatuses, type SalesEntity } from '../models/sales-model'

export const salesLabels = { leads: '潛在客戶', opportunities: '商機', orders: '訂單', products: '產品' }
export function useSalesViewModel(entity: SalesEntity) {
  const fieldOrder = useFieldOrder(entity === 'products' ? 4 : entity === 'orders' ? 5 : 6)
  const leads = useSyncExternalStore(leadRepository.subscribe, leadRepository.getSnapshot)
  const opportunities = useSyncExternalStore(opportunityRepository.subscribe, opportunityRepository.getSnapshot)
  const products = useSyncExternalStore(productRepository.subscribe, productRepository.getSnapshot)
  const orders = useSyncExternalStore(orderRepository.subscribe, orderRepository.getSnapshot)
  const customers = useSyncExternalStore(customerRepository.subscribe, customerRepository.getSnapshot)
  const [advancedFilter, setAdvancedFilter] = useState(createFilterGroup)
  const [filter, setFilter] = useState<FieldFilter | null>(null)
  const [hiddenFields, setHiddenFields] = useState<number[]>([])
  const [query, setQueryState] = useState('')
  const [sort, setSort] = useState(false)
  const [requestedPage, setPage] = useState(1)
  const [pageSize, setSize] = useState(5)
  const money = (n: number) => `NT$ ${n.toLocaleString('zh-TW')}`
  const customerName = (id: string) => customers.find(item => item.id === id)?.name ?? '—'
  const customerOptions = customers.map(item => ({ value: item.id, label: item.name }))
  const ownerOptions = uniqueOptions([...leads, ...opportunities].map(item => item.owner))
  const fieldDefinitions: Record<SalesEntity, FilterField[]> = {
    leads: [
      { label: '公司', type: 'text' }, { label: '電子郵件', type: 'email' },
      { label: '來源', type: 'option', options: uniqueOptions(leads.map(item => item.source)) },
      { label: '負責人', type: 'lookup', options: ownerOptions },
      { label: '狀態', type: 'option', options: uniqueOptions([...leadStatuses]) },
    ],
    opportunities: [
      { label: '所屬客戶', type: 'lookup', options: customerOptions }, { label: '預估金額', type: 'number' },
      { label: '預計成交日', type: 'date' }, { label: '負責人', type: 'lookup', options: ownerOptions },
      { label: '階段', type: 'option', options: uniqueOptions([...opportunityStages]) },
    ],
    products: [
      { label: '產品編號', type: 'text' }, { label: '單價', type: 'number' },
      { label: '狀態', type: 'option', options: uniqueOptions([...productStatuses]) },
    ],
    orders: [
      { label: '所屬客戶', type: 'lookup', options: customerOptions }, { label: '品項數', type: 'number' },
      { label: '總金額', type: 'number' }, { label: '狀態', type: 'option', options: uniqueOptions([...orderStatuses]) },
    ],
  }
  const fields: FilterField[] = [{ label: '名稱', type: 'text', hideable: false }, ...fieldDefinitions[entity]]
  const definitions = {
    leads: { columns: ['公司', '電子郵件', '來源', '負責人', '狀態'], statuses: leadStatuses, rows: leads.map(item => ({ id: item.id, name: item.name, status: item.status, filterValues: [item.name, item.company, item.email, item.source, item.owner, item.status], cells: [item.company, item.email, item.source, item.owner, item.status] })) },
    opportunities: { columns: ['所屬客戶', '預估金額', '預計成交日', '負責人', '階段'], statuses: opportunityStages, rows: opportunities.map(item => ({ id: item.id, name: item.name, status: item.stage, filterValues: [item.name, item.customerId, String(item.amount), item.expectedCloseDate, item.owner, item.stage], cells: [customerName(item.customerId), money(item.amount), item.expectedCloseDate || '—', item.owner, item.stage] })) },
    products: { columns: ['產品編號', '單價', '狀態'], statuses: productStatuses, rows: products.map(item => ({ id: item.id, name: item.name, status: item.status, filterValues: [item.name, item.sku, String(item.price), item.status], cells: [item.sku, money(item.price), item.status] })) },
    orders: { columns: ['所屬客戶', '品項數', '總金額', '狀態'], statuses: orderStatuses, rows: orders.map(item => ({ id: item.id, name: item.name, status: item.status, filterValues: [item.name, item.customerId, String(item.items.length), String(item.items.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0)), item.status], cells: [customerName(item.customerId), String(item.items.length), money(item.items.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0)), item.status] })) },
  }
  const { rows, columns, statuses } = definitions[entity]
  const filtered = rows.filter(row => matchesAdvancedFilter(row.filterValues, advancedFilter) && (!filter || matchesAdvancedFilter(row.filterValues, { ...filter, kind: 'rule', id: 'simple' })) && [row.name, ...row.cells].join(' ').toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))
  if (sort) filtered.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant', { numeric: true }))
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const page = Math.min(requestedPage, pageCount)
  return {
    fields,
    ...fieldOrder,
    advancedFilter, applyAdvancedFilter: (value: FilterGroup) => { setAdvancedFilter(value); setPage(1) },
    entity, leads, opportunities, products, orders, customers, columns, statuses, title: salesLabels[entity], total: rows.length, filteredTotal: filtered.length,
    rows: filtered.slice((page - 1) * pageSize, page * pageSize),
    filter, hiddenFields,
    applyFilter: (value: FieldFilter | null) => { setFilter(value); setPage(1) },
    clearFilter: () => { setFilter(null); setPage(1) },
    toggleFieldVisibility: (field: number) => setHiddenFields(current => field === 0 ? current : current.includes(field) ? current.filter(item => item !== field) : [...current, field]),
    query, sort, page, pageSize, pageCount,
    setQuery: (value: string) => { setQueryState(value); setPage(1) },
    toggleSort: () => { setSort(value => !value); setPage(1) },
    setPage, setPageSize: (value: number) => { setSize(value); setPage(1) },
    create: () => { setAdvancedFilter(createFilterGroup()); setQueryState(''); setFilter(null); setSort(false); setPage(1); window.location.hash = `/${entity}/new` },
  }
}
export type SalesViewModel = ReturnType<typeof useSalesViewModel>
