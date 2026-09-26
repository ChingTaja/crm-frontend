import { navigate } from '@/lib/router';
import { AppLink } from '@/components/ui/app-link';
import { DeleteRecordsButton } from '@/components/entity/delete-records-button'
import { useState } from 'react'
import { ArrowDownAZ, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FilterMenu } from '@/components/ui/filter-menu'
import { AdvancedFilter } from '@/features/filter/components/advanced-filter'
import { Pagination } from '@/components/ui/pagination'
import { SalesSidebar } from '@/components/layout/sales-sidebar'
import { EntityPageHeader, EntityPageTitle } from '@/components/layout/entity-page-header'
import { EntityTable, EntityTableHead, EntityTableCell, EntityTableRow, RowCheckbox } from '@/components/ui/entity-table'
import { useQuoteViewModel } from '../view-models/use-quote-view-model'
import { QuoteEditorView } from './quote-editor-view'

export function QuoteView({ recordId }: { recordId?: string }) {
  const vm = useQuoteViewModel()
  const [selectedVersionId, setSelectedVersionId] = useState('')
  const quote = vm.quotes.find(q => q.id === recordId)
  const version = quote?.versions.find(v => v.id === selectedVersionId) ?? quote?.versions[quote.versions.length - 1]
  const visible = vm.fieldOrder.filter(index => !vm.hiddenFields.includes(index))
  return <div className="grid flex-1 bg-white text-sm md:grid-cols-[235px_minmax(0,1fr)]">
    <SalesSidebar entity="quotes" />
    <main className="min-w-0 px-6">
      <p className="border-b py-3 text-xs text-muted-foreground">前端預覽 · 未寄送郵件 · 資料與紀錄在重新整理後還原</p>
      {recordId ? recordId === 'new' || (quote && version) ? <QuoteEditorView key={`${recordId}-${version?.id ?? 'new'}-${version?.revision ?? 0}`} vm={vm} quote={quote} version={version} onVersion={setSelectedVersionId} /> : <p className="py-10">找不到報價單。<AppLink className="underline" href="/quotes">返回列表</AppLink></p> : <>
        <EntityPageHeader><EntityPageTitle>全部報價單 <span className="text-muted-foreground">· {vm.filteredTotal}</span></EntityPageTitle><div className="ml-auto flex items-center gap-2"><DeleteRecordsButton title="報價單" records={vm.selectedRecords} onDelete={vm.deleteSelected} disabled={!vm.canManage} includesVersions /><Button disabled={!vm.canManage} onClick={() => { vm.clearSelection(); navigate('/quotes/new') }}><Plus />新增報價單</Button></div></EntityPageHeader>
        <div className="flex flex-wrap items-center gap-2 border-b py-3"><Input className="w-52" aria-label="搜尋報價單" placeholder="搜尋報價單…" value={vm.query} onChange={e => vm.setQuery(e.target.value)} /><FilterMenu fields={vm.fields} value={vm.filter} onChange={vm.setFilter} hiddenFields={vm.hiddenFields} onToggleVisibility={vm.toggleVisibility} fieldOrder={vm.fieldOrder} onMoveField={vm.moveField} /><AdvancedFilter fields={vm.fields} value={vm.advancedFilter} onChange={vm.setAdvanced} /><Button variant="ghost" aria-pressed={vm.sort} onClick={vm.toggleSort}><ArrowDownAZ />排序</Button></div>
        <EntityTable>
          <caption className="sr-only">報價單最新版本列表</caption>
          <thead><tr>
            <EntityTableHead selection><RowCheckbox aria-label="選取全部顯示項目" checked={vm.allSelected} indeterminate={vm.partiallySelected} disabled={!vm.rows.length} onChange={vm.toggleAll} /></EntityTableHead>
            {visible.map(index => <EntityTableHead key={index}>{vm.fields[index].label}</EntityTableHead>)}
          </tr></thead>
          <tbody>
            {vm.rows.map(row => <EntityTableRow key={row.id} data-selected={vm.selectedIds.includes(row.id)} className="cursor-pointer" onClick={event => { if (!(event.target as Element).closest('a')) navigate(`/quotes/${row.id}/edit`) }}>
              <EntityTableCell selection onClick={event => event.stopPropagation()}><RowCheckbox aria-label={`選取 ${row.cells[0]}`} checked={vm.selectedIds.includes(row.id)} onChange={() => vm.toggleSelection(row.id)} /></EntityTableCell>
              {visible.map(index => <EntityTableCell key={index}>{index === 0 ? <AppLink className="font-medium hover:underline" href={`/quotes/${row.id}/edit`}>{row.cells[index]}</AppLink> : row.cells[index]}</EntityTableCell>)}
            </EntityTableRow>)}
            {!vm.rows.length && <tr><EntityTableCell className="py-12 text-center text-muted-foreground" colSpan={visible.length + 1}>尚無符合條件的報價單。點擊「新增報價單」開始建立 v1。</EntityTableCell></tr>}
          </tbody>
        </EntityTable>
        <footer className="grid items-center gap-3 py-5 text-xs text-muted-foreground xl:grid-cols-[1fr_auto_1fr]"><label>共 {vm.total} 筆 · 顯示 <select aria-label="每頁顯示筆數" className="rounded border px-2 py-1" value={vm.pageSize} onChange={e => vm.setPageSize(Number(e.target.value))}>{[5, 10, 15, 20].map(n => <option key={n}>{n}</option>)}</select> 筆{vm.selectedIds.length > 0 && ` · 已選取 ${vm.selectedIds.length} 筆`}</label><Pagination page={vm.page} pageCount={vm.pageCount} onPageChange={vm.setPage} /><span className="xl:text-right">進入報價單管理歷史版本</span></footer>
      </>}
    </main>
  </div>
}
