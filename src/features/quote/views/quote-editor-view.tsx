import { ArrowLeft, RotateCcw, Save, LockKeyhole } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lookup } from '@/components/ui/lookup'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { EntityPageHeader, EntityPageTitle } from '@/components/layout/entity-page-header'
import { QuoteLines } from '../components/quote-lines'
import { QuoteActions } from '../components/quote-actions'
import { QuoteAudit } from '../components/quote-audit'
import { QuoteVersionManager } from '../components/quote-version-manager'
import { useQuoteEditor } from '../view-models/use-quote-editor'
import type { QuoteViewModel } from '../view-models/use-quote-view-model'
import type { Quote, QuoteVersion } from '../models/quote-types'
import { quotePolicy, money, requiresQuoteApproval } from '../models/quote-policy'

export function QuoteEditorView({ vm, quote, version, onVersion }: { vm: QuoteViewModel; quote?: Quote; version?: QuoteVersion; onVersion: (id: string) => void }) {
  const editor = useQuoteEditor(vm.actor, quote, version)
  const d = editor.draft
  return <>
    <EntityPageHeader>
      <div className="flex items-center gap-2"><Button variant="ghost" size="icon" aria-label="返回報價單" onClick={() => { window.location.hash = '/quotes' }}><ArrowLeft /></Button><EntityPageTitle>{quote ? quote.number : '新增報價單'}</EntityPageTitle></div>
      <div className="ml-auto flex gap-2"><Button variant="outline" className="border-red-200 bg-red-50 text-red-700" onClick={() => { window.location.hash = '/quotes' }}>返回列表</Button>{editor.editable && <><Button variant="outline" onClick={editor.reset}><RotateCcw />重置</Button><Button type="submit" form="quote-form"><Save />儲存草稿</Button></>}</div>
    </EntityPageHeader>
    <div className="mx-auto max-w-6xl space-y-5 py-6">
      {quote && version && <QuoteVersionManager quote={quote} selectedId={version.id} actor={vm.actor} dirty={editor.dirty} onSelect={onVersion} />}
      {quote && version && <div className="flex flex-wrap items-center gap-3 text-sm">
        <h2 className="font-semibold">版本內容 · v{version.version}</h2>
        <span className="rounded-md bg-muted px-3 py-2">{version.status}</span><span>審批：{version.approval}</span>
        {!editor.latest && <span className="text-muted-foreground">歷史版本，僅供查閱</span>}
        {!editor.editable && <span className="flex items-center gap-1 text-muted-foreground"><LockKeyhole size={14} />唯讀</span>}
      </div>}
      {quote && version && <QuoteActions quote={quote} version={version} actor={vm.actor} dirty={editor.dirty} />}
      {version?.approvalReason && <p className="rounded-lg border p-3 text-sm">審批意見：{version.approvalReason}</p>}
      {version?.decisionAt && <p className="rounded-lg border p-3 text-sm">客戶決策：{version.status} · {version.decisionBy} · {new Date(version.decisionAt).toLocaleString('zh-TW')}<br />原因／備註：{version.decisionReason || '未填寫'}</p>}
      <p className="rounded-lg bg-muted/40 p-3 text-xs leading-relaxed">任何明細折扣超過 {quotePolicy.discountThresholdPercent}%，或含稅總額超過 {money(quotePolicy.totalThreshold * 100)}，須主管批准後才能送出。有效期限以台北時間當日 23:59:59 為止。{(requiresQuoteApproval(d) || version?.requiresReapproval) && <strong className="ml-1 text-amber-700">此版本需要審批。</strong>}</p>
      <form id="quote-form" className="space-y-5" onSubmit={event => { event.preventDefault(); editor.save() }}>
        <Card><CardHeader><CardTitle>報價基本資料</CardTitle></CardHeader><CardContent><fieldset disabled={!editor.editable} className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2"><Label htmlFor="quote-name">報價名稱 *</Label><Input id="quote-name" required value={d.name} onChange={e => editor.update('name', e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="quote-until">有效期限 *</Label><Input id="quote-until" type="date" required value={d.validUntil} onChange={e => editor.update('validUntil', e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="quote-customer">客戶 *</Label><Lookup id="quote-customer" label="客戶" disabled={!editor.editable} value={d.customerId} options={vm.customers.map(c => ({ value: c.id ?? '', label: c.name ?? '' }))} onValueChange={value => editor.update('customerId', value)} /></div>
          <div className="space-y-2"><Label htmlFor="quote-opportunity">來源商機</Label><Lookup id="quote-opportunity" label="來源商機" disabled={!editor.editable} value={d.opportunityId} options={[{ value: '', label: '無' }, ...vm.opportunities.filter(o => o.customerId === d.customerId).map(o => ({ value: o.id, label: o.name }))]} onValueChange={value => editor.update('opportunityId', value)} /></div>
        </fieldset></CardContent></Card>
        <QuoteLines editor={editor} products={vm.products} />
        <Card><CardHeader><CardTitle>報價條款</CardTitle></CardHeader><CardContent><fieldset disabled={!editor.editable} className="grid gap-5 sm:grid-cols-2">{([{ key: 'paymentTerms', label: '付款條件' }, { key: 'deliveryTerms', label: '交貨條件' }, { key: 'warranty', label: '保固' }, { key: 'notes', label: '備註' }] as const).map(field => <div key={field.key} className="space-y-2"><Label htmlFor={`quote-${field.key}`}>{field.label}</Label><textarea id={`quote-${field.key}`} className="min-h-24 w-full rounded-lg border bg-transparent p-3 text-sm disabled:opacity-70" value={d[field.key]} onChange={e => editor.update(field.key, e.target.value)} /></div>)}</fieldset></CardContent></Card>
        <p role="alert" className="text-sm text-destructive">{editor.error}</p>
      </form>
      {quote && <QuoteAudit quote={quote} />}
    </div>
  </>
}
