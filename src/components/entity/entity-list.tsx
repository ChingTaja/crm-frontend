import { AppLink } from '@/components/ui/app-link';
import { filterValueLabel } from '@/lib/filter-fields'
import { FilterMenu } from '@/components/ui/filter-menu'
import { AdvancedFilter } from '@/features/filter/components/advanced-filter'
import { filterOperators, requiresFilterValue } from '@/features/filter/models/advanced-filter'
import { Pagination } from '@/components/ui/pagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EntityPageHeader, EntityPageTitle } from '@/components/layout/entity-page-header'
import { EntityTable, EntityTableHead, EntityTableCell, EntityTableRow, RowCheckbox } from '@/components/ui/entity-table'
import type { EntityListViewModel } from '@/hooks/use-entity-list'
import { Plus, ArrowDownAZ } from 'lucide-react'
import { DeleteRecordsButton } from './delete-records-button'

export function EntityList({ vm, dataNotice = '示範資料 · 尚未連接後端' }: { vm: EntityListViewModel; dataNotice?: string | null }) {
  const { entity } = vm
  const visibleFields = vm.fieldOrder.filter(field => !vm.hiddenFields.includes(field))
  return <>
    <EntityPageHeader>
      <EntityPageTitle>全部{vm.title}<span className="text-sm text-muted-foreground">· {vm.filteredTotal}</span></EntityPageTitle>
      <div className="ml-auto flex items-center gap-2">
        <DeleteRecordsButton title={vm.title} records={vm.selectedRecords} onDelete={vm.deleteSelected} />
        <Button onClick={vm.startCreate}><Plus />新增{vm.title}</Button>
      </div>
    </EntityPageHeader>
    <div className="flex flex-wrap items-center gap-2 border-b py-3">
      <Input className="w-52" aria-label="搜尋資料" placeholder={`搜尋${vm.serverPaginated ? '本頁' : ''}${vm.title}…`} value={vm.query} onChange={e => vm.setQuery(e.target.value)} />
      <FilterMenu fields={vm.fields} value={vm.filter} onChange={vm.applyFilter} hiddenFields={vm.hiddenFields} onToggleVisibility={vm.toggleFieldVisibility} fieldOrder={vm.fieldOrder} onMoveField={vm.moveField} />
      <AdvancedFilter fields={vm.fields} value={vm.advancedFilter} onChange={vm.applyAdvancedFilter} />
      <Button variant="ghost" aria-pressed={vm.sortAscending} onClick={vm.toggleSort}><ArrowDownAZ />{vm.sortAscending ? '名稱排序' : '排序'}</Button>
    </div>
    {vm.serverPaginated && <p className="py-2 text-xs text-muted-foreground">搜尋、篩選與排序僅套用於本頁資料。</p>}
    {vm.filter && <div className="flex items-center gap-2 py-3 text-xs text-muted-foreground">
      <span>{vm.fields[vm.filter.field].label} {filterOperators[vm.filter.operator]}{requiresFilterValue(vm.filter.operator) && `「${filterValueLabel(vm.fields[vm.filter.field], vm.filter.value)}」`}</span>
      <Button size="sm" variant="ghost" onClick={vm.clearFilter}>清除篩選</Button>
    </div>}
    <EntityTable>
      <caption className="sr-only">{vm.title}列表</caption>
      <thead><tr>
        <EntityTableHead selection><RowCheckbox aria-label="選取全部顯示項目" checked={vm.allSelected} indeterminate={vm.partiallySelected} disabled={!vm.rows.length} onChange={vm.toggleAll} /></EntityTableHead>
        {visibleFields.map(field => <EntityTableHead key={field}>{vm.fields[field].label}</EntityTableHead>)}
      </tr></thead>
      <tbody>
        {vm.rows.map(row => <EntityTableRow key={row.id} data-selected={vm.selectedIds.includes(row.id)} className="cursor-pointer" onClick={event => { if (!(event.target as Element).closest('a')) vm.openDetails(row.id) }}>
          <EntityTableCell selection onClick={event => event.stopPropagation()}>
            <RowCheckbox aria-label={`選取 ${row.name}`} checked={vm.selectedIds.includes(row.id)} onChange={() => vm.toggleSelection(row.id)} />
          </EntityTableCell>
          {visibleFields.map(field => {
            const value = row.displayValues ? row.displayValues[field] : field === 0 ? row.name : row.cells[field - 1];
            const isName = vm.fields[field].apiFieldName ? vm.fields[field].apiFieldName === 'name' : field === 0;
            return <EntityTableCell key={field}>{isName ? <AppLink className="font-medium hover:underline" href={`/${entity}/${row.id}/edit`}>{value || '—'}</AppLink> : value || '—'}</EntityTableCell>;
          })}
        </EntityTableRow>)}
        {!vm.rows.length && <tr><EntityTableCell colSpan={visibleFields.length + 1} className="py-10 text-center text-muted-foreground">沒有符合條件的資料</EntityTableCell></tr>}
      </tbody>
    </EntityTable>
    <footer className="grid items-center gap-3 py-5 text-xs text-muted-foreground xl:grid-cols-[1fr_auto_1fr]">
      <label>共 {vm.total} 筆 · 顯示 <select aria-label="每頁顯示筆數" className="rounded border px-2 py-1" value={vm.pageSize} onChange={e => vm.setPageSize(Number(e.target.value))}>{vm.pageSizeOptions.map(size => <option key={size}>{size}</option>)}</select> 筆{vm.selectedIds.length > 0 && ` · 已選取 ${vm.selectedIds.length} 筆`}</label>
      <Pagination page={vm.page} pageCount={vm.pageCount} onPageChange={vm.setPage} />
      <span className="xl:text-right">{dataNotice}</span>
    </footer>
  </>
}
