import { filterValueLabel } from '@/lib/filter-fields'
import { FilterMenu } from '@/components/ui/filter-menu'
import { filterOperators, requiresFilterValue } from '@/features/filters/models/advanced-filter'
import { AdvancedFilter } from '@/features/filters/components/advanced-filter'
import { Plus, ArrowDownAZ, Target, Handshake, ShoppingCart, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pagination } from '@/components/ui/pagination'
import { CustomerPageHeader, CustomerPageTitle } from '@/features/customers/components/customer-page-header'
import { CustomerTable, CustomerTableHead, CustomerTableCell, CustomerTableRow } from '@/features/customers/components/customer-table'
import { useSalesViewModel } from '../view-models/use-sales-view-model'
import type { SalesEntity } from '../models/sales-model'
import { SalesEditView } from './sales-edit-view'

export function SalesView({ entity, recordId }: { entity: SalesEntity; recordId?: string }) {
  const vm = useSalesViewModel(entity)
  const selling = entity === 'orders' || entity === 'products'
  const links = selling ? [{ key: 'orders', label: '訂單', english: 'Order', icon: ShoppingCart }, { key: 'products', label: '產品', english: 'Product', icon: Package }] : [{ key: 'leads', label: '潛在客戶', english: 'Lead', icon: Target }, { key: 'opportunities', label: '商機', english: 'Opportunity', icon: Handshake }]
  const record = ({ leads: vm.leads, opportunities: vm.opportunities, orders: vm.orders, products: vm.products }[entity]).find(item => item.id === recordId)
  return <div className="grid flex-1 bg-white text-sm md:grid-cols-[235px_minmax(0,1fr)]">
    <aside className="border-r bg-[#f8f9f8] p-4"><p className="mb-3 px-3 text-xs text-muted-foreground">{selling ? '銷售管理' : '商機追蹤'}</p><nav className="flex gap-1 md:grid">{links.map(({ key, label, english, icon: Icon }) => <a key={key} href={`#/${key}`} aria-current={entity === key ? 'page' : undefined} className="flex flex-1 items-center gap-2 rounded-lg p-3 text-muted-foreground hover:bg-muted aria-[current=page]:bg-[#e9eee7] aria-[current=page]:text-[#284c36]"><Icon size={18} />{label}<span className="ml-auto text-[10px]">{english}</span></a>)}</nav></aside>
    <main className="min-w-0 px-6">
      {recordId ? recordId === 'new' || record ? <SalesEditView key={`${recordId}-${record && 'qualification' in record ? record.qualification?.reviewedAt ?? '' : ''}`} vm={vm} record={record} /> : <div className="py-10">找不到資料。<a className="underline" href={`#/${entity}`}>返回列表</a></div> : <>
        <CustomerPageHeader><CustomerPageTitle>全部{vm.title}<span className="text-sm text-muted-foreground">· {vm.filteredTotal}</span></CustomerPageTitle><Button onClick={vm.create}><Plus />新增{vm.title}</Button></CustomerPageHeader>
        <div className="flex flex-wrap items-center gap-2 border-b py-3"><Input className="w-52" aria-label="搜尋資料" placeholder={`搜尋${vm.title}…`} value={vm.query} onChange={e => vm.setQuery(e.target.value)} /><FilterMenu fields={vm.fields} value={vm.filter} onChange={vm.applyFilter} hiddenFields={vm.hiddenFields} onToggleVisibility={vm.toggleFieldVisibility} fieldOrder={vm.fieldOrder} onMoveField={vm.moveField} /><AdvancedFilter fields={vm.fields} value={vm.advancedFilter} onChange={vm.applyAdvancedFilter} /><Button variant="ghost" aria-pressed={vm.sort} onClick={vm.toggleSort}><ArrowDownAZ />{vm.sort ? '名稱排序' : '排序'}</Button></div>
        {vm.filter && <div className="flex items-center gap-2 py-3 text-xs text-muted-foreground"><span>{['名稱', ...vm.columns][vm.filter.field]} {filterOperators[vm.filter.operator]}{requiresFilterValue(vm.filter.operator) && `「${filterValueLabel(vm.fields[vm.filter.field], vm.filter.value)}」`}</span><Button size="sm" variant="ghost" onClick={vm.clearFilter}>清除篩選</Button></div>}
        <CustomerTable><caption className="sr-only">{vm.title}列表</caption><thead><tr>{vm.fieldOrder.filter(field => !vm.hiddenFields.includes(field)).map(field => <CustomerTableHead key={field}>{field === 0 ? '名稱' : vm.columns[field - 1]}</CustomerTableHead>)}</tr></thead><tbody>{vm.rows.map(row => <CustomerTableRow key={row.id} className="cursor-pointer" onClick={() => { window.location.hash = `/${entity}/${row.id}/edit` }}>{vm.fieldOrder.filter(field => !vm.hiddenFields.includes(field)).map(field => <CustomerTableCell key={field}>{field === 0 ? <a className="font-medium hover:underline" href={`#/${entity}/${row.id}/edit`}>{row.name}</a> : row.cells[field - 1] || '—'}</CustomerTableCell>)}</CustomerTableRow>)}{!vm.rows.length && <tr><CustomerTableCell colSpan={vm.columns.length + 1 - vm.hiddenFields.length} className="py-10 text-center text-muted-foreground">沒有符合條件的資料</CustomerTableCell></tr>}</tbody></CustomerTable>
        <footer className="grid items-center gap-3 py-5 text-xs text-muted-foreground xl:grid-cols-[1fr_auto_1fr]"><label>共 {vm.total} 筆 · 顯示 <select aria-label="每頁顯示筆數" className="rounded border px-2 py-1" value={vm.pageSize} onChange={e => vm.setPageSize(Number(e.target.value))}>{[5, 10, 15, 20].map(size => <option key={size}>{size}</option>)}</select> 筆</label><Pagination page={vm.page} pageCount={vm.pageCount} onPageChange={vm.setPage} /><span className="xl:text-right">示範資料 · 尚未連接後端</span></footer>
      </>}
    </main>
  </div>
}
