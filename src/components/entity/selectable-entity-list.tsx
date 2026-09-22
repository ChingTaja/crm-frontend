import { DeleteRecordsButton } from './delete-records-button'
import { filterValueLabel } from '@/lib/filter-fields'
import { FilterMenu } from '@/components/ui/filter-menu'
import { AdvancedFilter } from '@/features/filter/components/advanced-filter'
import { filterOperators, requiresFilterValue } from '@/features/filter/models/advanced-filter'
import { Pagination } from '@/components/ui/pagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EntityPageHeader, EntityPageTitle } from '@/components/layout/entity-page-header'
import { EntityTable, EntityTableHead, EntityTableCell, EntityTableRow } from '@/components/ui/entity-table'
import type { EntityListViewModel } from '@/hooks/use-entity-list'
import { EntityRowHeading, RowCheckbox } from '@/components/ui/entity-table'
import { Plus, Table2, Search, ArrowDownAZ, ArrowUpRight, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
const avatarColors = [
  'bg-[#e2ead9] text-[#66804e]',
  'bg-[#e2e8f2] text-[#657ca1]',
  'bg-[#f2e6d3] text-[#a58650]',
  'bg-[#e9e2ed] text-[#9277a0]',
  'bg-[#e0ece9] text-[#609385]',
];

export function SelectableEntityList({ vm, icon: EntityIcon }: { vm: EntityListViewModel; icon: LucideIcon }) {
  const { title } = vm
  return <>
            <EntityPageHeader>
              <EntityPageTitle>
                <Table2 size={19} /> 全部{title}{' '}
              </EntityPageTitle>
              <div className="ml-auto flex items-center gap-2">
                <DeleteRecordsButton title={title} records={vm.selectedRecords} onDelete={vm.deleteSelected} />
              <Button onClick={vm.startCreate}>
                <Plus /> 新增{title}
              </Button>
              </div>
            </EntityPageHeader>
            <div className="flex flex-wrap items-center gap-2 border-b py-3">
              <div className="relative flex items-center text-[#a0a89e]">
                <Search size={16} className="absolute left-2.5" />
                <Input
                  className="w-full border-[#e6eae3] bg-[#fafbf9] pl-8 text-xs min-[601px]:w-40 min-[901px]:w-[185px]"
                  aria-label={`搜尋${title}`}
                  placeholder={`搜尋${title}…`}
                  value={vm.query}
                  onChange={(event) => vm.setQuery(event.target.value)}
                />
              </div>
              <FilterMenu
                fields={vm.fields}
                value={vm.filter}
                onChange={vm.applyFilter}
                hiddenFields={vm.hiddenFields}
                onToggleVisibility={vm.toggleFieldVisibility}
                fieldOrder={vm.fieldOrder}
                onMoveField={vm.moveField}
              />
              <AdvancedFilter fields={vm.fields} value={vm.advancedFilter} onChange={vm.applyAdvancedFilter} />
              <Button
                variant="ghost"
                className="text-xs text-[#7d867c] aria-pressed:bg-[#edf2e9] aria-pressed:text-[#365b3d]"
                aria-pressed={vm.sortAscending}
                onClick={vm.toggleSort}
              >
                <ArrowDownAZ /> {vm.sortAscending ? '名稱排序' : '排序'}
              </Button>
            </div>
            {vm.filter && (
              <div className="flex items-center gap-2 py-3 text-xs text-muted-foreground">
                <span>
                  {['名稱', ...vm.columns][vm.filter.field]} {filterOperators[vm.filter.operator]}
                  {requiresFilterValue(vm.filter.operator) &&
                    `「${filterValueLabel(vm.fields[vm.filter.field], vm.filter.value)}」`}
                </span>
                <Button variant="ghost" size="sm" onClick={vm.clearFilter}>
                  清除篩選
                </Button>
              </div>
            )}
            <EntityTable>
              <caption className="sr-only">{title}列表（示範資料）</caption>
              <thead>
                <tr>
                  <EntityTableHead selection>
                    <RowCheckbox aria-label="選取全部顯示項目" checked={vm.allSelected} indeterminate={vm.partiallySelected} disabled={!vm.rows.length} onChange={vm.toggleAll} />
                  </EntityTableHead>
                  {vm.fieldOrder
                    .filter((field) => !vm.hiddenFields.includes(field))
                    .map((field) => (
                      <EntityTableHead key={field} scope="col">
                        {field === 0 ? (
                          <span className="flex items-center gap-2">
                            <EntityIcon size={16} />
                            名稱
                          </span>
                        ) : (
                          vm.columns[field - 1]
                        )}
                      </EntityTableHead>
                    ))}
                </tr>
              </thead>
              <tbody>
                {vm.rows.map((row, index) => (
                  <EntityTableRow
                    key={row.id}
                    className={'group/row cursor-pointer transition-colors hover:bg-[#edf3e8]'}
                    onClick={() => vm.openDetails(row.id)}
                    data-selected={vm.selectedIds.includes(row.id)}
                  >
                    <EntityTableCell selection onClick={(event) => event.stopPropagation()}>
                      <RowCheckbox
                        aria-label={`選取 ${row.name}`}
                        checked={vm.selectedIds.includes(row.id)}
                        onChange={() => vm.toggleSelection(row.id)}
                      />
                    </EntityTableCell>
                    {vm.fieldOrder
                      .filter((field) => !vm.hiddenFields.includes(field))
                      .map((field) =>
                        field === 0 ? (
                          <EntityRowHeading key={field}>
                            <button
                              className="group/name flex min-w-[130px] cursor-pointer items-center gap-2 rounded-md border border-transparent bg-[#f4f5f2] px-2 py-1 text-left whitespace-nowrap hover:border-[#d1dbca] hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#527459]"
                              onClick={(event) => {
                                event.stopPropagation();
                                vm.openDetails(row.id);
                              }}
                            >
                              <span
                                className={cn(
                                  'grid size-6 place-items-center rounded-md text-[11px]',
                                  avatarColors[index % avatarColors.length]
                                )}
                              >
                                {row.name.slice(0, 1)}
                              </span>
                              {row.name}
                              <ArrowUpRight
                                size={15}
                                className="ml-auto text-[#939f8f] opacity-0 group-hover/name:opacity-100 group-focus-visible/name:opacity-100 group-hover/row:opacity-100"
                              />
                            </button>
                          </EntityRowHeading>
                        ) : (
                          <EntityTableCell key={field}>{row.cells[field - 1]}</EntityTableCell>
                        )
                      )}
                  </EntityTableRow>
                ))}
                {vm.rows.length === 0 && (
                  <EntityTableRow>
                    <EntityTableCell
                      colSpan={vm.columns.length + 2 - vm.hiddenFields.length}
                      className="p-10 text-center text-[#939c8d]"
                    >
                      找不到符合條件的{title}，請調整搜尋或篩選條件。
                    </EntityTableCell>
                  </EntityTableRow>
                )}
              </tbody>
            </EntityTable>
            <footer className="grid items-center gap-3 px-2 py-5 text-[11px] text-[#9ba395] xl:grid-cols-[1fr_auto_1fr]">
              <span>
                共 {vm.total} 筆{title} ·{' '}
                <label className="inline-flex items-center gap-1.5">
                  顯示
                  <select
                    aria-label="每頁顯示筆數"
                    className="rounded-md border border-input bg-background px-2 py-1 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={vm.pageSize}
                    onChange={(event) => vm.setPageSize(Number(event.target.value))}
                  >
                    {vm.pageSizeOptions.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                  筆
                </label>
                {vm.selectedIds.length > 0 && ` · 已選取 ${vm.selectedIds.length} 筆`}
              </span>
              <Pagination page={vm.page} pageCount={vm.pageCount} onPageChange={vm.setPage} />
            </footer>
  </>
}
