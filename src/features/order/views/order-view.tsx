import { useState } from 'react';
import { AppLink } from '@/components/ui/app-link';
import { Lookup } from '@/components/ui/lookup';
import { Button } from '@/components/ui/button';
import { EntityWorkspace } from '@/components/layout/entity-workspace';
import { SalesSidebar } from '@/components/layout/sales-sidebar';
import { Pagination } from '@/components/ui/pagination';
import { useOrderViewModel } from '../view-models/use-order-view-model';
import { OrderEditView } from './order-edit-view';
import { orderStatusLabels, type OrderQuery } from '../models/order-api';

function OrderListView() {
  const vm = useOrderViewModel();
  const [draft, setDraft] = useState<OrderQuery>(vm.filters);
  const { query, metadata } = vm;
  const page = query.pagination;
  const error = metadata.error ?? query.error;
  return <div className="space-y-4 py-6">
    <h1 className="text-xl font-semibold">全部訂單 · {page.total}</h1>
    <p className="text-sm text-muted-foreground">訂單由已接受的報價單轉換建立。<AppLink className="ml-2 underline" href="/quotes">前往報價單</AppLink></p>
    <form className="flex flex-wrap items-end gap-3" onSubmit={e => { e.preventDefault(); vm.search(draft); }}>
      <label>搜尋<input className="block rounded border p-2" placeholder="訂單編號、名稱、客戶、報價編號" value={draft.keyword ?? ''} onChange={e => setDraft({ ...draft, keyword: e.target.value })} /></label>
      <label>狀態<select className="block rounded border p-2" value={draft.status ?? ''} onChange={e => setDraft({ ...draft, status: (e.target.value || undefined) as OrderQuery['status'] })}><option value="">全部</option>{Object.entries(orderStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <div className="min-w-48"><label htmlFor="order-customer-filter">客戶</label><Lookup id="order-customer-filter" label="客戶" value={draft.customerId ?? ''} options={[{ value: '', label: '全部客戶' }, ...vm.customers.records.map(customer => ({ value: customer.id ?? '', label: customer.name ?? '' }))]} onValueChange={value => setDraft({ ...draft, customerId: value || undefined })} /></div>
      <label>建立日期起<input className="block rounded border p-2" type="date" max={draft.createdTo} value={draft.createdFrom ?? ''} onChange={e => setDraft({ ...draft, createdFrom: e.target.value || undefined })} /></label>
      <label>建立日期迄<input className="block rounded border p-2" type="date" min={draft.createdFrom} value={draft.createdTo ?? ''} onChange={e => setDraft({ ...draft, createdTo: e.target.value || undefined })} /></label>
      <label>排序<select className="block rounded border p-2" value={draft.sort} onChange={e => setDraft({ ...draft, sort: e.target.value })}>{[['createdAt','建立時間'],['id','ID'],['number','訂單編號'],['name','名稱'],['customerName','客戶名稱'],['quoteNumber','報價編號'],['totalCents','總金額'],['status','狀態']].map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label>順序<select className="block rounded border p-2" value={draft.direction} onChange={e => setDraft({ ...draft, direction: e.target.value })}><option value="desc">降冪</option><option value="asc">升冪</option></select></label>
      <Button type="submit">查詢</Button><Button type="button" variant="outline" onClick={() => { const defaults = { sort: 'createdAt', direction: 'desc' }; setDraft(defaults); vm.search(defaults); }}>清除</Button>
    </form>
    {vm.customers.error && <p role="alert">無法載入客戶選項：{vm.customers.error.message} <Button variant="outline" onClick={vm.customers.reload}>重試</Button></p>}
    {error && <div role="alert" className="text-destructive">無法載入訂單：{error.message} <Button onClick={() => { void Promise.all([query.reload(), metadata.reload()]).catch(() => {}); }}>重試</Button></div>}
    {query.isLoading || metadata.isLoading ? <p role="status">載入訂單…</p> : !error && <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr>{metadata.fields.map(field => <th className="border-b p-3" key={field.apiFieldName}>{field.label}</th>)}</tr></thead><tbody>
      {vm.rows.map(row => <tr className="border-b" key={row.id}>{row.displayValues.map((value, index) => {
        const field = metadata.fields[index].apiFieldName;
        const text = field === 'totalCents' && value !== '' ? `NT$ ${(Number(value) / 100).toLocaleString('zh-TW', { minimumFractionDigits: 2 })}` : field === 'status' ? orderStatusLabels[value as keyof typeof orderStatusLabels] ?? value : value;
        return <td className="p-3" key={index}>{index === 0 || field === 'name' || field === 'number' ? <AppLink className="underline" href={`/orders/${encodeURIComponent(row.id)}/edit`}>{text || '—'}</AppLink> : text || '—'}</td>;
      })}</tr>)}
      {!vm.rows.length && <tr><td className="p-6 text-center" colSpan={metadata.fields.length}>沒有符合條件的訂單</td></tr>}
    </tbody></table></div>}
    <div className="flex items-center justify-between"><label>每頁筆數<select className="ml-2 rounded border p-2" value={page.pageSize} onChange={e => { page.setPage(1); page.setPageSize(Number(e.target.value)); }}>{[5,10,20,50,100].map(size => <option key={size}>{size}</option>)}</select></label><Pagination page={page.page} pageCount={page.pageCount} onPageChange={page.setPage} /></div>
  </div>;
}
export function OrderView({ recordId }: { recordId?: string }) {
  return <EntityWorkspace sidebar={<SalesSidebar entity="orders" />}>
    {!recordId ? <OrderListView /> : recordId === 'new' ? <p className="py-10">訂單由已接受的報價單轉換建立。<AppLink href="/quotes" className="ml-2 underline">前往報價單</AppLink></p> : <OrderEditView key={recordId} id={recordId} />}
  </EntityWorkspace>;
}
