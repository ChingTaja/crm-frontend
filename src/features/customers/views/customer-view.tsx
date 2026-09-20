import { filterValueLabel } from '@/lib/filter-fields';
import { AdvancedFilter } from '@/features/filters/components/advanced-filter';
import { ContactEditView } from './contact-edit-view';
import { FilterMenu } from '@/components/ui/filter-menu';
import { filterOperators, requiresFilterValue } from '@/features/filters/models/advanced-filter';
import { Pagination } from '@/components/ui/pagination';
import { CustomerSidebar } from '../components/customer-sidebar';
import {
  CustomerTable,
  CustomerTableRow,
  CustomerTableHead,
  CustomerTableCell,
  CustomerRowHeading,
  RowCheckbox,
} from '../components/customer-table';
import { CustomerPageHeader, CustomerPageTitle } from '../components/customer-page-header';
import { cn } from '@/lib/utils';
import { CustomerEditView } from './customer-edit-view';
import { Plus, Building2, UserRound, Table2, Search, ArrowDownAZ, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { CustomerViewModel } from '../view-models/use-customer-view-model';

const avatarColors = [
  'bg-[#e2ead9] text-[#66804e]',
  'bg-[#e2e8f2] text-[#657ca1]',
  'bg-[#f2e6d3] text-[#a58650]',
  'bg-[#e9e2ed] text-[#9277a0]',
  'bg-[#e0ece9] text-[#609385]',
];

export function CustomerView({ viewModel: vm }: { viewModel: CustomerViewModel }) {
  const title = vm.isCustomers ? '客戶' : '聯絡人';
  const EntityIcon = vm.isCustomers ? Building2 : UserRound;
  return (
    <div className="grid flex-1 grid-cols-1 bg-white text-sm text-[#414742] min-[601px]:grid-cols-[185px_minmax(0,1fr)] min-[901px]:grid-cols-[235px_minmax(0,1fr)]">
      <CustomerSidebar isCustomers={vm.isCustomers} />
      <main className="min-w-0 px-4 min-[901px]:px-6">
        {vm.isEditing ? (
          vm.isNew ? (
            vm.isCustomers ? (
              <CustomerEditView key="new-customer" />
            ) : (
              <ContactEditView key="new-contact" />
            )
          ) : vm.isCustomers && vm.editingCustomer ? (
            <CustomerEditView key={vm.editingCustomer.id} customer={vm.editingCustomer} />
          ) : !vm.isCustomers && vm.editingContact ? (
            <ContactEditView key={vm.editingContact.id} contact={vm.editingContact} />
          ) : (
            <div className="py-10">
              <h1 className="mb-4 text-xl">找不到此{title}</h1>
              <a href={vm.isCustomers ? '#/customers' : '#/contacts'} className="underline">
                返回{title}列表
              </a>
            </div>
          )
        ) : (
          <>
            <CustomerPageHeader>
              <CustomerPageTitle>
                <Table2 size={19} /> 全部{title}{' '}
              </CustomerPageTitle>
              <Button onClick={vm.startCreate}>
                <Plus /> 新增{title}
              </Button>
            </CustomerPageHeader>
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
            <CustomerTable>
              <caption className="sr-only">{title}列表（示範資料）</caption>
              <thead>
                <tr>
                  <CustomerTableHead selection>
                    <RowCheckbox aria-label="選取全部顯示項目" checked={vm.allSelected} onChange={vm.toggleAll} />
                  </CustomerTableHead>
                  {vm.fieldOrder
                    .filter((field) => !vm.hiddenFields.includes(field))
                    .map((field) => (
                      <CustomerTableHead key={field} scope="col">
                        {field === 0 ? (
                          <span className="flex items-center gap-2">
                            <EntityIcon size={16} />
                            名稱
                          </span>
                        ) : (
                          vm.columns[field - 1]
                        )}
                      </CustomerTableHead>
                    ))}
                </tr>
              </thead>
              <tbody>
                {vm.rows.map((row, index) => (
                  <CustomerTableRow
                    key={row.id}
                    className={'group/row cursor-pointer transition-colors hover:bg-[#edf3e8]'}
                    onClick={() => vm.openDetails(row.id)}
                    data-selected={vm.selectedIds.includes(row.id)}
                  >
                    <CustomerTableCell selection onClick={(event) => event.stopPropagation()}>
                      <RowCheckbox
                        aria-label={`選取 ${row.name}`}
                        checked={vm.selectedIds.includes(row.id)}
                        onChange={() => vm.toggleSelection(row.id)}
                      />
                    </CustomerTableCell>
                    {vm.fieldOrder
                      .filter((field) => !vm.hiddenFields.includes(field))
                      .map((field) =>
                        field === 0 ? (
                          <CustomerRowHeading key={field}>
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
                          </CustomerRowHeading>
                        ) : (
                          <CustomerTableCell key={field}>{row.cells[field - 1]}</CustomerTableCell>
                        )
                      )}
                  </CustomerTableRow>
                ))}
                {vm.rows.length === 0 && (
                  <CustomerTableRow>
                    <CustomerTableCell
                      colSpan={vm.columns.length + 2 - vm.hiddenFields.length}
                      className="p-10 text-center text-[#939c8d]"
                    >
                      找不到符合條件的{title}，請調整搜尋或篩選條件。
                    </CustomerTableCell>
                  </CustomerTableRow>
                )}
              </tbody>
            </CustomerTable>
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
        )}
      </main>
    </div>
  );
}
