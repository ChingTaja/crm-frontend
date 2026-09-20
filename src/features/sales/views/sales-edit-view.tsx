import { LeadQualificationDialog } from '../components/lead-qualification-dialog'
import { ArrowLeft, Plus, RotateCcw, Save, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lookup } from '@/components/ui/lookup'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { CustomerPageHeader, CustomerPageTitle } from '@/features/customers/components/customer-page-header'
import { useSalesEditViewModel } from '../view-models/use-sales-edit-view-model'
import type { SalesViewModel } from '../view-models/use-sales-view-model'
import type { Lead, Opportunity, Product, Order } from '../models/sales-model'

export function SalesEditView({ vm, record }: { vm: SalesViewModel; record?: Lead | Opportunity | Product | Order }) {
  const form = useSalesEditViewModel(vm.entity, record)
  const { draft, update } = form
  const lead = vm.entity === 'leads' && record ? record as Lead : undefined
  const leadStatusOptions = [...new Set(['待聯繫', '聯繫中', ...(lead ? [lead.status] : [])])]
  const statusOptions = vm.entity === 'leads' ? leadStatusOptions : vm.statuses
  const textFields = vm.entity === 'leads' ? ['company', 'email', 'phone', 'source', 'owner'] as const : vm.entity === 'opportunities' ? ['owner', 'expectedCloseDate'] as const : vm.entity === 'products' ? ['sku'] as const : []
  const labels = { company: '公司', email: '電子郵件', phone: '電話', source: '來源', owner: '負責人', expectedCloseDate: '預計成交日', sku: '產品編號' }
  const relatedCustomer = vm.entity === 'opportunities' || vm.entity === 'orders'
  return <>
    <CustomerPageHeader>
      <div className="flex items-center gap-2"><Button variant="ghost" size="icon" aria-label="返回列表" onClick={form.back}><ArrowLeft /></Button><CustomerPageTitle>{record ? '編輯' : '新增'}{vm.title}</CustomerPageTitle>{lead && <LeadQualificationDialog lead={lead} disabled={form.isDirty} />}</div>
      <div className="ml-auto flex gap-2"><Button variant="outline" className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100" onClick={form.back}>取消</Button><Button variant="outline" onClick={form.reset}><RotateCcw />重置</Button><Button type="submit" form="sales-form"><Save />儲存</Button></div>
    </CustomerPageHeader>
    {lead && form.isDirty && <p className="pt-3 text-xs text-muted-foreground">請先儲存修改，再進行資格審核。</p>}
    {lead?.qualification && <div role="status" className="mt-4 space-y-2 rounded-lg border bg-muted/30 p-4 text-sm">
      <p>審核結果：{lead.qualification.decision === 'approved' ? '通過審核' : '不符合資格'}</p>
      {lead.qualification.reason && <p>原因：{lead.qualification.reason}{lead.qualification.note && ` — ${lead.qualification.note}`}</p>}
      <div className="flex flex-wrap gap-4">
        {lead.qualification.customerId && <a className="underline" href={`#/customers/${lead.qualification.customerId}/edit`}>查看客戶</a>}
        {lead.qualification.contactId && <a className="underline" href={`#/contacts/${lead.qualification.contactId}/edit`}>查看聯絡人</a>}
        {lead.qualification.opportunityId && <a className="underline" href={`#/opportunities/${lead.qualification.opportunityId}/edit`}>查看商機</a>}
      </div>
    </div>}
    <form id="sales-form" onSubmit={form.save} className="mx-auto max-w-5xl space-y-6 py-8">
      <Card><CardHeader><CardTitle>{vm.title}基本資料</CardTitle></CardHeader><CardContent className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2"><Label htmlFor="sales-name">名稱 *</Label><Input id="sales-name" required value={draft.name} onChange={e => update('name', e.target.value)} /></div>
        <div className="space-y-2"><Label htmlFor="sales-status">{vm.entity === 'opportunities' ? '階段' : '狀態'}</Label><select disabled={!!lead?.qualification} id="sales-status" className="h-9 w-full rounded-lg border px-3 text-sm" value={vm.entity === 'opportunities' ? draft.stage : draft.status} onChange={e => vm.entity === 'opportunities' ? update('stage', e.target.value as Opportunity['stage']) : update('status', e.target.value)}>{statusOptions.map(status => <option key={status}>{status}</option>)}</select></div>
        {textFields.map(field => <div key={field} className="space-y-2"><Label htmlFor={`sales-${field}`}>{labels[field]}{field === 'sku' ? ' *' : ''}</Label><Input id={`sales-${field}`} type={field === 'email' ? 'email' : field === 'expectedCloseDate' ? 'date' : field === 'phone' ? 'tel' : 'text'} required={field === 'sku'} value={draft[field]} onChange={e => update(field, e.target.value)} /></div>)}
        {relatedCustomer && <div className="space-y-2"><Label htmlFor="sales-customer">所屬客戶 *</Label><Lookup id="sales-customer" label="所屬客戶" required value={draft.customerId} options={vm.customers.map(c => ({ value: c.id, label: c.name }))} onValueChange={value => update('customerId', value)} /></div>}
        {vm.entity === 'opportunities' && <div className="space-y-2"><Label htmlFor="sales-lead">來源 Lead</Label><Lookup id="sales-lead" label="來源 Lead" value={draft.leadId} options={[{ value: '', label: '無' }, ...vm.leads.map(l => ({ value: l.id, label: l.name }))]} onValueChange={value => update('leadId', value)} /></div>}
        {vm.entity === 'orders' && <div className="space-y-2"><Label htmlFor="sales-opportunity">來源商機</Label><Lookup id="sales-opportunity" label="來源商機" value={draft.opportunityId} options={[{ value: '', label: '無' }, ...vm.opportunities.filter(o => o.customerId === draft.customerId).map(o => ({ value: o.id, label: o.name }))]} onValueChange={value => update('opportunityId', value)} /></div>}
        {(vm.entity === 'opportunities' || vm.entity === 'products') && <div className="space-y-2"><Label htmlFor="sales-price">{vm.entity === 'products' ? '單價' : '預估金額'}（TWD）</Label><Input id="sales-price" type="number" required min="0" step="0.01" value={vm.entity === 'products' ? draft.price : draft.amount} onChange={e => update(vm.entity === 'products' ? 'price' : 'amount', e.target.valueAsNumber)} /></div>}
      </CardContent></Card>
      {vm.entity === 'orders' && <Card><CardHeader className="flex-row items-center justify-between"><CardTitle>訂單明細</CardTitle><Button type="button" variant="outline" onClick={() => update('items', [...draft.items, { productId: '', quantity: 1, unitPrice: 0 }])}><Plus />加入產品</Button></CardHeader><CardContent className="space-y-4">
        {draft.items.map((line, index) => <div key={index} className="grid items-end gap-3 rounded-lg border p-3 sm:grid-cols-[2fr_1fr_1fr_auto]">
          <div className="space-y-2"><Label htmlFor={`product-${index}`}>產品 *</Label><Lookup id={`product-${index}`} label="產品" value={line.productId} options={vm.products.filter(p => p.status === '啟用' || p.id === line.productId).map(p => ({ value: p.id, label: p.name, keywords: p.sku }))} onValueChange={value => update('items', draft.items.map((item, i) => i === index ? { ...item, productId: value, unitPrice: vm.products.find(p => p.id === value)?.price ?? 0 } : item))} /></div>
          <div className="space-y-2"><Label htmlFor={`qty-${index}`}>數量</Label><Input id={`qty-${index}`} type="number" min="1" step="1" required value={line.quantity} onChange={e => update('items', draft.items.map((item, i) => i === index ? { ...item, quantity: e.target.valueAsNumber } : item))} /></div>
          <div className="space-y-2"><Label htmlFor={`price-${index}`}>單價（TWD）</Label><Input id={`price-${index}`} type="number" min="0" step="0.01" required value={line.unitPrice} onChange={e => update('items', draft.items.map((item, i) => i === index ? { ...item, unitPrice: e.target.valueAsNumber } : item))} /></div>
          <Button type="button" variant="ghost" size="icon" aria-label={`移除第 ${index + 1} 筆產品`} onClick={() => update('items', draft.items.filter((_, i) => i !== index))}><Trash2 /></Button>
        </div>)}
        {!draft.items.length && <p className="text-sm text-muted-foreground">請加入至少一筆產品。</p>}
        <p className="text-right font-semibold">總金額：NT$ {draft.items.reduce((sum, line) => sum + (Number.isFinite(line.quantity * line.unitPrice) ? line.quantity * line.unitPrice : 0), 0).toLocaleString('zh-TW')}</p>
      </CardContent></Card>}
      <p role="status" className="text-sm text-destructive">{form.error}</p><p className="text-xs text-muted-foreground">前端示範資料，重新整理會還原。</p>
    </form>
  </>
}
