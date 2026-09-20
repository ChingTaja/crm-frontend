import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { quoteRepository } from '../models/quote-repository'
import type { Quote, QuoteActor, QuoteVersion } from '../models/quote-types'

type Decision = 'approve' | 'deny' | 'accept' | 'reject'
export function QuoteActions({ quote, version, actor, dirty, onVersion }: { quote: Quote; version: QuoteVersion; actor: QuoteActor; dirty: boolean; onVersion: (id: string) => void }) {
  const [decision, setDecision] = useState<Decision | null>(null)
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const latest = quote.versions[quote.versions.length - 1]?.id === version.id
  const act = (action: () => void) => { setError(''); try { action() } catch (error) { setError(error instanceof Error ? error.message : '操作失敗。') } }
  const open = (value: Decision) => { setDecision(value); setReason(''); setError('') }
  const labels = { approve: '主管批准', deny: '拒絕審批', accept: '接受報價', reject: '拒絕報價' }
  const needsReason = decision === 'deny' || decision === 'reject'
  return <div className="space-y-3">
    <div className="flex flex-wrap items-center gap-2">
      {latest && actor.role === 'sales' && <>
        {version.status === 'Draft' && ['Required', 'Rejected'].includes(version.approval) && <Button disabled={dirty} onClick={() => act(() => { quoteRepository.requestApproval(quote.id, version.id, actor) })}>提交主管審批</Button>}
        {version.status === 'Draft' && ['Approved', 'NotRequired'].includes(version.approval) && <Button disabled={dirty} onClick={() => act(() => { quoteRepository.send(quote.id, version.id, actor) })}>模擬送出報價</Button>}
        {version.status !== 'Accepted' && version.approval !== 'Pending' && !quote.orderId && <Button variant="outline" disabled={dirty} onClick={() => act(() => { const next = quoteRepository.newVersion(quote.id, version.id, actor); onVersion(next.versions[next.versions.length - 1]!.id) })}>建立 v{version.version + 1}</Button>}
        {version.status === 'Accepted' && <Button onClick={() => act(() => { const id = quoteRepository.convertToOrder(quote.id, version.id, actor); window.location.hash = `/orders/${id}/edit` })}>{quote.orderId ? '查看訂單' : '轉換訂單'}</Button>}
      </>}
      {latest && actor.role === 'manager' && version.status === 'Draft' && version.approval === 'Pending' && <><Button onClick={() => open('approve')}>批准</Button><Button variant="destructive" onClick={() => open('deny')}>拒絕審批</Button></>}
      {latest && actor.role === 'customer' && version.status === 'Sent' && <><Button onClick={() => open('accept')}>接受報價</Button><Button variant="destructive" onClick={() => open('reject')}>拒絕報價</Button></>}
    </div>
    {dirty && <p className="text-xs text-muted-foreground">請先儲存或重置修改，再執行審批、送出或新增版本。</p>}
    <p role="alert" className="text-sm text-destructive">{error}</p>
    <Dialog open={decision !== null} onOpenChange={next => { if (!next) setDecision(null) }}>
      <DialogContent><DialogTitle className="text-lg font-semibold">{decision ? labels[decision] : ''}</DialogTitle><DialogDescription className="mt-2 text-sm text-muted-foreground">{quote.number} v{version.version} · {actor.name}。{needsReason ? '請填寫拒絕原因。' : '確認後將更新狀態並記錄操作人及時間。'}</DialogDescription>
        <form className="mt-4 space-y-4" onSubmit={event => { event.preventDefault(); act(() => {
          if (decision === 'approve' || decision === 'deny') quoteRepository.review(quote.id, version.id, decision === 'approve', reason, actor)
          if (decision === 'accept' || decision === 'reject') quoteRepository.decide(quote.id, version.id, decision === 'accept', reason, actor)
          setDecision(null)
        }) }}>
          <Label htmlFor="quote-decision-reason">{needsReason ? '原因 *' : '備註（選填）'}</Label><textarea id="quote-decision-reason" className="min-h-24 w-full rounded-lg border p-3 text-sm" value={reason} required={needsReason} onChange={event => setReason(event.target.value)} />
          <p role="alert" className="text-sm text-destructive">{error}</p>
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setDecision(null)}>取消</Button><Button type="submit">確認</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  </div>
}
