import { useState, useSyncExternalStore } from 'react'
import { customerRepository } from '../../customers/models/customer-model'
import { productRepository, opportunityRepository } from '../../sales/models/sales-model'
import { useFieldOrder } from '@/hooks/use-field-order'
import type { FieldFilter } from '@/components/ui/filter-menu'
import { uniqueOptions, type FilterField } from '@/lib/filter-fields'
import { createFilterGroup, matchesAdvancedFilter, type FilterGroup } from '../../filters/models/advanced-filter'
import { quoteRepository } from '../models/quote-repository'
import { quoteActors, type QuoteActor } from '../models/quote-types'
import { money, quoteTotals } from '../models/quote-policy'

export function useQuoteViewModel() {
  const quotes = useSyncExternalStore(quoteRepository.subscribe, quoteRepository.getSnapshot)
  const customers = useSyncExternalStore(customerRepository.subscribe, customerRepository.getSnapshot)
  const products = useSyncExternalStore(productRepository.subscribe, productRepository.getSnapshot)
  const opportunities = useSyncExternalStore(opportunityRepository.subscribe, opportunityRepository.getSnapshot)
  const [actor, setActor] = useState<QuoteActor>(quoteActors[0])
  const [query, updateQuery] = useState('')
  const [filter, setFilter] = useState<FieldFilter | null>(null)
  const [advancedFilter, setAdvanced] = useState(createFilterGroup)
  const [hiddenFields, setHiddenFields] = useState<number[]>([])
  const order = useFieldOrder(7)
  const [page, updatePage] = useState(1)
  const [pageSize, updateSize] = useState(5)
  const [sort, setSort] = useState(false)
  const fields: FilterField[] = [
    { label: '報價單', type: 'text', hideable: false },
    { label: '客戶', type: 'lookup', options: customers.map(c => ({ value: c.id, label: c.name })) },
    { label: '版本', type: 'number' },
    { label: '狀態', type: 'option', options: uniqueOptions(['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired']) },
    { label: '審批', type: 'option', options: uniqueOptions(['NotRequired', 'Required', 'Pending', 'Approved', 'Rejected']) },
    { label: '有效期限', type: 'date' }, { label: '含稅總額', type: 'number' },
  ]
  const rows = quotes.map(quote => {
    const version = quote.versions[quote.versions.length - 1]!
    const amount = quoteTotals(version.lines).totalCents
    return { id: quote.id, cells: [`${quote.number} · ${version.name}`, customers.find(c => c.id === version.customerId)?.name ?? '—', `v${version.version}`, version.status, version.approval, version.validUntil, money(amount)], values: [`${quote.number} ${version.name}`, version.customerId, String(version.version), version.status, version.approval, version.validUntil, String(amount / 100)] }
  })
  const filtered = rows.filter(row => row.cells.join(' ').toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()) && (!filter || matchesAdvancedFilter(row.values, { ...filter, id: 'single', kind: 'rule' })) && matchesAdvancedFilter(row.values, advancedFilter))
  if (sort) filtered.sort((a, b) => a.cells[0].localeCompare(b.cells[0], 'zh-Hant'))
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  return { quotes, customers, products, opportunities, actor, setActor, fields, ...order, hiddenFields,
    toggleVisibility: (field: number) => { if (field !== 0) setHiddenFields(current => current.includes(field) ? current.filter(i => i !== field) : [...current, field]) },
    query, setQuery: (value: string) => { updateQuery(value); updatePage(1) },
    filter, setFilter: (value: FieldFilter | null) => { setFilter(value); updatePage(1) },
    advancedFilter, setAdvanced: (value: FilterGroup) => { setAdvanced(value); updatePage(1) },
    sort, toggleSort: () => { setSort(value => !value); updatePage(1) },
    total: quotes.length, filteredTotal: filtered.length, page: currentPage, pageCount, pageSize,
    setPage: updatePage, setPageSize: (value: number) => { updateSize(value); updatePage(1) },
    rows: filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
  }
}
export type QuoteViewModel = ReturnType<typeof useQuoteViewModel>
