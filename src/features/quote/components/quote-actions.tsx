import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useQuoteActions } from '../view-models/use-quote-actions'
import type { Quote, QuoteActor, QuoteVersion } from '../models/quote-types'

export function QuoteActions({ quote, version, actor, dirty }: { quote: Quote; version: QuoteVersion; actor: QuoteActor | null; dirty: boolean }) {
  const vm = useQuoteActions(quote, version, actor)
  return <div className="space-y-3">
    <div className="flex flex-wrap items-center gap-2">
      {vm.canRequest && <Button disabled={dirty} onClick={vm.requestApproval}>提交主管審批</Button>}
      {vm.canSend && <Button disabled={dirty} onClick={vm.send}>模擬送出報價</Button>}
      {vm.canConvert && <Button onClick={vm.convertToOrder}>{quote.orderId ? '查看訂單' : '轉換訂單'}</Button>}
      {vm.canReview && <><Button onClick={() => vm.open('approve')}>批准</Button><Button variant="destructive" onClick={() => vm.open('deny')}>拒絕審批</Button></>}
      {vm.canDecide && <><Button onClick={() => vm.open('accept')}>接受報價</Button><Button variant="destructive" onClick={() => vm.open('reject')}>拒絕報價</Button></>}
    </div>
    {dirty && <p className="text-xs text-muted-foreground">請先儲存或重置修改，再執行審批或送出。</p>}
    <p role="alert" className="text-sm text-destructive">{vm.error}</p>
    <Dialog open={vm.decision !== null} onOpenChange={next => { if (!next) vm.close() }}>
      <DialogContent><DialogTitle className="text-lg font-semibold">{vm.decisionLabel}</DialogTitle><DialogDescription className="mt-2 text-sm text-muted-foreground">{quote.number} v{version.version}。{vm.needsReason ? '請填寫拒絕原因。' : '確認後將更新狀態並記錄操作人及時間。'}</DialogDescription>
        <form className="mt-4 space-y-4" onSubmit={event => { event.preventDefault(); vm.confirm() }}>
          <Label htmlFor="quote-decision-reason">{vm.needsReason ? '原因 *' : '備註（選填）'}</Label><textarea id="quote-decision-reason" className="min-h-24 w-full rounded-lg border p-3 text-sm" value={vm.reason} required={vm.needsReason} onChange={event => vm.setReason(event.target.value)} />
          <p role="alert" className="text-sm text-destructive">{vm.error}</p>
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={vm.close}>取消</Button><Button type="submit">確認</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  </div>
}
