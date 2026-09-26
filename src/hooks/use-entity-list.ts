import { useState } from 'react'
import { useRecordSelection } from './use-record-selection'
import { useFieldOrder } from './use-field-order'
import type { FilterField } from '@/lib/filter-fields'
import type { FieldFilter } from '@/components/ui/filter-menu'
import { createFilterGroup, matchesAdvancedFilter, type FilterGroup } from '@/features/filter/models/advanced-filter'

export interface EntityListRow { id: string; name: string; filterValues: string[]; cells: string[]; displayValues?: string[] }
interface ServerPagination {
  page: number; pageSize: number; total: number; pageCount: number;
  setPage: (page: number) => void; setPageSize: (size: number) => void;
}
export function useEntityList(entity: string, title: string, fields: FilterField[], records: EntityListRow[], removeMany: (ids: string[]) => void | Promise<void>, numericSort = false, pagination?: ServerPagination) {
  const fieldOrder = useFieldOrder(fields.length)
  const [hiddenFields, setHiddenFields] = useState<number[]>([])
  const [advancedFilter, setAdvancedFilter] = useState(createFilterGroup)
  const [filter, setFilter] = useState<FieldFilter | null>(null)
  const [query, updateQuery] = useState('')
  const [sortAscending, setSortAscending] = useState(false)
  const [requestedPage, updateLocalPage] = useState(1)
  const updatePage = pagination?.setPage ?? updateLocalPage
  const [localPageSize, updateLocalSize] = useState(5)
  const pageSize = pagination?.pageSize ?? localPageSize
  const updateSize = pagination?.setPageSize ?? updateLocalSize
  const resetPage = () => { if (!pagination) updatePage(1) }
  const pageSizeOptions = [5, 10, 15, 20]
  const filtered = records.filter(row => matchesAdvancedFilter(row.filterValues, advancedFilter)
    && (!filter || matchesAdvancedFilter(row.filterValues, { ...filter, kind: 'rule', id: 'simple' }))
    && [row.name, ...row.cells].join(' ').toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))
  if (sortAscending) filtered.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant', { numeric: numericSort }))
  const pageCount = pagination?.pageCount ?? Math.max(1, Math.ceil(filtered.length / pageSize))
  const page = pagination?.page ?? Math.min(requestedPage, pageCount)
  const rows = pagination ? filtered : filtered.slice((page - 1) * pageSize, page * pageSize)
  const selection = useRecordSelection(records, rows, removeMany)
  return {
    entity, title, fields, ...fieldOrder, columns: fields.slice(1).map(field => field.label),
    rows, total: pagination?.total ?? records.length, filteredTotal: pagination?.total ?? filtered.length, serverPaginated: !!pagination,
    advancedFilter, applyAdvancedFilter: (value: FilterGroup) => { selection.clearSelection(); setAdvancedFilter(value); resetPage() },
    filter, applyFilter: (value: FieldFilter | null) => { selection.clearSelection(); setFilter(value); resetPage() },
    clearFilter: () => { selection.clearSelection(); setFilter(null); resetPage() },
    hiddenFields, toggleFieldVisibility: (field: number) => {
      if (fields[field]?.hideable === false) return
      setHiddenFields(current => current.includes(field) ? current.filter(item => item !== field) : [...current, field])
    },
    query, setQuery: (value: string) => { selection.clearSelection(); updateQuery(value); resetPage() },
    sortAscending, toggleSort: () => { setSortAscending(value => !value); resetPage() },
    page, pageCount, pageSize, pageSizeOptions,
    setPage: (value: number) => { selection.clearSelection(); updatePage(Math.max(1, Math.min(value, pageCount))) },
    setPageSize: (value: number) => { if (pageSizeOptions.includes(value)) { selection.clearSelection(); updateSize(value); updatePage(1) } },
    ...selection,
    openDetails: (id: string) => { window.location.hash = `/${entity}/${id}/edit` },
    startCreate: () => { setAdvancedFilter(createFilterGroup()); updateQuery(''); selection.clearSelection(); setFilter(null); setSortAscending(false); resetPage(); window.location.hash = `/${entity}/new` },
  }
}
export type EntityListViewModel = ReturnType<typeof useEntityList>
