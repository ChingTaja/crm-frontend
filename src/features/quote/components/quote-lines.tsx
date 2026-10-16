import { availableQuoteProducts } from '../models/quote-pricing';
import { ValidatedGroup } from '@/components/entity/validated-group';
import { useEffect } from 'react';
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

export function QuoteTotals({
  lines,
  snapshot,
  currency = 'TWD',
  preview = true,
}: {
  lines: QuoteLine[];
  snapshot?: ApiQuoteTotals;
  currency?: string;
  preview?: boolean;
}) {
  const totals: ApiQuoteTotals = snapshot ?? (preview ? quoteTotals(lines) : {});
  return (
    <dl className="ml-auto grid w-full max-w-sm grid-cols-2 gap-3 text-sm">
      <dt>未稅原價</dt>
      <dd className="text-right">{totals.subtotalCents == null ? '—' : money(totals.subtotalCents, currency)}</dd>
      <dt>折扣</dt>
      <dd className="text-right">− {totals.discountCents == null ? '—' : money(totals.discountCents, currency)}</dd>
      <dt>稅金</dt>
      <dd className="text-right">{totals.taxCents == null ? '—' : money(totals.taxCents, currency)}</dd>
      <dt className="border-t pt-3 font-semibold">含稅總金額</dt>
      <dd className="border-t pt-3 text-right text-lg font-semibold">
        {totals.totalCents == null ? '—' : money(totals.totalCents, currency)}
      </dd>
    </dl>
  );
}
export function QuoteLines({ editor, products }: { editor: QuoteEditor; products: Required<ProductResponse>[] }) {
  const { data: currencies, error, isLoading, execute, cancel } = useApi(currencyApi.list);
  useEffect(() => {
    void execute().catch(() => {});
    return cancel;
  }, [execute, cancel]);
  const currency = editor.draft.currency;
  const options = (currencies ?? [])
    .filter((item) => item.active && item.fractionDigits === 2)
    .map((item) => ({ value: item.code, label: `${item.code} · ${item.name}` }));
  if (!options.some((item) => item.value === currency)) options.push({ value: currency, label: currency });
  return (
    <ValidatedGroup
      name="lines"
      validate={() => (editor.editable && !editor.draft.lines.length ? '請至少新增一筆商品明細。' : '')}
    >
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
          <div className="max-w-sm space-y-2">
            <p id="quote-currency-label" className="text-sm font-medium">
              報價幣別 *
            </p>
            {editor.editable ? (
              <Lookup
                id="quote-currency"
                name="currency"
                required
                label="報價幣別"
                value={currency}
                options={options}
                disabled={isLoading || !!error || !currencies}
                onValueChange={(value) => {
                  if (
                    value !== currency &&
                    window.confirm('變更整張報價的幣別不會自動換匯，所有明細單價將清空，請重新確認並填寫。是否繼續？')
                  )
                    editor.update('currency', value);
                }}
              />
            ) : (
              <p aria-labelledby="quote-currency-label">{currency || '幣別未提供'}</p>
            )}
            <p className="text-xs text-muted-foreground">
              所有明細共用報價幣別；產品參考價不代表已換算的交易單價，請逐筆填寫確認。
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead>
                <tr>
                  {['商品', '數量', `單價（${currency}）`, '折扣 %', '稅率 %', '含稅小計', ''].map((label) => (
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
                          name={`lines[${index}].productId`}
                          required
                          label={`第 ${index + 1} 筆商品`}
                          value={line.productId}
                          options={availableQuoteProducts(products, editor.draft.lines, line.id).map((p) => ({
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
                        {line.sku || '尚未選擇'} · 參考價{' '}
                        {new Intl.NumberFormat('zh-TW', { maximumFractionDigits: 2 }).format(line.catalogPrice)}
                      </p>
                    </td>
                    {(['quantity', 'unitPrice', 'discountPercent', 'taxPercent'] as const).map((field) => (
                      <td key={field} className="w-28 border-b px-2 py-3">
                        {editor.editable ? (
                          <Input
                            name={`lines[${index}].${field}`}
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
                    ))}
                    <td className="whitespace-nowrap border-b px-2 py-3">
                      {money(quoteLineTotals(line).totalCents, currency)}
                    </td>
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
          {error && (
            <div role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
              無法載入幣別，目前保留 {currency}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  void execute().catch(() => {});
                }}
              >
                重試
              </Button>
            </div>
          )}
          <p className="text-xs text-muted-foreground">整張報價共用 {currency}，變更幣別後需重新填寫單價</p>
          {!editor.draft.lines.length && <p className="text-sm text-muted-foreground">尚無明細。</p>}
          <QuoteTotals
            lines={editor.draft.lines}
            snapshot={editor.totals}
            currency={currency}
            preview={editor.editable}
          />
          <p className="text-xs text-muted-foreground">稅金按折後金額計算，金額四捨五入至小數點後兩位。</p>
        </CardContent>
      </Card>
    </ValidatedGroup>
  );
}
