import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Lookup } from '@/components/ui/lookup'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { Product } from '../../sales/models/sales-model'
import type { QuoteEditor } from '../view-models/use-quote-editor'
import { money, quoteLineTotals, quoteTotals } from '../models/quote-policy'
import type { QuoteLine } from '../models/quote-types'

export function QuoteTotals({ lines }: { lines: QuoteLine[] }) {
  const totals = quoteTotals(lines)
  return <dl className="ml-auto grid w-full max-w-sm grid-cols-2 gap-3 text-sm">
    <dt>未稅原價</dt><dd className="text-right">{money(totals.subtotalCents)}</dd>
    <dt>折扣</dt><dd className="text-right">− {money(totals.discountCents)}</dd>
    <dt>稅金</dt><dd className="text-right">{money(totals.taxCents)}</dd>
    <dt className="border-t pt-3 font-semibold">含稅總金額</dt><dd className="border-t pt-3 text-right text-lg font-semibold">{money(totals.totalCents)}</dd>
  </dl>
}
export function QuoteLines({ editor, products }: { editor: QuoteEditor; products: Product[] }) {
  return <Card>
    <CardHeader className="flex-row items-center justify-between"><CardTitle>報價明細</CardTitle>{editor.editable && <Button type="button" variant="outline" onClick={editor.addLine}><Plus />新增商品</Button>}</CardHeader>
    <CardContent className="space-y-6">
      <div className="overflow-x-auto"><table className="w-full min-w-[780px] text-left text-sm">
        <thead><tr>{['商品／價格快照', '數量', '單價', '折扣 %', '稅率 %', '含稅小計', ''].map(label => <th key={label} className="border-b px-2 py-3 font-medium text-muted-foreground">{label}</th>)}</tr></thead>
        <tbody>{editor.draft.lines.map((line, index) => <tr key={line.id}>
          <td className="min-w-56 border-b px-2 py-3">
            {editor.editable ? <Lookup label={`第 ${index + 1} 筆商品`} value={line.productId} options={products.filter(p => p.status === '啟用' || p.id === line.productId).map(p => ({ value: p.id, label: p.name, keywords: p.sku }))} onValueChange={id => { const product = products.find(p => p.id === id); if (product) editor.selectProduct(line.id, product) }} /> : <p>{line.productName}</p>}
            <p className="mt-1 text-xs text-muted-foreground">{line.sku || '尚未選擇'} · 目錄快照 {money(line.catalogPrice * 100)}</p>
          </td>
          {(['quantity', 'unitPrice', 'discountPercent', 'taxPercent'] as const).map(field => <td key={field} className="w-28 border-b px-2 py-3">{editor.editable ? <Input aria-label={`第 ${index + 1} 筆${{ quantity: '數量', unitPrice: '單價', discountPercent: '折扣', taxPercent: '稅率' }[field]}`} type="number" required min={field === 'quantity' ? 1 : 0} max={field === 'discountPercent' || field === 'taxPercent' ? 100 : undefined} step={field === 'quantity' ? 1 : 0.01} value={Number.isFinite(line[field]) ? line[field] : ''} onChange={event => editor.updateLine(line.id, field, event.target.valueAsNumber)} /> : <span>{line[field]}</span>}</td>)}
          <td className="whitespace-nowrap border-b px-2 py-3">{money(quoteLineTotals(line).totalCents)}</td>
          <td className="border-b px-2 py-3">{editor.editable && <Button type="button" variant="ghost" size="icon" aria-label={`移除第 ${index + 1} 筆`} onClick={() => editor.removeLine(line.id)}><Trash2 /></Button>}</td>
        </tr>)}</tbody>
      </table></div>
      {!editor.draft.lines.length && <p className="text-sm text-muted-foreground">新增商品後，系統會保存商品名稱、編號與當時價格。</p>}
      <QuoteTotals lines={editor.draft.lines} />
      <p className="text-xs text-muted-foreground">折扣按各明細原價計算，稅金按折後金額計算，每筆金額四捨五入至小數點後兩位。</p>
    </CardContent>
  </Card>
}
