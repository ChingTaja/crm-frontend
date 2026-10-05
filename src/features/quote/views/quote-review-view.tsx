import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCheck, ClipboardCheck, FileText, LoaderCircle, RefreshCw } from 'lucide-react';
import { useApi } from '@/hooks/use-api';
import { usePaginatedQuery } from '@/hooks/use-paginated-query';
import { useAccess } from '@/features/access/view-models/use-access';
import { AppLink } from '@/components/ui/app-link';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { quoteReviewApi } from '../models/quote-review-service';
import type { Quote } from '../models/quote-types';
import { QuoteAudit } from '../components/quote-audit';
import { QuoteActions } from '../components/quote-actions';
import { money } from '../models/quote-policy';

const panel = 'rounded-2xl border bg-card shadow-sm';
function ApprovalBadge({ approval }: { approval?: string }) {
  const labels: Record<string, string> = {
    Pending: '待審核',
    Approved: '已批准',
    Rejected: '已拒絕',
    Required: '待送審',
    NotRequired: '無需審核',
  };
  const color =
    approval === 'Approved'
      ? 'bg-emerald-50 text-emerald-700'
      : approval === 'Rejected'
        ? 'bg-red-50 text-red-700'
        : 'bg-amber-50 text-amber-700';
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-medium ${color}`}>
      {labels[approval ?? ''] ?? approval ?? '—'}
    </span>
  );
}
function LoadingState() {
  return (
    <div
      role="status"
      className={`${panel} flex min-h-48 items-center justify-center gap-3 text-sm text-muted-foreground`}
    >
      <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
      載入報價資料…
    </div>
  );
}
function ErrorState({ message, reload }: { message: string; reload: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-destructive/20 bg-destructive/5 p-5"
    >
      <p className="text-sm text-destructive">{message}</p>
      <Button variant="outline" onClick={reload}>
        <RefreshCw aria-hidden="true" />
        重新載入
      </Button>
    </div>
  );
}
function ReviewList() {
  const query = usePaginatedQuery(quoteReviewApi.list);
  const reload = () => {
    void query.reload().catch(() => {});
  };
  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ClipboardCheck aria-hidden="true" className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">待我審核</h1>
            <p className="mt-1 text-sm text-muted-foreground">查看指派給你的報價，確認內容後完成審核。</p>
          </div>
        </div>
        <Button variant="outline" disabled={query.isLoading} onClick={reload}>
          <RefreshCw aria-hidden="true" className={query.isLoading ? 'animate-spin' : ''} />
          重新整理
        </Button>
      </header>
      {query.error && <ErrorState message={query.error.message} reload={reload} />}
      <section className={panel} aria-label="待審核報價">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="font-semibold">
            審核待辦{' '}
            <span className="ml-2 rounded-md bg-muted px-2 py-1 text-xs tabular-nums text-muted-foreground">
              {query.data?.totalElements ?? '—'}
            </span>
          </h2>
          <span className="text-xs text-muted-foreground">依送審時間排序</span>
        </div>
        {query.isLoading ? (
          <div role="status" className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            載入待辦中…
          </div>
        ) : (
          <div className="divide-y">
            {query.records.map((q) => (
              <AppLink
                key={q.id}
                href={`/quote-reviews/${encodeURIComponent(q.id ?? '')}/edit`}
                className="group flex flex-col gap-4 px-6 py-5 transition-colors hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-primary sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 flex-1 items-start gap-4">
                  <div className="mt-1 hidden rounded-xl bg-muted p-3 text-muted-foreground sm:block">
                    <FileText aria-hidden="true" className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs font-medium tracking-wide text-muted-foreground">{q.number}</span>
                      <ApprovalBadge approval={q.approval} />
                    </div>
                    <h3 className="mt-2 break-words font-semibold">{q.name || '未命名報價'}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {q.customerName || '未提供客戶名稱'}
                      <span className="mx-2">·</span>版本 {q.version}
                      <span className="mx-2">·</span>有效期限 {q.validUntil || '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-6 sm:justify-end">
                  <div className="sm:text-right">
                    <p className="text-xs text-muted-foreground">含稅總額 · {q.currency || 'TWD'}</p>
                    <p className="mt-1 text-lg font-semibold tabular-nums">
                      {q.totalCents == null ? '—' : money(q.totalCents)}
                    </p>
                  </div>
                  <span className="flex items-center gap-2 text-sm font-medium text-primary">
                    查看審核
                    <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </AppLink>
            ))}
          </div>
        )}
        {!query.isLoading && !query.error && !query.records.length && (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary">
              <CheckCheck aria-hidden="true" className="size-7" />
            </div>
            <h3 className="font-semibold">目前沒有待審核報價</h3>
            <p className="mt-2 text-sm text-muted-foreground">新的報價指派給你後，會顯示在這裡。</p>
          </div>
        )}
        {!!query.records.length && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t px-6 py-4">
            <p className="text-xs text-muted-foreground">共 {query.pagination.total} 筆待辦</p>
            <Pagination
              page={query.pagination.page}
              pageCount={query.pagination.pageCount}
              onPageChange={query.pagination.setPage}
            />
          </div>
        )}
      </section>
    </>
  );
}
function ReviewDetail({ id }: { id: string }) {
  const { me } = useAccess();
  const { execute, cancel, data, error, isLoading } = useApi(quoteReviewApi.get);
  const [reviewed, setReviewed] = useState<Quote>();
  const [versionId, setVersionId] = useState('');
  useEffect(() => {
    void execute(id)
      .then(() => setReviewed(undefined))
      .catch(() => {});
    return cancel;
  }, [id, execute, cancel]);
  const reload = () => {
    void execute(id)
      .then(() => setReviewed(undefined))
      .catch(() => {});
  };
  const quote = reviewed ?? data;
  const back = (
    <AppLink
      href="/quote-reviews"
      className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft aria-hidden="true" className="size-4" />
      返回待我審核
    </AppLink>
  );
  if (error)
    return (
      <>
        {back}
        <ErrorState message={error.message} reload={reload} />
      </>
    );
  if (!data || !quote || isLoading)
    return (
      <>
        {back}
        <LoadingState />
      </>
    );
  const version = quote.versions.find((v) => v.id === versionId) ?? quote.versions[quote.versions.length - 1];
  const canReview = version.allowedActions?.some((action) => action === 'approve' || action === 'reject-approval');
  return (
    <>
      {back}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{quote.number}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{version.name || '未命名報價'}</h1>
          <div className="mt-3 flex items-center gap-3">
            <ApprovalBadge approval={version.approval} />
            <span className="text-xs text-muted-foreground">版本 {version.version}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            版本
            <select
              aria-label="查看審核版本"
              value={version.id}
              onChange={(event) => setVersionId(event.target.value)}
              className="rounded-lg border bg-card px-3 py-2 text-foreground"
            >
              {quote.versions.map((v) => (
                <option key={v.id} value={v.id}>
                  版本 {v.version}
                </option>
              ))}
            </select>
          </label>
          <Button variant="outline" onClick={reload}>
            <RefreshCw aria-hidden="true" />
            重新載入
          </Button>
        </div>
      </header>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-6">
          <section className={panel}>
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="font-semibold">報價明細</h2>
              <span className="text-xs text-muted-foreground">{version.lines.length} 項商品</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap text-left text-sm">
                <caption className="sr-only">版本 {version.version} 的商品與價格明細</caption>
                <thead className="bg-muted/40 text-xs text-muted-foreground">
                  <tr>
                    {['商品 / SKU', '數量', '單價', '折扣', '稅率'].map((label, index) => (
                      <th scope="col" className={`px-5 py-3 font-medium ${index ? 'text-right' : ''}`} key={label}>
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {version.lines.map((line) => (
                    <tr key={line.id} className="hover:bg-muted/20">
                      <td className="px-5 py-4">
                        <p className="font-medium">{line.productName}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{line.sku || '—'}</p>
                      </td>
                      <td className="px-5 py-4 text-right tabular-nums">{line.quantity}</td>
                      <td className="px-5 py-4 text-right tabular-nums">{money(line.unitPrice * 100)}</td>
                      <td className="px-5 py-4 text-right tabular-nums">
                        <span
                          className={
                            line.discountPercent > 10
                              ? 'rounded-md bg-amber-50 px-2 py-1 font-medium text-amber-700'
                              : ''
                          }
                        >
                          {line.discountPercent}%
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right tabular-nums">{line.taxPercent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t bg-muted/30 px-6 py-5">
              <span className="text-sm text-muted-foreground">含稅總額 · TWD</span>
              <span className="text-xl font-semibold tabular-nums">
                {version.totals?.totalCents == null ? '—' : money(version.totals.totalCents)}
              </span>
            </div>
          </section>
          <section className={panel}>
            <h2 className="border-b px-6 py-4 font-semibold">報價條件</h2>
            <dl className="grid gap-6 p-6 sm:grid-cols-2">
              {[
                ['付款條件', version.paymentTerms],
                ['交貨條件', version.deliveryTerms],
                ['保固', version.warranty],
                ['備註', version.notes],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed">{value || '—'}</dd>
                </div>
              ))}
            </dl>
          </section>
          <QuoteAudit quote={quote} />
        </div>
        <aside className={`${panel} space-y-5 p-6 lg:sticky lg:top-6`} aria-label="審核資訊與操作">
          <div>
            <h2 className="font-semibold">審核資訊</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              確認商品、折扣與報價條件後，再進行審核。
            </p>
          </div>
          <dl className="space-y-4 text-sm">
            {[
              ['審核人', version.reviewerName || '—'],
              [
                '送審時間',
                version.approvalRequestedAt
                  ? new Date(version.approvalRequestedAt).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })
                  : '—',
              ],
              ['有效期限', version.validUntil || '—'],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="mt-1 break-words font-medium">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="border-t pt-5">
            {!canReview && (
              <p className="mb-3 rounded-lg bg-muted p-3 text-xs leading-relaxed text-muted-foreground">
                此版本目前無可執行的審核操作。
              </p>
            )}
            <QuoteActions
              key={version.id}
              reviewOnly
              onReviewed={setReviewed}
              quote={quote}
              version={version}
              actor={me ? { id: me.id, name: me.username, role: 'system', permissionCodes: me.permissionCodes } : null}
              dirty={false}
            />
          </div>
          {version.approvalReason && (
            <div className="border-t pt-5">
              <h3 className="text-xs text-muted-foreground">審核意見</h3>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed">{version.approvalReason}</p>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
export function QuoteReviewView({ recordId }: { recordId?: string }) {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-8 sm:py-8">
      {recordId ? <ReviewDetail key={recordId} id={recordId} /> : <ReviewList />}
    </main>
  );
}
