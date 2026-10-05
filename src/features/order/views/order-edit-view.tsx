import { useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  History,
  Info,
  LoaderCircle,
  LockKeyhole,
  Package,
  RefreshCw,
  ShieldCheck,
  Truck,
  Wallet,
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AppLink } from '@/components/ui/app-link';
import { Button } from '@/components/ui/button';
import { useOrderEditViewModel } from '../view-models/use-order-edit-view-model';
import { orderStatusLabels } from '../models/order-api';
import type { UpdateOrderStatusRequest } from '../../../api/Api';

const amount = (cents?: number) =>
  cents == null ? '—' : `NT$ ${(cents / 100).toLocaleString('zh-TW', { minimumFractionDigits: 2 })}`;
const statusLabel = (status?: string) =>
  orderStatusLabels[status as UpdateOrderStatusRequest['status']] ?? status ?? '—';
export function OrderEditView({ id }: { id: string }) {
  const vm = useOrderEditViewModel(id);
  const order = vm.record;
  const [pendingStatus, setPendingStatus] = useState<UpdateOrderStatusRequest['status'] | null>(null);
  const panel = 'overflow-hidden rounded-2xl border bg-card shadow-sm';
  const statusColors: Record<string, string> = {
    Confirmed: 'bg-blue-50 text-blue-700 ring-blue-600/15',
    Processing: 'bg-amber-50 text-amber-700 ring-amber-600/15',
    Completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
    Cancelled: 'bg-red-50 text-red-700 ring-red-600/15',
  };
  const date = (value?: string) => {
    if (!value) return '—';
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
      ? value
      : parsed.toLocaleString('zh-TW', {
          timeZone: 'Asia/Taipei',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
  };
  const stages = ['Confirmed', 'Processing', 'Completed'];
  const currentStage = stages.indexOf(order?.status ?? '');
  return (
    <div className="mx-auto max-w-[1440px] space-y-6 py-6 sm:py-8">
      <div className="flex items-center justify-between gap-3">
        <AppLink
          href="/orders"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          返回訂單列表
        </AppLink>
        <Button variant="outline" onClick={vm.reload} disabled={vm.isSaving || vm.isLoading}>
          <RefreshCw aria-hidden="true" className={vm.isLoading ? 'animate-spin' : ''} />
          重新整理
        </Button>
      </div>
      {vm.error && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive"
        >
          {vm.error.message}
        </div>
      )}
      {vm.success && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          <CheckCircle2 aria-hidden="true" className="size-4" />
          {vm.success}
        </div>
      )}
      {vm.isLoading && (
        <div role="status" className={`${panel} flex items-center justify-center gap-3 py-16 text-muted-foreground`}>
          <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
          載入訂單資料…
        </div>
      )}
      {order && !vm.isLoading && (
        <>
          <header className={`${panel} p-5 sm:p-7`}>
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="flex min-w-0 items-start gap-4">
                <div className="hidden size-12 shrink-0 items-center justify-center rounded-xl bg-muted sm:flex">
                  <Package aria-hidden="true" className="size-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-xs font-medium tracking-wide text-muted-foreground">
                      訂單 / {order.number || '—'}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusColors[order.status ?? ''] ?? 'bg-muted text-muted-foreground ring-border'}`}
                    >
                      <span className="size-1.5 rounded-full bg-current" />
                      {statusLabel(order.status)}
                    </span>
                  </div>
                  <h1 className="mt-3 break-words text-2xl font-semibold tracking-tight sm:text-3xl">
                    {order.name || '未命名訂單'}
                  </h1>
                  <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 aria-hidden="true" className="size-4 shrink-0" />
                    <span className="break-words">{order.customerName || '未提供客戶名稱'}</span>
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {order.allowedTransitions?.map((status) => (
                  <Button
                    key={status}
                    size="lg"
                    variant={status === 'Cancelled' ? 'outline' : 'default'}
                    className={status === 'Cancelled' ? 'text-destructive hover:text-destructive' : ''}
                    disabled={vm.isSaving}
                    onClick={() => {
                      if (status === 'Cancelled' || status === 'Completed') setPendingStatus(status);
                      else void vm.changeStatus(status);
                    }}
                  >
                    {status === 'Completed' && <Check aria-hidden="true" />}
                    {status === 'Processing' && <Package aria-hidden="true" />}
                    {vm.isSaving
                      ? '更新中…'
                      : status === 'Processing'
                        ? '開始處理'
                        : status === 'Completed'
                          ? '完成訂單'
                          : status === 'Cancelled'
                            ? '取消訂單'
                            : statusLabel(status)}
                  </Button>
                ))}
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-5 border-t pt-5">
              {order.status === 'Cancelled' ? (
                <p className="flex items-center gap-2 text-sm text-destructive">
                  <Info aria-hidden="true" className="size-4" />
                  此訂單已取消
                </p>
              ) : (
                <ol aria-label="訂單處理進度" className="flex flex-wrap items-center gap-3 sm:gap-5">
                  {stages.map((status, index) => (
                    <li
                      key={status}
                      aria-current={order.status === status ? 'step' : undefined}
                      className="flex items-center gap-3 sm:gap-5"
                    >
                      {index > 0 && <span aria-hidden="true" className="h-px w-4 bg-border sm:w-8" />}
                      <span
                        className={`flex items-center gap-2 text-xs sm:text-sm ${index <= currentStage ? 'font-medium text-foreground' : 'text-muted-foreground'}`}
                      >
                        <span
                          className={`flex size-6 items-center justify-center rounded-full text-xs ${index <= currentStage ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                        >
                          {index < currentStage ? <Check aria-hidden="true" className="size-3.5" /> : index + 1}
                        </span>
                        {statusLabel(status)}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock3 aria-hidden="true" className="size-3.5" />
                建立於 {date(order.createdAt)}
              </p>
            </div>
          </header>
          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
            <div className="min-w-0 space-y-6">
              <section className={panel} aria-labelledby="order-lines-title">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 sm:px-6">
                  <h2 id="order-lines-title" className="flex items-center gap-2 font-semibold">
                    <Package aria-hidden="true" className="size-4 text-muted-foreground" />
                    訂單明細
                    <span className="ml-1 rounded-md bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
                      {order.lines?.length ?? 0} 項商品
                    </span>
                  </h2>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <LockKeyhole aria-hidden="true" className="size-3.5" />
                    報價快照
                  </span>
                </div>
                <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="訂單商品明細，可水平捲動">
                  <table className="w-full whitespace-nowrap text-left text-sm">
                    <caption className="sr-only">訂單商品、數量、價格、折扣及稅金明細</caption>
                    <thead className="bg-muted/50 text-xs text-muted-foreground">
                      <tr>
                        {['商品 / SKU', '數量', '單價', '折扣', '稅金', '原價小計', '含稅小計'].map((label, index) => (
                          <th
                            key={label}
                            scope="col"
                            className={`px-4 py-3 font-medium ${index ? 'text-right' : 'pl-6'}`}
                          >
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {order.lines?.map((line) => (
                        <tr key={line.id} className="transition-colors hover:bg-muted/30">
                          <td className="min-w-40 max-w-64 whitespace-normal py-5 pr-4 pl-6">
                            <p className="break-words font-medium">{line.productName || '未命名商品'}</p>
                            <p className="mt-1.5 break-all text-xs text-muted-foreground">{line.sku || '無 SKU'}</p>
                          </td>
                          <td className="px-4 py-5 text-right tabular-nums">{line.quantity ?? '—'}</td>
                          <td className="px-4 py-5 text-right tabular-nums">
                            {amount(line.unitPrice == null ? undefined : line.unitPrice * 100)}
                          </td>
                          <td className="px-4 py-5 text-right tabular-nums">
                            <p>{line.discountPercent ?? 0}%</p>
                            <p className="mt-1 text-xs text-muted-foreground">{amount(line.discountCents)}</p>
                          </td>
                          <td className="px-4 py-5 text-right tabular-nums">
                            <p>{line.taxPercent ?? 0}%</p>
                            <p className="mt-1 text-xs text-muted-foreground">{amount(line.taxCents)}</p>
                          </td>
                          <td className="px-4 py-5 text-right tabular-nums text-muted-foreground">
                            {amount(line.subtotalCents)}
                          </td>
                          <td className="px-4 py-5 text-right font-semibold tabular-nums">{amount(line.totalCents)}</td>
                        </tr>
                      ))}
                      {!order.lines?.length && (
                        <tr>
                          <td colSpan={7} className="px-6 py-14 text-center text-muted-foreground">
                            此訂單沒有明細。
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-start gap-2 border-t bg-muted/25 px-6 py-3 text-xs leading-relaxed text-muted-foreground">
                  <LockKeyhole aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                  明細與條款保留轉單時的報價內容，供訂單履行時核對。
                </div>
              </section>
              <section className={panel} aria-labelledby="order-terms-title">
                <h2 id="order-terms-title" className="flex items-center gap-2 border-b px-6 py-4 font-semibold">
                  <FileText aria-hidden="true" className="size-4 text-muted-foreground" />
                  交易條款
                </h2>
                <dl className="grid gap-6 p-6 sm:grid-cols-2">
                  {[
                    { label: '付款條件', value: order.paymentTerms, icon: Wallet },
                    { label: '交貨條件', value: order.deliveryTerms, icon: Truck },
                    { label: '保固', value: order.warranty, icon: ShieldCheck },
                    { label: '備註', value: order.notes, icon: FileText },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="min-w-0">
                      <dt className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <Icon aria-hidden="true" className="size-3.5" />
                        {label}
                      </dt>
                      <dd
                        className={`mt-3 whitespace-pre-wrap break-words text-sm leading-7 ${value ? '' : 'text-muted-foreground'}`}
                      >
                        {value || '未填寫'}
                      </dd>
                    </div>
                  ))}
                </dl>
                {order.cancellationReason && (
                  <div className="mx-6 mb-6 rounded-xl border border-destructive/15 bg-destructive/5 p-4">
                    <h3 className="text-xs font-medium text-destructive">取消原因</h3>
                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed">
                      {order.cancellationReason}
                    </p>
                  </div>
                )}
              </section>
              <section className={panel} aria-labelledby="order-audit-title">
                <h2 id="order-audit-title" className="flex items-center gap-2 border-b px-6 py-4 font-semibold">
                  <History aria-hidden="true" className="size-4 text-muted-foreground" />
                  操作紀錄
                </h2>
                {!order.audit?.length ? (
                  <p className="p-6 text-sm text-muted-foreground">尚無操作紀錄。</p>
                ) : (
                  <ol className="px-6 py-5">
                    {order.audit.map((event, index) => (
                      <li key={event.id ?? index} className="relative flex gap-4 pb-6 last:pb-0">
                        {index < (order.audit?.length ?? 0) - 1 && (
                          <span aria-hidden="true" className="absolute top-7 bottom-0 left-3.5 w-px bg-border" />
                        )}
                        <span className="relative flex size-7 shrink-0 items-center justify-center rounded-full border bg-muted/50">
                          <History aria-hidden="true" className="size-3.5 text-muted-foreground" />
                        </span>
                        <div className="min-w-0 flex-1 pt-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-medium">
                              {event.fromStatus ? `${statusLabel(event.fromStatus)} → ` : ''}
                              {event.toStatus ? statusLabel(event.toStatus) : event.action || '訂單更新'}
                            </p>
                            <time dateTime={event.at} className="text-xs text-muted-foreground">
                              {date(event.at)}
                            </time>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {event.actorName || '系統'}
                            {event.toStatus && event.action ? ` · ${event.action}` : ''}
                          </p>
                          {event.reason && (
                            <p className="mt-3 rounded-lg bg-muted/50 p-3 text-sm leading-relaxed whitespace-pre-wrap break-words">
                              {event.reason}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            </div>
            <aside className="space-y-5 xl:sticky xl:top-6" aria-label="訂單摘要">
              <section className={panel}>
                <h2 className="border-b px-6 py-4 font-semibold">金額摘要</h2>
                <div className="p-6">
                  <dl className="space-y-4 text-sm">
                    {(
                      [
                        ['原價合計', order.totals?.subtotalCents],
                        ['折扣金額', order.totals?.discountCents],
                        ['稅金', order.totals?.taxCents],
                      ] as const
                    ).map(([label, value]) => (
                      <div className="flex items-center justify-between gap-3" key={label}>
                        <dt className="text-muted-foreground">{label}</dt>
                        <dd className="tabular-nums">{amount(value)}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="mt-5 border-t pt-5">
                    <p className="text-xs text-muted-foreground">含稅總額 · {order.currency || 'TWD'}</p>
                    <p className="mt-2 break-words text-2xl font-semibold tracking-tight tabular-nums">
                      {amount(order.totals?.totalCents)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 border-t bg-amber-50/60 px-5 py-4 text-xs leading-5 text-amber-800">
                  <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                  <p>訂單完成僅表示處理完成，付款狀態需另行確認。</p>
                </div>
              </section>
              <section className={panel}>
                <h2 className="border-b px-6 py-4 font-semibold">來源報價</h2>
                <div className="p-5">
                  {order.quoteSource?.quoteId ? (
                    <AppLink
                      className="group flex items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/50"
                      href={`/quotes/${encodeURIComponent(order.quoteSource.quoteId)}/edit`}
                    >
                      <span className="rounded-lg bg-muted p-2">
                        <FileText aria-hidden="true" className="size-4 text-muted-foreground" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block break-all text-sm font-medium">
                          {order.quoteSource.quoteNumber || '查看報價單'}
                        </span>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          版本 {order.quoteSource.quoteVersion ?? '—'}
                        </span>
                      </span>
                      <ArrowUpRight
                        aria-hidden="true"
                        className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground"
                      />
                    </AppLink>
                  ) : (
                    <p className="text-sm text-muted-foreground">未提供來源報價</p>
                  )}
                  <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
                    <LockKeyhole aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                    報價明細與條款不可修改。
                  </p>
                </div>
              </section>
              <section className={`${panel} p-5`}>
                <h2 className="mb-4 text-sm font-semibold">訂單資訊</h2>
                <dl className="space-y-4">
                  {[
                    ['建立時間', order.createdAt],
                    ['更新時間', order.updatedAt],
                    ['開始處理', order.processingAt],
                    ['完成時間', order.completedAt],
                    ['取消時間', order.cancelledAt],
                  ]
                    .filter(([, value], index) => index < 2 || value)
                    .map(([label, value]) => (
                      <div key={label}>
                        <dt className="text-xs text-muted-foreground">{label}</dt>
                        <dd className="mt-1.5 text-sm tabular-nums">{date(value)}</dd>
                      </div>
                    ))}
                </dl>
              </section>
            </aside>
          </div>
        </>
      )}
      <Dialog
        open={pendingStatus !== null}
        onOpenChange={(open) => {
          if (!open && !vm.isSaving) setPendingStatus(null);
        }}
      >
        <DialogContent>
          <DialogTitle className="text-lg font-semibold">
            {pendingStatus === 'Cancelled' ? '取消訂單' : '完成訂單'}
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm text-muted-foreground">
            {order?.number} ·{' '}
            {pendingStatus === 'Cancelled'
              ? '請填寫取消原因並確認取消此訂單。'
              : '請確認此訂單已處理完成。完成訂單不代表已付款。'}
          </DialogDescription>
          <form
            className="mt-4 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (pendingStatus)
                void vm.changeStatus(pendingStatus).then((saved) => {
                  if (saved) setPendingStatus(null);
                });
            }}
          >
            {pendingStatus === 'Cancelled' && (
              <label className="block text-sm">
                取消原因 *
                <textarea
                  className="mt-2 min-h-24 w-full rounded border p-3"
                  required
                  maxLength={10000}
                  disabled={vm.isSaving}
                  value={vm.reason}
                  onChange={(event) => vm.setReason(event.target.value)}
                />
              </label>
            )}
            {vm.error && (
              <p role="alert" className="text-sm text-destructive">
                {vm.error.message}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" disabled={vm.isSaving} onClick={() => setPendingStatus(null)}>
                返回
              </Button>
              <Button
                type="submit"
                variant={pendingStatus === 'Cancelled' ? 'destructive' : 'default'}
                disabled={vm.isSaving || vm.isLoading || (pendingStatus === 'Cancelled' && !vm.reason.trim())}
              >
                {vm.isSaving ? '更新中…' : '確認'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
