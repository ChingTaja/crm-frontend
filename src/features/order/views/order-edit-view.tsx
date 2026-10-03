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
  return (
    <div className="space-y-5 py-6">
      <AppLink href="/orders" className="underline">
        返回訂單列表
      </AppLink>
      {vm.error && (
        <div role="alert" className="text-destructive">
          {vm.error.message}{' '}
          <Button onClick={vm.reload} disabled={vm.isSaving || vm.isLoading}>
            重新載入
          </Button>
        </div>
      )}
      {vm.isLoading && <p role="status">載入訂單…</p>}
      {order && (
        <>
          <h1 className="text-xl font-semibold">
            {order.number} · {order.name}
          </h1>
          <p>
            客戶：{order.customerName} · 狀態：{statusLabel(order.status)}
          </p>
          <p>
            來源報價：
            <AppLink className="underline" href={`/quotes/${order.quoteSource?.quoteId}/edit`}>
              {order.quoteSource?.quoteNumber} v{order.quoteSource?.quoteVersion}
            </AppLink>
          </p>
          <p className="text-sm text-muted-foreground">
            明細與條款為報價轉單時的快照，不可修改。完成訂單代表人工確認履約完成，不表示已付款。
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {order.allowedTransitions?.includes('Cancelled') && (
              <label className="text-sm">
                取消原因（取消時必填）
                <input
                  className="ml-2 rounded border p-2"
                  maxLength={10000}
                  value={vm.reason}
                  disabled={vm.isSaving}
                  onChange={(e) => vm.setReason(e.target.value)}
                />
              </label>
            )}
            {order.allowedTransitions?.map((status) => (
              <Button
                key={status}
                variant={status === 'Cancelled' ? 'destructive' : 'default'}
                disabled={vm.isSaving || vm.isLoading || (status === 'Cancelled' && !vm.reason.trim())}
                onClick={() => void vm.changeStatus(status)}
              >
                {status === 'Processing'
                  ? '開始處理'
                  : status === 'Completed'
                    ? '完成訂單'
                    : status === 'Cancelled'
                      ? '取消訂單'
                      : statusLabel(status)}
              </Button>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="text-left font-semibold">訂單明細（唯讀）</caption>
              <thead>
                <tr>
                  {['產品', 'SKU', '數量', '單價', '折扣', '稅率', '原價小計', '折扣金額', '稅金', '含稅小計'].map(
                    (v) => (
                      <th className="p-3" key={v}>
                        {v}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {order.lines?.map((line) => (
                  <tr className="border-t" key={line.id}>
                    {[
                      line.productName,
                      line.sku,
                      line.quantity,
                      amount(line.unitPrice == null ? undefined : line.unitPrice * 100),
                      `${line.discountPercent ?? 0}%`,
                      `${line.taxPercent ?? 0}%`,
                      amount(line.subtotalCents),
                      amount(line.discountCents),
                      amount(line.taxCents),
                      amount(line.totalCents),
                    ].map((v, i) => (
                      <td className="p-3" key={i}>
                        {v ?? '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            原價合計：{amount(order.totals?.subtotalCents)} · 折扣：{amount(order.totals?.discountCents)} · 稅金：
            {amount(order.totals?.taxCents)} · 含稅總額：{amount(order.totals?.totalCents)}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ['付款條件', order.paymentTerms],
              ['交貨條件', order.deliveryTerms],
              ['保固', order.warranty],
              ['備註', order.notes],
              ['取消原因', order.cancellationReason],
            ].map(([label, value]) => (
              <div key={label}>
                <h2 className="font-semibold">{label}</h2>
                <p className="whitespace-pre-wrap">{value || '—'}</p>
              </div>
            ))}
          </div>
          <h2 className="font-semibold">操作紀錄</h2>
          {order.audit?.map((event) => (
            <p key={event.id} className="text-sm">
              {event.at} · {event.actorName} · {event.action} ·{' '}
              {event.fromStatus ? `${statusLabel(event.fromStatus)} → ` : ''}
              {statusLabel(event.toStatus)} {event.reason}
            </p>
          ))}
        </>
      )}
    </div>
  );
}
