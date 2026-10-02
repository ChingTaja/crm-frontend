import { navigate } from '@/lib/router';
import { AppLink } from '@/components/ui/app-link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { EntityPageHeader, EntityPageTitle } from '@/components/layout/entity-page-header';
import type { Order } from '@/features/order/models/order-model';
import { useOrderEditViewModel } from '../view-models/use-order-edit-view-model';
import { money, quoteLineTotals } from '../../quote/models/quote-policy';

export function QuoteOrderView({ order }: { order: Order }) {
  const source = order.quoteSource;
  const vm = useOrderEditViewModel(order);
  return (
    <>
      <EntityPageHeader>
        <EntityPageTitle>{order.name}</EntityPageTitle>
        <Button
          variant="outline"
          onClick={() => {
            navigate('/orders');
          }}
        >
          返回訂單
        </Button>
      </EntityPageHeader>
      <div className="mx-auto max-w-5xl space-y-5 py-6">
        <div className="rounded-lg border p-4 space-y-3">
          <p>訂單狀態：<strong>{order.status}</strong></p>
          <p className="text-sm text-muted-foreground">已確認 → 處理中 → 已完成；完成前可取消，已完成或已取消的訂單不可再變更。</p>
          <div className="flex gap-2">
            {vm.nextStatuses.map(status => (
              <Button key={status} variant={status === '已取消' ? 'destructive' : 'default'} onClick={() => vm.changeStatus(status)}>
                {status === '處理中' ? '開始處理' : status === '已完成' ? '完成訂單' : '取消訂單'}
              </Button>
            ))}
          </div>
          {vm.error && <p role="alert" className="text-sm text-destructive">{vm.error}</p>}
        </div>
        {source ? <>
        <p className="rounded-lg bg-muted p-3 text-sm">
          來源：
          <AppLink className="underline" href={`/quotes/${source.quoteId}/edit`}>
            {source.number} v{source.version}
          </AppLink>
          。此訂單保留已接受報價的明細、折扣、稅金及條款快照，不可修改。
        </p>
        <Card>
          <CardHeader>
            <CardTitle>訂單明細 · {order.status}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr>
                    {['商品', '數量', '單價', '折扣', '稅率', '小計'].map((label) => (
                      <th key={label} className="border-b p-3">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {source.lines.map((line) => (
                    <tr key={line.id}>
                      <td className="border-b p-3">
                        {line.productName}
                        <small className="block text-muted-foreground">{line.sku}</small>
                      </td>
                      <td className="border-b p-3">{line.quantity}</td>
                      <td className="border-b p-3">{money(line.unitPrice * 100)}</td>
                      <td className="border-b p-3">{line.discountPercent}%</td>
                      <td className="border-b p-3">{line.taxPercent}%</td>
                      <td className="border-b p-3">{money(quoteLineTotals(line).totalCents)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <dl className="ml-auto grid max-w-sm grid-cols-2 gap-3 text-sm">
              <dt>未稅原價</dt><dd className="text-right">{money(source.totals.subtotalCents)}</dd>
              <dt>折扣</dt><dd className="text-right">− {money(source.totals.discountCents)}</dd>
              <dt>稅金</dt><dd className="text-right">{money(source.totals.taxCents)}</dd>
              <dt className="font-semibold">含稅總金額</dt><dd className="text-right font-semibold">{money(source.totals.totalCents)}</dd>
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>訂單條款</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {[
              ['付款條件', source.paymentTerms],
              ['交貨條件', source.deliveryTerms],
              ['保固', source.warranty],
              ['備註', source.notes],
            ].map(([label, value]) => (
              <div key={label}>
                <h3 className="mb-2 text-sm font-medium">{label}</h3>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">{value || '—'}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        </> : <Card>
          <CardHeader><CardTitle>訂單明細（唯讀）</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">此筆舊訂單沒有報價來源，以下顯示原訂單保存的明細。</p>
            {order.items.map((line, index) => <p key={index}>產品 {line.productId} · 數量 {line.quantity} · 單價 {money(line.unitPrice * 100)}</p>)}
          </CardContent>
        </Card>}
      </div>
    </>
  );
}
