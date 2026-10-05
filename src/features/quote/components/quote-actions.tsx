import { Lookup } from '@/components/ui/lookup';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useQuoteActions } from '../view-models/use-quote-actions';
import type { Quote, QuoteActor, QuoteVersion } from '../models/quote-types';

export function QuoteActions({
  quote,
  version,
  actor,
  dirty,
  reviewOnly = false,
}: {
  quote: Quote;
  version: QuoteVersion;
  actor: QuoteActor | null;
  dirty: boolean;
  reviewOnly?: boolean;
}) {
  const vm = useQuoteActions(quote, version, actor);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {!reviewOnly && vm.canRequest && (
          <Button disabled={dirty || vm.working} onClick={vm.requestApproval}>
            提交審核
          </Button>
        )}
        {!reviewOnly && vm.canSend && (
          <Button disabled={dirty || vm.working} onClick={vm.send}>
            送出報價
          </Button>
        )}
        {!reviewOnly && vm.canConvert && (
          <Button disabled={vm.isConverting || dirty} onClick={vm.convertToOrder}>
            {quote.orderId ? '查看訂單' : '轉換訂單'}
          </Button>
        )}
        {vm.canReview && (
          <>
            <Button disabled={vm.working || dirty} onClick={() => vm.open('approve')}>
              批准
            </Button>
          </>
        )}
        {vm.canRejectReview && (
          <Button variant="destructive" disabled={vm.working || dirty} onClick={() => vm.open('deny')}>
            拒絕審核
          </Button>
        )}
        {!reviewOnly && vm.canDecide && (
          <>
            <Button disabled={vm.working || dirty} onClick={() => vm.open('accept')}>
              接受報價
            </Button>
            <Button variant="destructive" disabled={vm.working || dirty} onClick={() => vm.open('reject')}>
              拒絕報價
            </Button>
          </>
        )}
      </div>
      {version.reviewerId && (
        <p className="text-sm text-muted-foreground">審核人：{version.reviewerName || version.reviewerId}</p>
      )}
      <Dialog
        open={vm.requestOpen}
        onOpenChange={(open) => {
          if (!open) vm.closeRequest();
        }}
      >
        <DialogContent>
          <DialogTitle className="text-lg font-semibold">提交審核</DialogTitle>
          <DialogDescription className="mt-2 text-sm text-muted-foreground">
            選擇一位審核人。提交後，報價內容將鎖定至審核結束。
          </DialogDescription>
          <form
            className="mt-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              vm.searchReviewers();
            }}
          >
            <Input
              aria-label="搜尋審核人"
              placeholder="搜尋帳號或姓名"
              value={vm.reviewerSearch}
              disabled={vm.working}
              onChange={(e) => vm.setReviewerSearch(e.target.value)}
            />
            <Button type="submit" variant="outline" disabled={vm.working || vm.reviewerOptions.isLoading}>
              搜尋
            </Button>
          </form>
          <div className="my-4">
            <Lookup
              label="審核人"
              value={vm.reviewerId}
              disabled={vm.working || vm.reviewerOptions.isLoading}
              options={(vm.reviewerOptions.data ?? [])
                .filter((option) => option.id !== actor?.id && option.id !== version.createdBy)
                .map((option) => ({
                  value: option.id,
                  label: option.displayName ? `${option.displayName}（${option.username}）` : option.username,
                }))}
              onValueChange={vm.setReviewerId}
            />
          </div>
          {vm.reviewerOptions.isLoading && <p role="status">載入審核人…</p>}
          {!vm.reviewerOptions.isLoading &&
            !vm.reviewerOptions.error &&
            !vm.reviewerOptions.data?.filter((option) => option.id !== actor?.id && option.id !== version.createdBy)
              .length && <p className="text-sm text-muted-foreground">沒有可選的審核人。</p>}
          {(vm.error || vm.reviewerOptions.error) && (
            <p role="alert" className="text-sm text-destructive">
              {vm.error || vm.reviewerOptions.error?.message}
            </p>
          )}
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline" disabled={vm.working} onClick={vm.closeRequest}>
              取消
            </Button>
            <Button
              disabled={
                dirty || vm.working || vm.reviewerOptions.isLoading || !!vm.reviewerOptions.error || !vm.reviewerId
              }
              onClick={() => void vm.submitReview()}
            >
              {vm.working ? '提交中…' : '確認提交'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {dirty && <p className="text-xs text-muted-foreground">請先儲存或重置修改。</p>}
      <p role="alert" className="text-sm text-destructive">
        {vm.error}
      </p>
      <Dialog
        open={vm.decision !== null}
        onOpenChange={(next) => {
          if (!next) vm.close();
        }}
      >
        <DialogContent>
          <DialogTitle className="text-lg font-semibold">{vm.decisionLabel}</DialogTitle>
          <DialogDescription className="mt-2 text-sm text-muted-foreground">
            {quote.number} v{version.version}。{vm.needsReason ? '請填寫拒絕原因。' : '請確認此操作。'}
          </DialogDescription>
          <form
            className="mt-4 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              vm.confirm();
            }}
          >
            <Label htmlFor="quote-decision-reason">{vm.needsReason ? '原因 *' : '備註（選填）'}</Label>
            <textarea
              id="quote-decision-reason"
              className="min-h-24 w-full rounded-lg border p-3 text-sm"
              value={vm.reason}
              required={vm.needsReason}
              onChange={(event) => vm.setReason(event.target.value)}
            />
            <p role="alert" className="text-sm text-destructive">
              {vm.error}
            </p>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={vm.close}>
                取消
              </Button>
              <Button type="submit" disabled={vm.working}>
                {vm.working ? '處理中…' : '確認'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
