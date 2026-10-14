import { Fragment, useEffect } from 'react';
import { useApi } from '@/hooks/use-api';
import { currencyApi } from '@/features/currency/models/currency-service';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lookup } from '@/components/ui/lookup';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { ProductResponse, QuoteTotals as ApiQuoteTotals } from '../../../api/Api';
import type { QuoteEditor } from '../view-models/use-quote-editor';
import { money, quoteLineTotals, quoteTotals } from '../models/quote-policy';
import type { QuoteLine } from '../models/quote-types';

export function QuoteTotals({ lines, snapshot, currency = 'TWD' }: { lines: QuoteLine[]; snapshot?: ApiQuoteTotals; currency?: string }) {
  const totals = snapshot ?? quoteTotals(lines);
  return (
    <dl className="ml-auto grid w-full max-w-sm grid-cols-2 gap-3 text-sm">
      <dt>未稅原價</dt>
      <dd className="text-right">{totals.subtotalCents == null ? '—' : money(totals.subtotalCents, currency)}</dd>
      <dt>折扣</dt>
      <dd className="text-right">− {totals.discountCents == null ? '—' : money(totals.discountCents, currency)}</dd>
      <dt>稅金</dt>
      <dd className="text-right">{totals.taxCents == null ? '—' : money(totals.taxCents, currency)}</dd>
      <dt className="border-t pt-3 font-semibold">含稅總金額</dt>
      <dd className="border-t pt-3 text-right text-lg font-semibold">{totals.totalCents == null ? '—' : money(totals.totalCents, currency)}</dd>
    </dl>
  );
}
export function QuoteLines({ editor, products }: { editor: QuoteEditor; products: Required<ProductResponse>[] }) {
  const { data: currencies, error, isLoading, execute, cancel } = useApi(currencyApi.list);
  useEffect(() => { void execute().catch(() => {}); return cancel; }, [execute, cancel]);
  const currency = editor.draft.currency;
  const options = (currencies ?? []).filter(item => item.active && item.fractionDigits === 2)
    .map(item => ({ value: item.code, label: `${item.code} · ${item.name}` }));
  if (!options.some(item => item.value === currency)) options.push({ value: currency, label: currency });
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>報價明細</CardTitle>
        {editor.editable && (
          <Button type="button" variant="outline" onClick={editor.addLine}>
            <Plus />
            新增商品
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead>
              <tr>
                {['商品', '數量', '單價', '幣別', '折扣 %', '稅率 %', '含稅小計', ''].map((label) => (
                  <th key={label} className="border-b px-2 py-3 font-medium text-muted-foreground">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {editor.draft.lines.map((line, index) => (
                <tr key={line.id}>
                  <td className="min-w-56 border-b px-2 py-3">
                    {editor.editable ? (
                      <Lookup
                        label={`第 ${index + 1} 筆商品`}
                        value={line.productId}
                        options={products
                          .filter((p) => p.status === '啟用' || p.id === line.productId)
                          .map((p) => ({
                            value: p.id,
                            label: p.id === line.productId ? line.productName : p.name,
                            keywords: p.sku,
                          }))}
                        onValueChange={(id) => {
                          const product = products.find((p) => p.id === id);
                          if (product) editor.selectProduct(line.id, product);
                        }}
                      />
                    ) : (
                      <p>{line.productName}</p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {line.sku || '尚未選擇'} · 原定價 {money(line.catalogPrice * 100, 'TWD')}
                    </p>
                  </td>
                  {(['quantity', 'unitPrice', 'discountPercent', 'taxPercent'] as const).map((field) => (
                    <Fragment key={field}><td className="w-28 border-b px-2 py-3">
                      {editor.editable ? (
                        <Input
                          aria-label={`第 ${index + 1} 筆${{ quantity: '數量', unitPrice: '單價', discountPercent: '折扣', taxPercent: '稅率' }[field]}`}
                          type="number"
                          required
                          min={field === 'quantity' ? 1 : 0}
                          max={field === 'discountPercent' || field === 'taxPercent' ? 100 : undefined}
                          step={field === 'quantity' ? 1 : 0.01}
                          value={Number.isFinite(line[field]) ? line[field] : ''}
                          onChange={(event) => editor.updateLine(line.id, field, event.target.valueAsNumber)}
                        />
                      ) : (
                        <span>{line[field]}</span>
                      )}
                    </td>
                      {field === 'unitPrice' && <td className="min-w-40 border-b px-2 py-3">
                        {editor.editable ? <Lookup
                          label={`第 ${index + 1} 筆幣別`}
                          value={currency}
                          options={options}
                          disabled={isLoading || !!error || !currencies}
                          onValueChange={value => {
                            if (value !== currency && window.confirm('變更幣別會套用整張報價，並清空單價供重新輸入，是否繼續？')) editor.update('currency', value);
                          }}
                        /> : currency}
                      </td>}
                    </Fragment>
                  ))}
                  <td className="whitespace-nowrap border-b px-2 py-3">{money(quoteLineTotals(line).totalCents, currency)}</td>
                  <td className="border-b px-2 py-3">
                    {editor.editable && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`移除第 ${index + 1} 筆`}
                        onClick={() => editor.removeLine(line.id)}
                      >
                        <Trash2 />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {error && <div role="status" className="flex items-center gap-2 text-sm text-muted-foreground">無法載入幣別，目前保留 {currency}<Button type="button" variant="outline" onClick={() => { void execute().catch(() => {}); }}>重試</Button></div>}
        <p className="text-xs text-muted-foreground">整張報價共用 {currency}，變更幣別後需重新填寫單價</p>
        {!editor.draft.lines.length && <p className="text-sm text-muted-foreground">尚無明細。</p>}
        <QuoteTotals lines={editor.draft.lines} snapshot={editor.totals} currency={currency} />
        <p className="text-xs text-muted-foreground">稅金按折後金額計算，金額四捨五入至小數點後兩位。</p>
      </CardContent>
    </Card>
  );
}
