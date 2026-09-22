import { useState } from 'react'
import { useRecordSelection } from './use-record-selection'
import { useFieldOrder } from './use-field-order'
import type { FilterField } from '@/lib/filter-fields'
import type { FieldFilter } from '@/components/ui/filter-menu'
import { createFilterGroup, matchesAdvancedFilter, type FilterGroup } from '@/features/filter/models/advanced-filter'

export interface EntityListRow { id: string; name: string; filterValues: string[]; cells: string[] }
export function useEntityList(entity: string, title: string, fields: FilterField[], records: EntityListRow[], removeMany: (ids: string[]) => void, numericSort = false) {
  const fieldOrder = useFieldOrder(fields.length)
  const [hiddenFields, setHiddenFields] = useState<number[]>([])
  const [advancedFilter, setAdvancedFilter] = useState(createFilterGroup)
  const [filter, setFilter] = useState<FieldFilter | null>(null)
  const [query, updateQuery] = useState('')
  const [sortAscending, setSortAscending] = useState(false)
  const [requestedPage, updatePage] = useState(1)
  const [pageSize, updateSize] = useState(5)
  const pageSizeOptions = [5, 10, 15, 20]
  const filtered = records.filter(row => matchesAdvancedFilter(row.filterValues, advancedFilter)
    && (!filter || matchesAdvancedFilter(row.filterValues, { ...filter, kind: 'rule', id: 'simple' }))
    && [row.name, ...row.cells].join(' ').toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))
  if (sortAscending) filtered.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant', { numeric: numericSort }))
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const page = Math.min(requestedPage, pageCount)
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize)
  const selection = useRecordSelection(records, rows, removeMany)
  return {
    entity, title, fields, ...fieldOrder, columns: fields.slice(1).map(field => field.label),
    rows, total: records.length, filteredTotal: filtered.length,
    advancedFilter, applyAdvancedFilter: (value: FilterGroup) => { selection.clearSelection(); setAdvancedFilter(value); updatePage(1) },
    filter, applyFilter: (value: FieldFilter | null) => { selection.clearSelection(); setFilter(value); updatePage(1) },
    clearFilter: () => { selection.clearSelection(); setFilter(null); updatePage(1) },
    hiddenFields, toggleFieldVisibility: (field: number) => {
      if (fields[field]?.hideable === false) return
      setHiddenFields(current => current.includes(field) ? current.filter(item => item !== field) : [...current, field])
    },
    query, setQuery: (value: string) => { selection.clearSelection(); updateQuery(value); updatePage(1) },
    sortAscending, toggleSort: () => { setSortAscending(value => !value); updatePage(1) },
    page, pageCount, pageSize, pageSizeOptions,
    setPage: (value: number) => updatePage(Math.max(1, Math.min(value, pageCount))),
    setPageSize: (value: number) => { if (pageSizeOptions.includes(value)) { updateSize(value); updatePage(1) } },
    ...selection,
    openDetails: (id: string) => { window.location.hash = `/${entity}/${id}/edit` },
    startCreate: () => { setAdvancedFilter(createFilterGroup()); updateQuery(''); selection.clearSelection(); setFilter(null); setSortAscending(false); updatePage(1); window.location.hash = `/${entity}/new` },
  }
}
export type EntityListViewModel = ReturnType<typeof useEntityList>
