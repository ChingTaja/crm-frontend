import { useState } from 'react'
import { ArrowDownAZ, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FilterMenu } from '@/components/ui/filter-menu'
import { AdvancedFilter } from '@/features/filters/components/advanced-filter'
import { Pagination } from '@/components/ui/pagination'
import { SalesSidebar } from '@/features/sales/components/sales-sidebar'
import { CustomerPageHeader, CustomerPageTitle } from '@/features/customers/components/customer-page-header'
import { CustomerTable, CustomerTableHead, CustomerTableCell, CustomerTableRow } from '@/features/customers/components/customer-table'
import { useQuoteViewModel } from '../view-models/use-quote-view-model'
import { QuoteEditorView } from './quote-editor-view'
import { quoteActors } from '../models/quote-types'

export function QuoteView({ recordId }: { recordId?: string }) {
  const vm = useQuoteViewModel()
  const [selectedVersionId, setSelectedVersionId] = useState('')
  const quote = vm.quotes.find(q => q.id === recordId)
  const version = quote?.versions.find(v => v.id === selectedVersionId) ?? quote?.versions[quote.versions.length - 1]
  const visible = vm.fieldOrder.filter(index => !vm.hiddenFields.includes(index))
  return <div className="grid flex-1 bg-white text-sm md:grid-cols-[235px_minmax(0,1fr)]">
    <SalesSidebar entity="quotes" />
    <main className="min-w-0 px-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b py-3 text-xs text-muted-foreground">
        <span>前端預覽 · 未寄送郵件 · 資料與紀錄在重新整理後還原</span>
        <div className="flex items-center gap-2"><Label htmlFor="quote-actor" className="text-xs">模擬操作者</Label><select id="quote-actor" className="rounded-lg border bg-background px-2 py-1.5 text-foreground" value={vm.actor.id} onChange={e => vm.setActor(quoteActors.find(a => a.id === e.target.value)!)}>{quoteActors.map(actor => <option key={actor.id} value={actor.id}>{actor.name}</option>)}</select></div>
      </div>
      {recordId ? recordId === 'new' || (quote && version) ? <QuoteEditorView key={`${recordId}-${version?.id ?? 'new'}-${version?.revision ?? 0}`} vm={vm} quote={quote} version={version} onVersion={setSelectedVersionId} /> : <p className="py-10">找不到報價單。<a className="underline" href="#/quotes">返回列表</a></p> : <>
        <CustomerPageHeader><CustomerPageTitle>全部報價單 <span className="text-muted-foreground">· {vm.filteredTotal}</span></CustomerPageTitle><Button disabled={vm.actor.role !== 'sales'} onClick={() => { window.location.hash = '/quotes/new' }}><Plus />新增報價單</Button></CustomerPageHeader>
        <div className="flex flex-wrap items-center gap-2 border-b py-3"><Input className="w-52" aria-label="搜尋報價單" placeholder="搜尋報價單…" value={vm.query} onChange={e => vm.setQuery(e.target.value)} /><FilterMenu fields={vm.fields} value={vm.filter} onChange={vm.setFilter} hiddenFields={vm.hiddenFields} onToggleVisibility={vm.toggleVisibility} fieldOrder={vm.fieldOrder} onMoveField={vm.moveField} /><AdvancedFilter fields={vm.fields} value={vm.advancedFilter} onChange={vm.setAdvanced} /><Button variant="ghost" aria-pressed={vm.sort} onClick={vm.toggleSort}><ArrowDownAZ />排序</Button></div>
        <CustomerTable><caption className="sr-only">報價單最新版本列表</caption><thead><tr>{visible.map(index => <CustomerTableHead key={index}>{vm.fields[index].label}</CustomerTableHead>)}</tr></thead><tbody>{vm.rows.map(row => <CustomerTableRow key={row.id} className="cursor-pointer" onClick={() => { window.location.hash = `/quotes/${row.id}/edit` }}>{visible.map(index => <CustomerTableCell key={index}>{index === 0 ? <a className="font-medium hover:underline" href={`#/quotes/${row.id}/edit`}>{row.cells[index]}</a> : row.cells[index]}</CustomerTableCell>)}</CustomerTableRow>)}{!vm.rows.length && <tr><CustomerTableCell className="py-12 text-center text-muted-foreground" colSpan={visible.length}>尚無符合條件的報價單。點擊「新增報價單」開始建立 v1。</CustomerTableCell></tr>}</tbody></CustomerTable>
        <footer className="grid items-center gap-3 py-5 text-xs text-muted-foreground xl:grid-cols-[1fr_auto_1fr]"><label>共 {vm.total} 筆 · 顯示 <select aria-label="每頁顯示筆數" className="rounded border px-2 py-1" value={vm.pageSize} onChange={e => vm.setPageSize(Number(e.target.value))}>{[5, 10, 15, 20].map(n => <option key={n}>{n}</option>)}</select> 筆</label><Pagination page={vm.page} pageCount={vm.pageCount} onPageChange={vm.setPage} /><span className="xl:text-right">列表顯示最新版本</span></footer>
      </>}
    </main>
  </div>
}
