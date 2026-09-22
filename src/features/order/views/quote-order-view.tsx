import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { EntityPageHeader, EntityPageTitle } from '@/components/layout/entity-page-header'
import type { Order } from '@/features/order/models/order-model';
import { QuoteTotals } from '../../quote/components/quote-lines'
import { money, quoteLineTotals } from '../../quote/models/quote-policy'

export function QuoteOrderView({ order }: { order: Order }) {
  const source = order.quoteSource!
  return <>
    <EntityPageHeader><EntityPageTitle>{order.name}</EntityPageTitle><Button variant="outline" onClick={() => { window.location.hash = '/orders' }}>返回訂單</Button></EntityPageHeader>
    <div className="mx-auto max-w-5xl space-y-5 py-6">
      <p className="rounded-lg bg-muted p-3 text-sm">來源：<a className="underline" href={`#/quotes/${source.quoteId}/edit`}>{source.number} v{source.version}</a>。此訂單保留已接受報價的明細、折扣、稅金及條款快照，目前為唯讀。</p>
      <Card><CardHeader><CardTitle>訂單明細 · {order.status}</CardTitle></CardHeader><CardContent className="space-y-5">
        <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr>{['商品', '數量', '單價', '折扣', '稅率', '小計'].map(label => <th key={label} className="border-b p-3">{label}</th>)}</tr></thead><tbody>{source.lines.map(line => <tr key={line.id}><td className="border-b p-3">{line.productName}<small className="block text-muted-foreground">{line.sku}</small></td><td className="border-b p-3">{line.quantity}</td><td className="border-b p-3">{money(line.unitPrice * 100)}</td><td className="border-b p-3">{line.discountPercent}%</td><td className="border-b p-3">{line.taxPercent}%</td><td className="border-b p-3">{money(quoteLineTotals(line).totalCents)}</td></tr>)}</tbody></table></div>
        <QuoteTotals lines={source.lines} />
      </CardContent></Card>
      <Card><CardHeader><CardTitle>訂單條款</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2">{[['付款條件', source.paymentTerms], ['交貨條件', source.deliveryTerms], ['保固', source.warranty], ['備註', source.notes]].map(([label, value]) => <div key={label}><h3 className="mb-2 text-sm font-medium">{label}</h3><p className="whitespace-pre-wrap text-sm text-muted-foreground">{value || '—'}</p></div>)}</CardContent></Card>
    </div>
  </>
}
